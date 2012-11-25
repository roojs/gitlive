
XObject = imports.XObject.XObject;
XMLHttpRequest = imports.XMLHttpRequest.XMLHttpRequest;
Netrc = imports.Netrc.Netrc;
Date = imports.Date.Date;
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
    commitRepo : false, // the DB version of repo info..
    lastCommit : false,
    
    notify : function(commit)
    {
        if (this.inQuery && this.inQuery > (new Date())) {
            // ignore the notification.. we are currently checking what the current
            // status is.
            
            // we need to handle a WTF situation where something below failed... so
            
            return; 
        }
        this.inQuery = (new Date()).add(Date.MINUTE, 5);
        this.lastCommit = commit;
        this.commitRepo = false;
        this.curTask = false;
        this.fetchTask();
        
        
    },
    fetchTask: function()
    {
        // have we got the status in the last 15 mins..
        // we should not need to get it again... - it's probably not changed.
        if (this.curTask && !this.curTask.hasExpired()) {
            this.fetchRepo();
        }
        _this = this;
        // do the request to get the task..
        var r = new XMLHttpRequest({
            onreadystatechange : function() {
                print("Got result.");
                if (this.status != 4) {
                    return;
                }
                
                  
                var res = JSON.parse(this.responseText);
                
                //print(JSON.stringify(res,null,4))
                //print([ res.success , res.data.length ]);
                _this.curTask = (res.success && res.data.length) ? (new Task(res.data[0])) : false;
                print(JSON.stringify(_this.curTask,null,4));
                _this.fetchRepo();
            }
            
        });
        var netrc  = Netrc.forHost('git.roojs.com');
        
        r.open('GET',
               "http://roojs.com/admin.php/Roo/cash_invoice_entry?_current_task=1"
               ,true, netrc.login, netrc.password  );
        //print("SEding request");        
        r.send();
        
    },
    
    verifyCommit : function()
    {
        // using curTask + lastCommit decide what to do.
        
        
        
        
        
        this.inQuery = 0;
        
    },
    
    fetchRepo: function()
    {
        
        var repo = this.lastCommit.repo;
        
         _this = this;
        var r = new XMLHttpRequest({
            onreadystatechange : function() {
                print("Got result.");
                if (this.status != 4) {
                    return;
                }
                
                  
                var res = JSON.parse(this.responseText);
                
                print(JSON.stringify(res,null,4))
                //print([ res.success , res.data.length ]);
                _this.commitRepo = (res.success && res.data.length) ? res.data[0] : false;
                print(JSON.stringify(_this.commitRepo))
                _this.verifyCommit();
            }
            
        });
        var netrc  = Netrc.forHost('git.roojs.com');
        
        r.open('GET',
               "http://roojs.com/admin.php/Roo/mtrack_repos?short name=" + repo.name
               ,true, netrc.login, netrc.password  );
        //print("SEding request");        
        r.send();
        
        
    }
    
    
    
    
    
    
};





Task = XObject.define(
    function(cfg) {
        // cal parent?
        if (typeof(cfg) != 'object') {
            print("CFG not oboject?");
            return;
        } 
        XObject.extend(this,cfg);
 
        // fix up the values.
        this.action_datetime = Date.parseDate(this.action_dt,'Y-m-d H:i:s');
      // print("ACT DT: " + this.action_dt);
        
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
            
            var exp = this.action_datetime.add(Date.HOUR, this.qtyvalue);
            return (new Date()) > exp;  
            
        }
    }
);










//-------------- testing
Gtk = imports.gi.Gtk;
Gtk.init(Seed.argv);
Tasks.notify( { repo : imports.Scm.Repo.Repo.get('web.xtuple') } );
Gtk.main();