
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
    
    nextPrompt : false, // time when the system last prompted a confirmation that a task is being worked on.
    
    
    notifyIdle : function()
    {
        
    },
    
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
               "http://roojs.com/admin.php/Roo/mtrack_repos?shortname=" + repo.name
               ,true, netrc.login, netrc.password  );
        //print("SEding request");        
        r.send();
        
        
    },
    
        //---------- end fetching - now verifying..

    
    
    verifyCommit : function()
    {
        // using curTask + lastCommit decide what to do.
        this.inQuery = 0;
        //tests:::
        this.verifyTaskTime();
        this.verifyTaskProject();
          
        
        
        
    },
    
    verifyTaskTime : function()
    {
        // check to see if current task is being planned for too long..
        // you should only enter task, and allow it to span over an hour.
        // if you do the whole day on a task, then it will need to verify with you every so often that you
        // need to confirm that you are still working on it..
        
        /*
          
           Example:
           
            Start at 10am, marked working on it till 3pm.
            
            So:
                at 11am, the system will pop up a warning - are you still working on it?
                -> if yes pressed, then next warning will be at 11pm
                
          
         */
        var now = new Date();
        if ( this.curTask) {
            var endoftask = this.activeTask.active_datetime.add(Date.HOUR, this.activeTask.qtyvalue);
            var max_stretch = now.add(Date.HOUR, 1);
            if (endoftask > max_stretch) {
                this.fixEndCurrTask(); //
                 
            }
            
            
        }
        
        
        
        

        
        if (!this.nextPrompt && this.curTask) {
            //var use_start = this.curTask.active_datetime < now ? now : 
            // if we have a task, then the next verification should be 1 hour after it started.
            // even if we have only just seen it.. so we could already need verification.
            this.nextPrompt = this.curTask.active_datetime; // the start time recorded in the database.
        }
        
        
        if (!this.nextPrompt || (this.nextPrompt < (new Date()))) {
            
            this.promptForTask();
            return;
            
        }
        
        
        
        
    },
    
    //---------- end verifying - now prompting..
    
    
    fixEndCurrTask: function()
    {
        // set the end time of the current task to be now + 1 hours at most...
        var now = new Date();
        var eot = now.add(Date.HOUR, 1);
        // now round it down to nearest 15 minutes..
        var min = Math.round((eot.format('i')*1) / 15) * 15;
        var reot = Date.parseDate(eot.format('Y-m-d H:') + (min ? min : '00') + ':00', 'Y-m-d H:i:s');
        
        // how long between start and reot...
        var hours = (reot - this.curTask.active_datetime) / (60*60 * 1000 );
        var rounded =  Math.round(hours * 4) / 4.0;
        print("Rounded : "  + rounded);
        this.updateTask({ qtyvalue : rounded });
        
        
    },
    
    promptForTask : function()
    {
        /// fixme...
        this.nextPrompt = (new Date()).add(Date.MINUTE, 60);
        
        
    },
    
    updateTask: function(setv)
    {
        var args = {};
        XObject.extend(args,setv);
        args.id = _this.curTask.id;
        
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
        
        r.open('POST',
               "http://roojs.com/admin.php/Roo/cash_invoice_entry?_current_task=1"
               ,true, netrc.login, netrc.password  );
        //print("SEding request");        
        r.send(args);
        
        
        
        
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
Tasks.notify( { repo : imports.Scm.Repo.Repo.get('gitlive') } );
Gtk.main();