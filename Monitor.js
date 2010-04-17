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
    
    function add()
    {
        this.top.push(add);
    }
    
    
    
}
 
 





