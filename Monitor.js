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
    
    function start()
    {
        this.top.forEach(this.monitor, this);
    },
    
    function stop()
    {
        this.monitors.foreach(function(m) {
            m.cancel();
        })
        this.monitors = [];
    },
    
    
    
    
    
}
 
 





