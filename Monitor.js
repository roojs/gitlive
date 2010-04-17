//<Script type="text/javascript">
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
    
    
    this.monitors  [],
    
    this.top = [];
    
}

Monitor.prototype = {
    
    monitors : false, // Array of GioFileMonitors
    top : false, // list of top level directories..
    /**
     * add a directory or file to monitor
     */
    function add(add)
    {
        this.top.push(add);
    },
    /**
     * start monitoring
     */
    function start()
    {
        this.top.forEach(this.monitor, this);
    },
    /**
     * stop / pause monitoring
     * 
     */
    function stop()
    {
        this.monitors.foreach(function(m) {
            m.cancel();
        })
        this.monitors = [];
    },
    /**
     * monitor a file or directory (privatish)
     * 
     * 
     */
    function monitor(path, fn)
    {
        var _this = this;
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
            this.monitor(path+'/'+next_file.get_display_name(), fn)
        }
    
        file_enum.close(null);
    }
    
    function onEvent(fm, f, of, event_type, uh)
    {
        var src = {
            name : f.get_basename(),
            path : f.get_path(),
        };
        var dest = of ? {
            name : of.get_basename(),
            path : of.get_path(),
        } : false;
         
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
    },
    /** override these to do stuff.. */
     
    function onChanged(src) { },
    function onChangesDoneHint(src) { },
    function onDeleted(src) { },
    function onCreated(src) { },
    function onMoved(src) { },
          
    
}
 
 





