//<Script type="text/javascript">
var Gio      = imports.gi.Gio;
var GLib      = imports.gi.GLib;


/**
 * Monitor class - handles monitor managment for a large tree...
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
        this.top.forEach(this.monitor, this);
    },
    /**
     * stop / pause monitoring
     * 
     */
    stop : function()
    {
        this.monitors.forEach(function(m) {
            m.cancel();
        })
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
       
        // if we are not at top level.. and there is a .git directory  (it's a submodule .. ignore) 
        if (depth > 1 && GLib.file_test(path + '/.git' , GLib.FileTest.IS_DIR)) {
            return;
        }
            
       
       
        
        var f = Gio.file_new_for_path(path);
            //var cancel = new Gio.Cancellable ();
        if (depth > 0) {     
            var fm = f.monitor(2,null); //Gio.FileMonitorFlags.SEND_MOVED
            fm.signal.changed.connect(fn);
            this.monitors.push(fm);
            // print("ADD path " + depth + ' ' + path);
        }
        // iterate children?
        
        if (GLib.file_test(path + '/.git' , GLib.FileTest.IS_DIR) && this.initRepo) {
            
            this.initRepo(path);
        }
        
        
        var file_enum = f.enumerate_children(
            Gio.FILE_ATTRIBUTE_STANDARD_DISPLAY_NAME + ','+ 
            Gio.FILE_ATTRIBUTE_STANDARD_TYPE,
            Gio.FileQueryInfoFlags.NONE,
            null);
        
       
        
        while ((next_file = file_enum.next_file(null)) != null) {
         
            if (next_file.get_file_type() != Gio.FileType.DIRECTORY) {
                continue;
            }
            
            if (next_file.get_file_type() == Gio.FileType.SYMBOLIC_LINK) {
                continue;
            }
            
            if (next_file.get_display_name()[0] == '.') {
                continue;
            }
            var sp = path+'/'+next_file.get_display_name();
            // skip modules.
           
            
            this.monitor(sp, fn, depth + 1)
        }
    
        file_enum.close(null);
    },
    
    
    
    onEvent : function(fm, f, of, event_type, uh)
    {
        if (this.paused) {
            return;
        }
        
        var rp = imports.os.realpath(f.get_path());
        var can = rp ? Gio.file_new_for_path(rp) : f;   
        
        print(event_type +  " : " + can.get_path() + "\n");
        var src = {
            name : can.get_basename(),
            path : can.get_path(),
            dir   : GLib.path_get_dirname(can.get_path())
        };
        
        var dest = false;
        
        if (of) {
            rp = imports.os.realpath(of.get_path());
            var can = rp ? Gio.file_new_for_path(rp) : of;   
            dest =  {
                name : can.get_basename(),
                path : can.get_path(),
                dir   : GLib.path_get_dirname(can.get_path())
            }
        }
        
        
        for(var i in Gio.FileMonitorEvent) {
            if (Gio.FileMonitorEvent[i] == event_type) {
                event_name = i;
            }
        }
        //print ("got event: " +event_name);
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
 
 





