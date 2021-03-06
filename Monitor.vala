//<Script type="text/javascript">
//var Gio     = imports.gi.Gio;
//var GLib    = imports.gi.GLib;

//var XObject = imports.XObject.XObject;
//var File    = imports.File.File;

/// # valac  --pkg gio-2.0  --pkg posix Monitor.vala -o /tmp/Monitor

 
//using Gee; // for array list?
/*
static int main (string[] args) {
    // A reference to our file
    //var file = File.new_for_path ("data.txt");
    MainLoop loop = new MainLoop ();
    print("starting");
    var m = new Monitor();
    
    m.add("/home/alan/gitlive");
    m.start();
    loop.run ();

    return 0;

}
*/

public class  MonitorNamePathDir {
    public string action;
    public string name;
    public string path;
    public string dir;
    
    public MonitorNamePathDir(string name, string path, string dir)
    {
        this.name = name;
        this.path = path;
        this.dir = dir;
        this.action = "?";
        
    }
}



public delegate void onEventHander (FileMonitor fm, File f_orig, File of_orig, FileMonitorEvent event_type);


/**
 * Monitor class - handles monitor managment for a large tree...
 *
 *
 * This 
 * 
 * usage : 
 * x = new Monitor({
     change : function () {
         * ....
         *}
  }
 * x.add('/somepath')
 * x.stop() // stops all scanning.
 * x.play(); // starts the scanning
 * 
 * 
 * 
 * 
 */
 
public class Monitor : Object
{



    public Monitor()
    {
       
     
        this.monitors = new Array<FileMonitor> ();
        this.top = new Array<string> ();
        this.paused = false;
    }
     
    public Array<FileMonitor> monitors;// Array of MonitorNamePathDirileMonitors
    public Array<string> top; // list of top level directories..
    public bool paused;
    /**
     * add a directory or file to monitor
     */
    public void add (string add)
    {
        
        print("Monitor.add: " + add);
        this.top.append_val(add);
    }
    /**
     * start monitoring
     */
    public void start()
    {
        for(int i = 0; i < this.top.length ; i++) {
            this.monitor(this.top.index(i));
        }
    }
    /**
     * stop / pause monitoring
     * 
     */
    public void stop()
    {
        
        for(int i = 0; i < this.monitors.length ; i++) {
            this.monitors.index(i).cancel();
        } 
        this.monitors = new Array<FileMonitor>(); // clean /destroy/ kill old?
    }
    /**
     * pause monitoring - without changing what's monitored 
     */
    public void pause()
    {
        this.paused = true;
    }
    /**
     * resume monitoring - without changing what's monitored 
     */
    public void resume()
    {
        this.paused = false;
    }
    /**
     * monitor a file or directory (privatish)
     *
     * initially called with ~/gitlive  null 0 (effectvely)
     * 
     * 
     */
    public void monitor(string path, int depth = 0)
    {
         
        stdout.printf("ADD: (%d): %s\n", depth, path);
        
        //depth = typeof(depth) == 'number'  ? depth *1 : 0;
        depth = depth > 0  ? depth *1 : 0;
        
        
        //fn = fn || function (fm, f, of, event_type, uh) {
        //    _this.onEvent(fm, f, of, event_type, uh);
        //}
       
          
        var f = File.new_for_path(path);
            //var cancel = new Gio.Cancellable ();
        if (depth > 0) { 
  
            try {
  
                 var fm = f.monitor(FileMonitorFlags.SEND_MOVED,null); //Gio.FileMonitorFlags.SEND_MOVED
 
                 fm.changed.connect( this.onEvent );
                this.monitors.append_val(fm);

            } catch (Error e) {
                // FIXME -- show error? do nothing..            
            }
            // print("ADD path " + depth + ' ' + path);
        }
        // iterate children?
        // - this is not used.
        //if (GLib.file_test(path + '/.git' , GLib.FileTest.IS_DIR) && this.initRepo) {
            
        //    this.initRepo(path);
        //}
        FileEnumerator file_enum;
        var cancellable = new Cancellable ();
        try {      
            file_enum = f.enumerate_children(
               FileAttribute.STANDARD_DISPLAY_NAME + "," +   FileAttribute.STANDARD_TYPE,
        		FileQueryInfoFlags.NOFOLLOW_SYMLINKS,  // FileQueryInfoFlags.NONE,
               cancellable);
        } catch (Error e) {
            // FIXME - show error..
            return;
        }
        FileInfo next_file;
        
        while (cancellable.is_cancelled () == false ) {
            try {
                next_file = file_enum .next_file (cancellable);
            } catch(Error e) {
                print(e.message);
                break;
            }

            if (next_file == null) {
                break;
            }

            //print("got a file " + next_file.sudo () + '?=' + Gio.FileType.DIRECTORY);

            if (next_file.get_file_type() != FileType.DIRECTORY) {
                next_file = null;
                continue;
            }


            //stdout.printf("Monitor.monitor: got file %s : type :%u\n",
            //        next_file.get_display_name(), next_file.get_file_type());


            if (next_file.get_is_symlink()) {
                next_file = null;
                continue;
            }
            
            if (next_file.get_display_name()[0] == '.') {
                next_file = null;
                continue;
            }
            var sp = path+"/"+next_file.get_display_name();
            // skip modules.
            //print("got a file : " + sp);
         
            next_file = null;
            
            
            
            this.monitor(sp, depth + 1);
            
        }
        try {
            file_enum.close(null);
        } catch(Error e) {
            // ignore?
        }
    }
    
    
    
