
var Gio      = imports.gi.Gio;
var Gtk      = imports.gi.Gtk;
var Notify   = imports.gi.Notify;
var GLib     = imports.gi.GLib;

var Spawn = imports.Spawn;
var StatusIcon = imports.StatusIcon.StatusIcon;
var Monitor = imports.Monitor.Monitor;



var GitMonitor = new Monitor({
    
    /**
     * @property {String} the "gitlive" directory, normally ~/gitlive
     *  dset by OWNER... - we should do this as a CTOR.
     *  
     */
    gitlive : false,
    
    
    queue : [],
    queueRunning : false,
     
     
     
    pause : function() {
        this.paused = true;
        this.queue = [];
        imports.StatusIcon.StatusIcon.el.set_from_stock( Gtk.STOCK_MEDIA_PAUSE );
    },
    
    resume : function() {
        this.paused = false;
        this.queue = [];
        imports.StatusIcon.StatusIcon.el.set_from_stock( Gtk.STOCK_MEDIA_PLAY );
        
        
    },
    
    /**
     * Start the monitoring
     * and run the queue every 500 milliseconds..
     *
     */
    start: function() {
        imports.StatusIcon.StatusIcon.el.set_from_stock( Gtk.STOCK_REFRESH );
        var _this = this;
        this.lastAdd = new Date();
        
        GLib.timeout_add(GLib.PRIORITY_LOW, 500, function() {
            _this.top.forEach(_this.monitor, _this);
            imports.StatusIcon.StatusIcon.el.set_from_stock( Gtk.STOCK_MEDIA_PLAY );
            
            try { 
                var notification = new Notify.Notification({
                    summary: "Git Live",
                    body : this.gitlive + "\nMonitoring " + _this.monitors.length + " Directories",
                    timeout : 5
                });
        
                notification.set_timeout(5);
                notification.show();
            } catch(e) {
                print(e.toString());
            }

        });
        
        GLib.timeout_add(GLib.PRIORITY_LOW, 1000, function() {
            //TIMEOUT", _this.queue.length , _this.queueRunning].join(', '));
            if (!_this.queue.length || _this.queueRunning) {
                return 1;
            }
            var last = Math.floor(((new Date()) - _this.lastAdd) / 100);
            
            //print("LAST RUN?" + last);
            
            if (last < 5) { // wait 1/2 a seconnd before running.
                return 1;
            }
            //_this.lastAdd = new Date();
            //return 1;
        
            _this.runQueue();
            return 1;
        },null,null);
        
      
    },
    
    
    stop: function() {
        imports.StatusIcon.StatusIcon.el.set_from_stock( Gtk.STOCK_MEDIA_PAUSE );
        Monitor.prototype.stop.call(this);
    },
    
    
    monitor : function(path, fn, depth)
    {
        depth = typeof(depth) == 'number'  ? depth *1 : 0;
        
         
        // if we are not at top level.. and there is a .git directory  (it's a submodule .. ignore) 
        if (depth > 1 && GLib.file_test(path + '/.git' , GLib.FileTest.IS_DIR)) {
            return;
        }
        
        if (depth == 1) {
            var repo = imports.Scm.Repo.Repo.get(path);
            if (!repo || !repo.autocommit()) {
                return;
            } 
        }
        
        
        // check if the repo is to be monitored.
        //print("PATH : " + path);
        
        
        Monitor.prototype.monitor.call(this, path,fn, depth);
    },
    
    /**
     * run the queue.
     * - pulls the items off the queue 
     *    (as commands run concurrently and new items may get added while it's running)
     * - runs the queue items
     * - pushes upstream.
     * 
     */
    runQueue: function()
    {
        
        if (this.paused) {
            return;
        }
        this.queueRunning = true;
        var cmds = [];
        this.queue.forEach(function (q) {
            cmds.push(q);
        });
        this.queue = []; // empty queue!
        
        var success = [];
        var failure = [];
        var repos = [];
        var done = [];
        
        // first build a array of repo's to work with
        var repo_list = {};
        
        // pull and group.
        
        //print(JSON.stringify(cmds));
        this.paused = true;
        cmds.forEach(function(cmd) {
            var gitpath = cmd.shift(); 
            if (typeof(repo_list[gitpath]) == 'undefined') {
                repo_list[gitpath] = new imports.Scm.Git.Repo.Repo( { repopath : gitpath });
                repo_list[gitpath].cmds = [];
                repo_list[gitpath].pull();
            }
            repo_list[gitpath].cmds.push(cmd);
        });
        this.paused = false;
        // build add, remove and commit message list..
        
         
         
        for (var gitpath in repo_list) {
            var repo = repo_list[gitpath];
            var add_files = [];
            var remove_files = [];
            var messages = [];
            //print(JSON.stringify(repo.cmds,null,4));
            
            repo.cmds.forEach(function(cmd) {
                
                var name = cmd.shift();
                var arg = cmd.shift();
                
                switch(name) {
                    case 'add' :
                        
                        if (add_files.indexOf(arg) > -1) {
                            break;
                        }
                        
                        // if file does not exist.. s,ip
                        
                        //if (!GLib.file_test(arg, GLib.FileTest.EXISTS)) {
                             
                        //    break;
                         // }
        
                        
                        add_files.push(arg);
                        break;
                    
                    case 'rm':
                        
                        if (add_files.indexOf(arg) > -1) {
                            break;
                        }
                        
                        // if file exists, do not try and delete it.
                        if (GLib.file_test(arg, GLib.FileTest.EXISTS)) {
                            break;
                        }
                        
                        remove_files.push(arg);
                        break;
                    
                    case 'commit' :
                        
                        if (messages.indexOf(arg.message) < 0) { 
                            messages.push(arg.message);
                        }
                        break;    
                } 
            });
            
            //repo.debug = 1;
            // these can fail... at present... as we wildcard stuff.
            print("ADD : "  + JSON.stringify(add_files));
            
            // make sure added files do not get removed..
            remove_files  = remove_files.filter(function(v) {
                return add_files.indexOf(v) < 0;
            });
            print("REMOVE : "  + JSON.stringify(remove_files));
            
            
            // make sure monitoring is paused so it does not recursively pick up
            // deletions
            
            // -- DO STUFF..
            
            repo.add(add_files);
            
            repo.remove(remove_files);
            this.paused = false;
            
            
            try { 
                success.push(repo.commit({
                    reason : messages.join("\n"),
                    files : add_files  
                }));
                success.push(repo.push());

            } catch(e) {
                failure.push(e.message);
                
            }   
        }
        
        // finally merge all the commit messages.
         
        try {
            // catch notification failures.. so we can carry on..
            if (success.length) {
                print(success.join("\n"));
                
                var notification = new Notify.Notification({
                    summary: "Git Live Commited",
                    body : success.join("\n"),
                    timeout : 5
                    
                });
    
                notification.set_timeout(5);
                notification.show();   
            }
            
            if (failure.length) {
            
                var notification = new Notify.Notification({
                    summary: "Git Live ERROR!!",
                    body : failure.join("\n"),
                    timeout : 5
                    
                });
    
                notification.set_timeout(5); // show errros for longer
                notification.show();   
            }
        } catch(e) {
            print(e.toString());
            
        }
        this.queueRunning = false;
    },
    
    shouldIgnore: function(f)
    {
        
        if (this.paused) {
            return true;
        }
        
        
        // vim.. what a seriously brain dead program..
        if (f.name == '4913') {
            return true;
        }
        
        if (f.name[0] == '.') {
            // except!
            if (f.name == '.htaccess') {
                return false;
            }
            
            return true;
        }
        if (f.name.match(/~$/)) {
            return true;
        }
        if (f.name.match(/^nbproject/)) {
            return true;
        }
        // ignore anything in top level!!!!
        if (!f.vpath.length) {
            return true;
        }
        
        return false;
    },
    
    /**
     * parsePath:
     * Fill in gitlive, vpath and repo  
     * 
     */
    parsePath: function(f)
    {
           
        var vpath_ar = f.path.substring(this.gitlive.length +1).split('/');
        
        f.gitpath = this.gitlive + '/' + vpath_ar.shift();
        f.vpath =  vpath_ar.join('/');
        //f.repo = new imports.Scm.Git.Repo({ repopath: f.gitpath })
        
        
    },
    
    just_created : {},
      
    onChanged : function(src) 
    { 
        return; // always ignore this..?
        //this.parsePath(src);
    },
    
    
    
    
    /**
     *  results in  git add  + git commit..
     *
     */
    onChangesDoneHint : function(src) 
    { 
        this.lastAdd = new Date();
        this.parsePath(src);
        if (this.shouldIgnore(src)) {
            return;
        }
        
       
        var add_it = false;
        if (typeof(this.just_created[src.path]) !='undefined') {
            delete this.just_created[src.path];
            
            this.queue.push( 
                [ src.gitpath,  'add', src.vpath ],
                [ src.gitpath,  'commit',    { message: src.vpath} ] 
                
            );
         
            return;
        }
        
        this.queue.push( 
            [ src.gitpath,  'add', src.vpath ],
            [ src.gitpath,  'commit',  {  message: src.vpath} ]

            
        );
    },
    onDeleted : function(src) 
    { 
        this.lastAdd = new Date();
        this.parsePath(src);
        if (this.shouldIgnore(src)) {
            return;
        }
        // should check if monitor needs removing..
        // it should also check if it was a directory.. - so we dont have to commit all..
        
        
        this.queue.push( 
            [ src.gitpath, 'rm' , src.vpath ],
            [ src.gitpath, 'commit', { all: true, message: src.vpath} ]
            
        );
    
        
    },
    onCreated : function(src) 
    { 
        this.lastAdd = new Date();
        this.parsePath(src);
        if (this.shouldIgnore(src)) {
            return;
        }
        
        if (!GLib.file_test(src.path, GLib.FileTest.IS_DIR)) {
            this.just_created[src.path] = true;
            return; // we do not handle file create flags... - use done hint.
        }
        // director has bee created
        this.monitor(src.path);
        
        this.queue.push( 
            [ src.gitpath, 'add' , src.vpath,  { all: true } ],
            [ src.gitpath, 'commit' , { all: true, message: src.vpath} ]
            
        );
        
        
    },
    onAttributeChanged : function(src)
    { 
        this.lastAdd = new Date();
        this.parsePath(src);
        if (this.shouldIgnore(src)) {
            return;
        }
        
        this.queue.push(
                        
            //[ src.gitpath, 'commit' ,  src.vpath, { message: src.vpath} ]
            [ src.gitpath, 'add' ,  src.vpath ],
             [ src.gitpath, 'commit' ,    {  message: "Attribute Changed :" + src.vpath} ]
        );
 
    
    },
    
    onMoved : function(src,dest)
    { 
        this.lastAdd = new Date();
        this.parsePath(src);
        this.parsePath(dest);
        
        if (src.gitpath != dest.gitpath) {
            this.onDeleted(src);
            this.onCreated(dest);
            this.onChangedDoneHint(dest);
            return;
        }
        // needs to handle move to/from unsupported types..
        
        if (this.shouldIgnore(src)) {
            return;
        }
        if (this.shouldIgnore(dest)) {
            return;
        }
        
        this.queue.push( 
           // [ src.gitpath, 'mv',  '-k', src.vpath, dest.vpath ],
             [ src.gitpath, 'add',    dest.vpath ],
             [ src.gitpath, 'rm',    src.vpath ],
             
            [ src.gitpath, 'commit' , 
                { message:   'MOVED ' + src.vpath +' to ' + dest.vpath}
            ]
        );
         
    }
          
    
});
 
 
