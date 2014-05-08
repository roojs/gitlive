

public GitMontitorQueue : MonitorNamePathDir {
        public string gitpath;
        public string vpath;
        public stirng message ; // for commit
        public GitMontitorQueue(MonitorNamePathDir f, string gitlive) {
            this.name = f.name;
            this.path = f.path;
            this.dir = f.dir;

 
           
            var vpath_ar = this.path.substring(gitlive.length +1).split('/', 0);
            
            this.gitpath = gitlive + '/' + vpath_ar[0];
            
            string[]  vpath = {};
            for (var i = 1; i< vpath_ar.length; i++) {
                vpath += vpath_ar[i];
            }
            this.vpath =  string.joinv("/", vpath);
            //f.repo = new imports.Scm.Git.Repo({ repopath: f.gitpath })
        
        
        }

        public bool shouldIgnore(GitMonitor gm)
        {
            
            
            
            // vim.. what a seriously brain dead program..
            if (this.name == '4913') {
                return true;
            }
            
            if (this.name[0] == '.') {
                // except!
                if (this.name == '.htaccess') {
                    return false;
                }
                
                return true;
            }
            //if (f.name.match(/~$/)) {
            //    return true;
            //}
            //if (f.name.match(/^nbproject/)) {
            //    return true;
            //}
            // ignore anything in top level!!!!
            if (!this.vpath.length) {
                return true;
            }
            
            return false;
        }
     
}



public class GitMonitor : Monitor
{

 
    /**
     * @property {String} the "gitlive" directory, normally ~/gitlive
     *  dset by OWNER... - we should do this as a CTOR.
     *  
     */
    public string gitlive = '';
    
    
    public Array<GtkMonitorQueuequeue>;
    public bool queueRunning = false;
    
    public DateTime lastAdd;
     
     
    public void pause() {
        this.paused = true;
        // what does this do to the old one...
        this.queue = new Array<FileMonitor> ();
        StatusIcon.statusicon.set_from_stock( Gtk.Stock.MEDIA_PAUSE );

    }
    
    public void resume () {
        this.paused = false;
        this.queue = new Array<FileMonitor> ();
        StatusIcon.statusicon.set_from_stock( Gtk.Stock.MEDIA_PLAY );
        
        
    }
    /**
     * Start the monitoring
     * and run the queue every 500 milliseconds..
     *
     */
    public void start() {
        StatusIcon.statusicon.set_from_stock( Gtk.Stock.MEDIA_REFRESH );
        
         
        this.lastAdd = new DateTime.now(); 
        
        Timeout.add_full(GLib.PRIORITY_LOW, 500, () => {

            // call this.monitor on each of 'top'
            for(int i = 0; i < this.top.length ; i++) {
                this.monitor(this.top.index(i), ( fm,  f_orig,  of_orig,  event_type) => {
                    this.onEvent (fm,  f_orig,  of_orig,  event_type ) ;
                } );
            }
            StatusIcon.statusicon.set_from_stock( Gtk.Stock.MEDIA_PLAY );
             
           
            
            try { 
                var notification = new Notify.Notification({
                    "Git Live",
                    this.gitlive + "\nMonitoring " + _this.monitors.length + " Directories",
                     "dialog-information"
                });
        
                notification.set_timeout(5);
                notification.show();
            } catch(Error e) {
                print(e.toString());
            }

        });
        
        Timeout.add_full(GLib.PRIORITY_LOW, 1000, () => {
            //TIMEOUT", _this.queue.length , _this.queueRunning].join(', '));
            if (!_this.queue.length || _this.queueRunning) {
                return true;
            }

            var last = this.lastAdd.difference(new DateTime.now());

            
            //print("LAST RUN?" + last);
            
            if (last < 5 * Timespan.SECOND) { // wait 1/2 a seconnd before running.
                return 1;
            }
            //_this.lastAdd = new Date();
            //return 1;
        
            this.runQueue();
            return true;
        },null,null);
        
      
    }