    public File realpath(File file)
    {
        if (file != null) {
            return file;
        }
        
        if (FileUtils.test(file.get_path(), FileTest.EXISTS)) {
            var rp = Posix.realpath(file.get_path());
            return File.new_for_path(rp);  
            
        }
        // file does not currently exist..
        // check parent.
        
// FIX ME - string split?/? 
        var bn = file.get_basename();
        var ar =  file.get_path().split("/");
        ar.resize(ar.length-1);
        var dirname = string.joinv("/",ar );
        var rp = Posix.realpath(dirname);
        return File.new_for_path(rp + "/" + bn);
        
    }
   
    
    
     
    public void onEvent(File f_orig, File? of_orig, FileMonitorEvent event_type)
    {
        if (this.paused) {
            return;
        }
       // print("onEvent\n");
        var f = this.realpath(f_orig);
        
 
        MonitorNamePathDir src = new MonitorNamePathDir( f.get_basename(), f.get_path() , Path.get_dirname(f.get_path()));
 
        
       
        //string event_name = "UKNOWN";
        
        
        // extract the event names ... - not sure if introspection is feasible in vala..
        //for(var i in Gio.FileMonitorEvent) {
         //    if (Gio.FileMonitorEvent[i] == event_type) {
         //        event_name = i;
         //    }
         //}
        



        //print (JSON.stringify([event_name , f.get_path(), of ? of.get_path() : false ] ));
        //print ("got src: " + src.toString());
        //print ("got event: " + src.toString());
        try {
                

            switch(event_type) {
                case FileMonitorEvent.CHANGED:
                    src.action = "changed";
                    this.onChanged(src);
                    return; // ingore thise?? -wait for changes_done_htin?
                    
                case FileMonitorEvent.CHANGES_DONE_HINT:
                    src.action = "changed";
                    this.onChangesDoneHint(src);
                    return;
                    
                case FileMonitorEvent.DELETED:
                    src.action = "rm";
                    this.onDeleted(src);
                    return;
                    
                case FileMonitorEvent.CREATED:
                    src.action = "created";
                    this.onCreated(src);
                    return;
                
                case FileMonitorEvent.ATTRIBUTE_CHANGED: // eg. chmod/chatt
                    src.action = "attrib";
                    this.onAttributeChanged(src);
                    return;
                
                case FileMonitorEvent.MOVED: // eg. chmod/chatt

                      var of = this.realpath(of_orig);
                       var   dest = new MonitorNamePathDir(
                                     of.get_basename(), 
                                    of.get_path(),  
                                    Path.get_dirname(of.get_path())
                                );
                        

                    src.action = "moved";
                    dest.action = "moved";
                    this.onMoved(src,dest);
                    return; 
                default:
                    stdout.printf("event type not handled %u", event_type);
                    break;
                // rest are mount related - not really relivant.. maybe add later..
            } 
        } catch(Error e) {
            print(e.message);
        }
        
    }
    

    /** override these to do stuff.. */
    //public void initRepo(MonitorNamePathDir src) { } // called on startup at the top level repo dir.
    public virtual void  onChanged(MonitorNamePathDir src) { }
    public virtual void onChangesDoneHint(MonitorNamePathDir src) { }
    public virtual void onDeleted(MonitorNamePathDir src) { }
    public virtual void onCreated(MonitorNamePathDir src) { }
    public virtual void onAttributeChanged(MonitorNamePathDir src) { }
    public virtual void onMoved(MonitorNamePathDir src,MonitorNamePathDir dest) { }
          
    
}
 
 





