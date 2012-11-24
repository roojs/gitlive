









Task = XObject.define(
    function(cfg) {
        // cal parent?
        if (typeof(cfg) != 'object') {
            return;
        } 
        XObject.extend(cfg);
         
    },
    Object,
    {
        
    }
});