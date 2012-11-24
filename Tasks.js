

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
        if (this.inQuery) {
            // ignore the notification.. we are currently checking what the current
            // status is.
            return; 
        }
        this.lastCommit = commit;
        this.fetchStatus();
        
        
    },
    fetchStatus : function()
    {
        
    }
    
    
    
};





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