    public void stop() {
        StatusIcon.statusicon.set_from_stock( Gtk.Stock.MEDIA_PAUSE );;
        base.stop();
    }
    
    
    public void monitor (string path, onEventHander fn , int depth = 0)
    {
        
        //var depth = typeof(depth) == 'number'  ? depth *1 : 0;
        
         
        // if we are not at top level.. and there is a .git directory  (it's a submodule .. ignore) 
        if (depth > 1 && GLib.file_test(path + '/.git' , GLib.FileTest.IS_DIR)) {
            return;
        }
        
        if (depth == 1) {
            // FIXME - check if repo is flagged as not autocommit..
            //var repo = imports.Scm.Repo.Repo.get(path);
            //if (!repo || !repo.autocommit()) {
            //    return;
            //} 
        }
        
        
        // check if the repo is to be monitored.
        //print("PATH : " + path);
        
        
        base.monitor(path,fn, depth);
    }

    

    /**
     * run the queue.
     * - pulls the items off the queue 
     *    (as commands run concurrently and new items may get added while it's running)
     * - runs the queue items
     * - pushes upstream.
     * 
     */
    public void runQueue()
    {
        
        if (this.paused) {
            return;
        }
        this.queueRunning = true;

        var cmds = new Array<GitMontitorQueue>();
        for(var i = 0; i < this.queue.length; i++) {
            cmds.append_val(this.queue.item(i));
        }

        this.queue = new Array<GitMontitorQueue>();// empty queue!

        
        var success = new Array<String>();
        var failure = new Array<GitMontitorQueue>();
        var repos = new Array<GitMontitorQueue>(); //??
        var done = new Array<GitMontitorQueue>();
        
        // first build a array of repo's to work with
        var repo_list = new Array<GitMontitorRepo>();
        
        // pull and group.
        
        //print(JSON.stringify(cmds));
        this.paused = true;
        
        for(var i = 0; i < cmds.length; i++) {
           
        
            var gitpath = cmd.gitpath; 
            var ix  = GitMontitorRepo.indexOf(this.repos,  cmd.gitpath);
            if (ix < 0) {
                    repo_list.append_val(new GitMontitorRepo( gitpath ));
                    ix = GitMontitorRepo.indexOf(this.repos,  cmd.gitpath);
            }
            

            //if (typeof(repo_list[gitpath]) == 'undefined') {
            //    repo_list[gitpath] = new imports.Scm.Git.Repo.Repo( { repopath : gitpath });
            //    repo_list[gitpath].cmds = [];
             //   repo_list[gitpath].pull();
            //}
            repo_list.item(ix).append_val(cmd);

        }
        this.paused = false;
        // build add, remove and commit message list..
        
        for(var i = 0;i < repo_list.length;i++) {
    

            var repo = repo_list.item(i);

            var add_files = new Array<GitMontitorQueue>();
            var remove_files = new Array<GitMontitorQueue>();
            var messages = new Array<GitMontitorQueue>();
            //print(JSON.stringify(repo.cmds,null,4));
            
            for(var ii = 0;ii < repo.length;ii++) {
                var cmd = repo.item(ii);
    
                
                switch(cmd.name) {
                    case "add" :
                        
                        if (GitMontitorQueue.indexOfAdd(add_files, cmd.add) > -1) {
                           break;
                        }
        
                        
                        add_files.append_val(cmd);
                        break;
                    
                    case 'rm':
                        if (GitMontitorQueue.indexOfAdd(add_files, cmd.rm) > -1 ) {
                           break;
                        }
                        
                        // if file exists, do not try and delete it.
                        if (GLib.file_test(cmd.rm, GLib.FileTest.EXISTS)) {
                            break;
                        }
                        
                        remove_files.append_val(cmd);
                        break;
                    
                    case 'commit' :
                        if (GitMontitorQueue.indexOfMessage(messages, cmd.message) > -1 ) {
                           break;
                        }
                         
                        messages.append_val(cmd);
                        
                        break;    
                } 
            }
            
            //repo.debug = 1;
            // these can fail... at present... as we wildcard stuff.
            stdout.printf("ADD : %d files"  , add_files.length);
            
            // make sure added files do not get removed..

            var remove_files_f = new Array<GitMontitorQueue>();
            for(var ii = 0;ii < remove_files.length;ii++) {
                if (GitMontitorQueue.indexOfAdd(add_files,  remove_files.item(ii).rm) > -1 ) {
                     continue;
                }
                remove_files_f.append_val(remove_files.item(ii));
            };
            stdout.printf("REMOVE : %d files"  , remove_files.length);
             
            // make sure monitoring is paused so it does not recursively pick up
            // deletions
            
            // -- DO STUFF..
            
            repo.add(add_files);
            repo.remove(remove_files);
            this.paused = false;
            
            
            try { 
                success.append_val(repo.commit(
                    GitMontitorQueue.messageToString(messages)
                    add_files  
                ));
                success.push(repo.push());

            } catch(Error e) {
                failure.append_val(e.message);
                
            }   
        }
        
        // finally merge all the commit messages.
         
        try {
            // catch notification failures.. so we can carry on..
            if (success.length) {
                var success_str = "";
                for(var ii = 0;ii < success.length;ii++) {
                    success_str+= success.item(ii) + "\n";
                }
                
                var notification = new Notify.Notification(
                    "Git Live Commited",
                    success_str,
                     "dialog-information"
                    
                );
    
                notification.set_timeout(5);
                notification.show();   
            }
            
            if (failure.length) {
                var failure_str = "";
                for(var ii = 0;ii < failure.length;ii++) {
                    failure_str+= failure.item(ii) + "\n";
                }
                var notification = new Notify.Notification({
                    summary: "Git Live ERROR!!",
                    failure_str,
                    "dialog-information"
                    
                });
    
                notification.set_timeout(5); // show errros for longer
                notification.show();   
            }
        } catch(Error e) {
            print(e.message);
            
        }
        this.queueRunning = false;
    }
    


    

