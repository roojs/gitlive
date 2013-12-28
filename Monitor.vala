//<Script type="text/javascript">
//var Gio     = imports.gi.Gio;
//var GLib    = imports.gi.GLib;

//var XObject = imports.XObject.XObject;
//var File    = imports.File.File;

/// # valac --pkg gee-0.8 --pkg gio-2.0  --pkg posix Monitor.val

 
using Gee; // for array list?

static int main (string[] args) {
    // A reference to our file
    var file = File.new_for_path ("data.txt");
    return 0;

}


public class  MonitorNamePathDir {
    
    public string name;
    public string path;
    public string dir;
    
    public MonitorNamePathDir(string name, string path, string dir)
    {
        this.name = name;
        this.path = path;
        this.dir = dir;
        
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
       
     
        this.monitors = new ArrayList<FileMonitor> ();
        this.top = new ArrayList<string> ();
        this.paused = false;
    }
     
    public ArrayList<FileMonitor> monitors;// Array of MonitorNamePathDirileMonitors
    public ArrayList<string> top; // list of top level directories..
    public bool paused;
    /**
     * add a directory or file to monitor
     */
    public void add (string add)
    {
        this.top.add(add);
    }
    /**
     * start monitoring
     */
    public void start()
    {
        for(int i = 0; i < this.monitors.size ; i++) {
            this.monitor(this.top[i], ( fm,  f_orig,  of_orig,  event_type) => {} );
        }
    }
    /**
     * stop / pause monitoring
     * 
     */
    public void stop()
    {
        
        for(int i = 0; i < this.monitors.size ; i++) {
            this.monitors[i].cancel();
        } 
        this.monitors = new ArrayList<FileMonitor>(); // clean /destroy/ kill old?
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
    public void monitor(string path, onEventHander fn , int depth = 0)
    {
         
       // print("ADD: " + path)
        
        //depth = typeof(depth) == 'number'  ? depth *1 : 0;
        depth = depth > 0  ? depth *1 : 0;
        
        
        //fn = fn || function (fm, f, of, event_type, uh) {
        //    _this.onEvent(fm, f, of, event_type, uh);
        //}
       
          
        var f = File.new_for_path(path);
            //var cancel = new Gio.Cancellable ();
        if (depth > 0) {     
            var fm = f.monitor(FileMonitorFlags.SEND_MOVED,null); //Gio.FileMonitorFlags.SEND_MOVED
            
            fm.changed.connect( ( fm,  f_orig,  of_orig,  event_type) => {
                    //if (fn) {
                        fn (fm,  f_orig,  of_orig,  event_type ) ;
                       // return;
                    //}
                    //this.onEvent (fm,  f_orig,  of_orig,  event_type ) ;
            });
            this.monitors.add(fm);
            // print("ADD path " + depth + ' ' + path);
        }
        // iterate children?
        // - this is not used.
        //if (GLib.file_test(path + '/.git' , GLib.FileTest.IS_DIR) && this.initRepo) {
            
        //    this.initRepo(path);
        //}
        
       
         var file_enum = f.enumerate_children(
            FileAttribute.STANDARD_DISPLAY_NAME + "," +   FileAttribute.STANDARD_TYPE,
            0, // FileQueryInfoFlags.NONE,
            null);
        
        FileInfo next_file;
        
        while ((next_file = file_enum.next_file(null)) != null) {
         
            //print("got a file " + next_file.sudo () + '?=' + Gio.FileType.DIRECTORY);
            
            if (next_file.get_file_type() != FileType.DIRECTORY) {
                next_file = null;
                continue;
            }
            
            if (next_file.get_file_type() ==FileType.SYMBOLIC_LINK) {
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
            
            
            
            this.monitor(sp, fn, depth + 1);
            
        }
    
        file_enum.close(null);
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
   
    
    
     
    public void onEvent(FileMonitor fm, File f_orig, File of_orig, FileMonitorEvent event_type)
    {
        if (this.paused) {
            return;
        }
        
        var f = this.realpath(f_orig);
        
        var of = this.realpath(of_orig);
 
        
 
        MonitorNamePathDir src = new MonitorNamePathDir( f.get_basename(), f.get_path() , Path.get_dirname(f.get_path()));
        MonitorNamePathDir dest = null;
        
        if (of != null) {
            dest = new MonitorNamePathDir( of.get_basename(), of.get_path(),  Path.get_dirname(of.get_path()));
            
        }
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
                    this.onChanged(src);
                    return; // ingore thise?? -wait for changes_done_htin?
                    
                case FileMonitorEvent.CHANGES_DONE_HINT:
                    this.onChangesDoneHint(src);
                    return;
                    
                case FileMonitorEvent.DELETED:
                    this.onDeleted(src);
                    return;
                    
                case FileMonitorEvent.CREATED:
                    this.onCreated(src);
                    return;
                
                case FileMonitorEvent.ATTRIBUTE_CHANGED: // eg. chmod/chatt
                    this.onAttributeChanged(src);
                    return;
                
                case FileMonitorEvent.MOVED: // eg. chmod/chatt
                    this.onMoved(src,dest);
                    return; 
                
                // rest are mount related - not really relivant.. maybe add later..
            } 
        } catch(Error e) {
            print(e.message);
        }
        
    }
    
    /** override these to do stuff.. */
    public void initRepo(MonitorNamePathDir src) { } // called on startup at the top level repo dir.
    public void onChanged(MonitorNamePathDir src) { }
    public void onChangesDoneHint(MonitorNamePathDir src) { }
    public void onDeleted(MonitorNamePathDir src) { }
    public void onCreated(MonitorNamePathDir src) { }
    public void onAttributeChanged(MonitorNamePathDir src) { }
    public void onMoved(MonitorNamePathDir src,MonitorNamePathDir dest) { }
          
    
}
 
 





