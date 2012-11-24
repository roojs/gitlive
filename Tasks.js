
XObject = imports.XObject.XObject;
XMLHttpRequest = imports.XMLHttpRequest.XMLHttpRequest;

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
    lastCommit : false,
    
    notify : function(commit)
    {
        if (this.inQuery) {
            // ignore the notification.. we are currently checking what the current
            // status is.
            return; 
        }
        this.inQuery = 1;
        this.lastCommit = commit;
        this.fetchTask();
        
        
    },
    fetchTask: function()
    {
        // have we got the status in the last 15 mins..
        // we should not need to get it again... - it's probably not changed.
        if (this.curTask && !this.curTask.hasExpired()) {
            this.verifyCommit();
        }
        _this = this;
        // do the request to get the task..
        var r = XMLHttpRequest({
            onreadystatechange : function() {
                if (this.status != 4) {
                    return;
                }
                _this.curTask = new Task(JSON.parse(responseText));
                _this.verifyCommit();
            }
            
        });
        var netrc  = Netrc.forHost('git.roojs.com');
        r.open('GET',
               "http://roojs.com/admin.php/Roo/cash_invoice_entry?_current_task=1"
               ,true, netrc.login, netrc.password  );
        
        
    },
    
    verifyCommit : function()
    {
        // using curTask + lastCommit decide what to do.
        
        
        this.inQuery = 0;
        
    }
    
    
    
    
};





Task = XObject.define(
    function(cfg) {
        // cal parent?
        if (typeof(cfg) != 'object') {
            return;
        } 
        XObject.extend(cfg);
        
        // fix up the values.
        this.action_dt = Date.parseDate(this.action_dt,'Y-m-d H:i:s');
        
        
    },
    Object,
    {
        /**
         * This is similar to the cash_invoice_entry data..
         * 
         */
        action_dt: '', //"2012-11-23 11:00:00"
        description: '', //"QA on new site"
        qtyvalue: 0, //"2.25"
        
        hasExpired : function()
        {
            
            var exp = this.action_dt.add(Date.HOUR, this.qtyvalue);
            return (new Date()) > exp;  
            
        }
    }
);










//-------------- testing

Tasks.notify(1);