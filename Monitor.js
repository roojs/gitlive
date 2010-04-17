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
            _this.onChange(fm, f, of, event_type, uh);
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
 
 





