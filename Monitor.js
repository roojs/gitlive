//<Script type="text/javascript">
var Gio     = imports.gi.Gio;
var GLib    = imports.gi.GLib;

var XObject = imports.XObject.XObject;
var File    = imports.File.File;

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
 
function Monitor(cfg){
    for (var i in cfg) {
        this[i] = cfg[i];
    }
    
    
    this.monitors = [];
    
    this.top = [];
    
}

Monitor.prototype = {
    
    monitors : false, // Array of GioFileMonitors
    top : false, // list of top level directories..
    paused : false,
    /**
     * add a directory or file to monitor
     */
    add : function(add)
    {
        this.top.push(add);
    },
    /**
     * start monitoring
     */
    start : function()
    {
        for(var i =0;i < this.top.length; i++) {
            this.monitor(this.top[i]);
        }
    },
    /**
     * stop / pause monitoring
     * 
     */
    stop : function()
    {
        
        for(var i =0;i < this.monitors.length; i++) {
            this.monitors[i].cancel();
        } 
        this.monitors = [];
    },
    /**
     * pause monitoring - without changing what's monitored 
     */
    pause : function()
    {
        this.paused = true;
    },
    /**
     * resume monitoring - without changing what's monitored 
     */
    resume : function()
    {
        this.paused = false;
    },
    /**
     * monitor a file or directory (privatish)
     *
     * initially called with ~/gitlive  null 0 (effectvely)
     * 
     * 
     */
    monitor : function(path, fn, depth)
    {
        var _this = this;
        
       // print("ADD: " + path)
        
        depth = typeof(depth) == 'number'  ? depth *1 : 0;
        
        
        fn = fn || function (fm, f, of, event_type, uh) {
            _this.onEvent(fm, f, of, event_type, uh);
        }
       
          
        var f = Gio.file_new_for_path(path);
            //var cancel = new Gio.Cancellable ();
        if (depth > 0) {     
            var fm = f.monitor(2,null); //Gio.FileMonitorFlags.SEND_MOVED
            
            XObject.isSeed ?  fm.signal.changed.connect(fn) : fm.connect('changed',fn);
            this.monitors.push(fm);
            // print("ADD path " + depth + ' ' + path);
        }
        // iterate children?
        // - this is not used.
        //if (GLib.file_test(path + '/.git' , GLib.FileTest.IS_DIR) && this.initRepo) {
            
        //    this.initRepo(path);
        //}
        
         var file_enum = f.enumerate_children(
            Gio.FILE_ATTRIBUTE_STANDARD_DISPLAY_NAME + ','+ 
            Gio.FILE_ATTRIBUTE_STANDARD_TYPE,
            Gio.FileQueryInfoFlags.NONE,
            null);
        
        var next_file;
        
        while ((next_file = file_enum.next_file(null)) != null) {
         
            //print("got a file " + next_file.sudo () + '?=' + Gio.FileType.DIRECTORY);
            
            if (next_file.get_file_type() != Gio.FileType.DIRECTORY) {
                next_file = null;
                continue;
            }
            
            if (next_file.get_file_type() == Gio.FileType.SYMBOLIC_LINK) {
                next_file = null;
                continue;
            }
            
            if (next_file.get_display_name()[0] == '.') {
                next_file = null;
                continue;
            }
            var sp = path+'/'+next_file.get_display_name();
            // skip modules.
            //print("got a file : " + sp);
         
            next_file = null;
            
            
            
            this.monitor(sp, fn, depth + 1);
            
        }
    
        file_enum.close(null);
    },
    
    
    
    realpath : function(file)
    {
        if (!file) {
            return file;
        }
        
        if (GLib.file_test(file.get_path(), GLib.FileTest.EXISTS)) {
            var rp = File.realpath(file.get_path());
            return Gio.file_new_for_path(rp);  
            
        }
        // file does not currently exist..
        // check parent.
        var bn = file.get_basename();
        var ar = file.get_path().split('/');
        ar.pop();
        var dirname = ar.join('/');
        var rp = File.realpath(dirname);
        return Gio.file_new_for_path(rp + '/' + bn);
        
    },
   
    
    
    
    
    onEvent : function(fm, f_orig, of_orig, event_type, uh)
    {
        if (this.paused) {
            return;
        }
        
        var f = this.realpath(f_orig);
        
        var of = this.realpath(of_orig);
 
        var src = {
            name : f.get_basename(),
            path : f.get_path(),
            dir   : GLib.path_get_dirname(f.get_path())
        };
        
        var dest = false;
        
        if (of) {
            
            dest =  {
                name : of.get_basename(),
                path : of.get_path(),
                dir   : GLib.path_get_dirname(of.get_path())
            }
        }
        var event_name = 'UKNOWN';;
        
        for(var i in Gio.FileMonitorEvent) {
            if (Gio.FileMonitorEvent[i] == event_type) {
                event_name = i;
            }
        }
        
        //print (JSON.stringify([event_name , f.get_path(), of ? of.get_path() : false ] ));
        //print ("got src: " + src.toString());
        //print ("got event: " + src.toString());
        try {
                
            switch(event_type) {
                case Gio.FileMonitorEvent.CHANGED:
                    this.onChanged(src);
                    return; // ingore thise?? -wait for changes_done_htin?
                    
                case Gio.FileMonitorEvent.CHANGES_DONE_HINT:
                    this.onChangesDoneHint(src);
                    return;
                    
                case Gio.FileMonitorEvent.DELETED:
                    this.onDeleted(src);
                    return;
                    
                case Gio.FileMonitorEvent.CREATED:
                    this.onCreated(src);
                    return;
                
                case Gio.FileMonitorEvent.ATTRIBUTE_CHANGED: // eg. chmod/chatt
                    this.onAttributeChanged(src);
                    return;
                
                case Gio.FileMonitorEvent.MOVED: // eg. chmod/chatt
                    this.onMoved(src,dest);
                    return; 
                
                // rest are mount related - not really relivant.. maybe add later..
            } 
        } catch(e) {
            print(e);
        }
        
    },
    
    /** override these to do stuff.. */
    initRepo : function(src) { }, // called on startup at the top level repo dir.
    onChanged : function(src) { },
    onChangesDoneHint : function(src) { },
    onDeleted : function(src) { },
    onCreated : function(src) { },
    onAttributeChanged : function(src) { },
    onMoved : function(src) { }
          
    
}
 
 