    string[] just_created;

    public void initRepo(MonitorNamePathDir src) { } // called on startup at the top level repo dir.
 
 
    public void onDeleted(MonitorNamePathDir src) { }
    public void onCreated(MonitorNamePathDir src) { }
    public void onAttributeChanged(MonitorNamePathDir src) { }
    public void onMoved(MonitorNamePathDir src,MonitorNamePathDir dest) { }
   


    public void onChanged(MonitorNamePathDir src) { }
    { 
        return; // always ignore this..?
        //this.parsePath(src);
    },
    

 
    /**
     *  results in  git add  + git commit..
     *
     */
    public void onChangesDoneHint(MonitorNamePathDir src) { }
    { 
        
        if (this.paused) {
            return true;
        }
            

        this.lastAdd = new DateTime.now(); 
        var cmd = new GitMontitorQueue(src, this.gitlive);
        if (cmd.shouldIgnore()) {
            return;
        }
        
       
        var add_it = false;
        /*
        if (this.is_just_created(cmd.path)) {
            
        if (typeof(this.just_created[src.path]) !='undefined') {
            delete this.just_created[src.path];
            
            this.queue.push( 
                [ src.gitpath,  'add', src.vpath ],
                [ src.gitpath,  'commit',    { message: src.vpath} ] 
                
            );
         
            return;
        }
        */
        cmd.add = src.vpath;
        this.queue.append_val(cmd);

        var cmd = new GitMontitorQueue(src, this.gitlive);
        cmd.name = "commit";
        cmd.message = src.vpath;
        this.queue.append_val(cmd);
 
         
    }
    public void onDeleted(MonitorNamePathDir src) 
{ 
        if (this.paused) {
            return true;
        }
        this.lastAdd = new DateTime.now(); 
        var cmd = new GitMontitorQueue(src, this.gitlive);
        if (cmd.shouldIgnore()) {
            return;
        }
        // should check if monitor needs removing..
        // it should also check if it was a directory.. - so we dont have to commit all..
        cmd.name = "rm";
        cmd.rm = src.vpath;
        this.queue.append_val(cmd);

        var cmd = new GitMontitorQueue(src, this.gitlive);
        cmd.name = "commit";
        cmd.message = src.vpath;
        cmd.commit_all = true;

        this.queue.append_val(cmd);
        this.queue.push( 
            [ src.gitpath, 'rm' , src.vpath ],
            [ src.gitpath, 'commit', { all: true, message: src.vpath} ]
            
        );
    




}

