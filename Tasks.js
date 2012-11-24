

/**
 *
 * Tasks
 *
 *  Flow
 *
 *    Commit
 *      => Tasks.notify(commit)
 *
 *
 *
 *
 */

Tasks = {
    
    notify : function(commit)
    {
        
        
        
        
    }
    
    
    
}





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
);