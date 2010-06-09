//<Script type="text/javascript">
Gio      = imports.gi.Gio;
GLib      = imports.gi.GLib;


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
 
 
Monitor = function(cfg){
    for (var i in cfg) {
        this[i] = cfg[i];
    }
    
    
    this.monitors = [];
    
    this.top = [];
    
}

Monitor.prototype = {
    
    monitors : false, // Array of GioFileMonitors
    top : false, // list of top level directories..
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
     * monitor a file or directory (privatish)
     * 
     * 
     */
    monitor : function(path, fn, depth)
    {
        var _this = this;
        depth = depth || 0
        fn = fn || function (fm, f, of, event_type, uh) {
            _this.onEvent(fm, f, of, event_type, uh);
        }
       
        var f = Gio.file_new_for_path(path);
        //var cancel = new Gio.Cancellable ();
        var fm = f.monitor(2,null); //Gio.FileMonitorFlags.SEND_MOVED
        fm.signal.changed.connect(fn);
        this.monitors.push(fm);
        // iterate children?
        
        var file_enum = f.enumerate_children(
            Gio.FILE_ATTRIBUTE_STANDARD_DISPLAY_NAME + ','+ 
            Gio.FILE_ATTRIBUTE_STANDARD_TYPE,
            Gio.FileQueryInfoFlags.NONE,
            null);
        
        
        
        while ((next_file = file_enum.next_file(null)) != null) {
         
            if (next_file.get_file_type() != Gio.FileType.DIRECTORY) {
                continue;
            }
            if (next_file.get_display_name()[0] == '.') {
                continue;
            }
            var sp = path+'/'+next_file.get_display_name();
            // skip modules.
            if (depth > 1 && GLib.file_test(sp + '/.git' , GLib.FileTest.IS_DIR)) {
                continue;
            }
            
            
            this.monitor(sp, fn, depth+1)
        }
    
        file_enum.close(null);
    },
    
    
    onEvent : function(fm, f, of, event_type, uh)
    {
        var src = {
            name : f.get_basename(),
            path : f.get_path(),
            dir   : GLib.path_get_dirname(f.get_path())
        };
        var dest = of ? {
            name : of.get_basename(),
            path : of.get_path(),
            dir   : GLib.path_get_dirname(of.get_path())
        } : false;
        
        
        for(var i in Gio.FileMonitorEvent) {
            if (Gio.FileMonitorEvent[i] == event_type) {
                event_name = i;
            }
        }
        print ("got event: " +event_name);
        print ("got src: " + src.toString());
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
                    this.onAttributeCreated(src);
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
     
    onChanged : function(src) { },
    onChangesDoneHint : function(src) { },
    onDeleted : function(src) { },
    onCreated : function(src) { },
    onAttributeChanged : function(src) { },
    onMoved : function(src) { }
          
    
}
 
 





