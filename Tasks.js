

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
    
    curTask : false,
    lastCommit : false;
    
    notify : function(commit)
    {
        if (this.inQuery) {
            // ignore the notification.. we are currently checking what the current
            // status is.
            return; 
        }
        this.lastCommit = commit;
        this.fetchTask();
        
        
    },
    fetchTask: function()
    {
        // have we got the status in the last 15 mins..
        // we should not need to get it again... - it's probably not changed.
        
        
        
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