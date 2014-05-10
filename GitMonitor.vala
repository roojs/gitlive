

public class GitMonitorQueue : MonitorNamePathDir {
        // name = basename
        // path = full path..
        // dir = dir path
    
        public string gitpath;
        public string vpath;  // relative path (within git)
        public string vname;  // relative filename (within git)
        public string message ; // for commit
        public bool commit_all;
        




        public GitMonitorQueue(MonitorNamePathDir f) {

            base(f.name, f.path, f.dir);


            this.message = "";
            this.commit_all = false;
 
           
            var vpath_ar = this.path.substring(GitMonitor.gitlive.length +1).split("/", 0);
            
            this.gitpath = GitMonitor.gitlive + "/" + vpath_ar[0];
            
            string[]  vpath = {};
            for (var i = 1; i< vpath_ar.length; i++) {
                vpath += vpath_ar[i];
            }

            this.vpath =  string.joinv("/", vpath);

            this.vname =  this.vpath + (this.vpath.length > 0 ? "/" : "") + this.name;
            //f.repo = new imports.Scm.Git.Repo({ repopath: f.gitpath })
        
        
        }

        public bool shouldIgnore(GitMonitor gm)
        {
            
            
            
            // vim.. what a seriously brain dead program..
            if (this.name == "4913") {
                return true;
            }
            
            if (this.name[0] == '.') {
                // except!
                if (this.name == ".htaccess") {
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
            if (this.vpath.length < 1) {
                return true;
            }
            
            return false;
        }
        
        /** -- statics --*/
        
        public static int indexOfAdd( Array<GitMonitorQueue> add_files, string add) {
            for(var i =0; i < add_files.length; i++) {
                if (add_files.index(i).vname == add) {
                    return i;
                }
            }
            return -1;
        }
        public static  int indexOfMessage(Array<GitMonitorQueue> messages, string message)  {
            for(var i =0; i < messages.length; i++) {
                if (messages.index(i).message == message) {
                    return i;
                }
            }
            return -1;
        }
        public static string messageToString(Array<GitMonitorQueue> messages ) {
            string[] ret = {};
            for(var i =0; i < messages.length; i++) {
                ret+= messages.index(i).message;
            }
            return string.joinv("\n",ret);
        }

}



public class GitMonitor : Monitor
{

 
    /**
     * @property {String} the "gitlive" directory, normally ~/gitlive
     *  dset by OWNER... - we should do this as a CTOR.
     *  
     */
    public static string gitlive = "";
    
    
    public Array<GitMonitorQueue> queue ;
    public bool queueRunning = false;
    
    public DateTime lastAdd;
     
     
    public new void pause() {
        this.paused = true;
        // what does this do to the old one...
        this.queue = new Array<GitMonitorQueue> ();
        StatusIconA.statusicon.set_from_stock( Gtk.Stock.MEDIA_PAUSE );

    }
    
    public new void resume () {
        this.paused = false;
        this.queue = new Array<GitMonitorQueue> ();
        StatusIconA.statusicon.set_from_stock( Gtk.Stock.MEDIA_PLAY );
        
        
    }
    /**
     * Start the monitoring
     * and run the queue every 500 milliseconds..
     *
     */
    public new void start() {
        StatusIconA.statusicon.set_from_stock( Gtk.Stock.REFRESH );
        
         
        this.lastAdd = new DateTime.now(new TimeZone.local()); 
        
        Timeout.add_full(GLib.PRIORITY_LOW, 500, () => {

            // call this.monitor on each of 'top'
            for(int i = 0; i < this.top.length ; i++) {
                this.monitor(this.top.index(i) );
            }
            StatusIconA.statusicon.set_from_stock( Gtk.Stock.MEDIA_PLAY );
             
           
            
            try { 
                var notification = new Notify.Notification({
                    "Git Live",
                    GitMonitor.gitlive + "\nMonitoring " + _this.monitors.length + " Directories",
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

            var last = this.lastAdd.difference(new DateTime.now(new TimeZone.local()));

            
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


    public new void stop() {
        StatusIconA.statusicon.set_from_stock( Gtk.Stock.MEDIA_PAUSE );;
        base.stop();
    }
    
    
    public new void monitor (string path,  int depth = 0)
    {
        
        //var depth = typeof(depth) == 'number'  ? depth *1 : 0;
        
         
        // if we are not at top level.. and there is a .git directory  (it's a submodule .. ignore) 
        if (depth > 1 && GLib.file_test(path + "/.git" , GLib.FileTest.IS_DIR)) {
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
        
        
        base.monitor(path, depth);
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

        var cmds = new Array<GitMonitorQueue>();
        for(var i = 0; i < this.queue.length; i++) {
            cmds.append_val(this.queue.item(i));
        }

        this.queue = new Array<GitMonitorQueue>();// empty queue!

        
        string[] success = {};
        string[] failure = {};
        var repos = new Array<GitRepo>(); //??
        var done = new Array<GitMonitorQueue>();
        
        // first build a array of repo's to work with
        var repo_list = new Array<GitRepo>();
        
        // pull and group.
        
        //print(JSON.stringify(cmds));
        this.paused = true;
        
        for(var i = 0; i < cmds.length; i++) {
           
        
            var gitpath = cmd.gitpath; 
            var ix  = GitRepo.indexOf(this.repos,  cmd.gitpath);
            if (ix < 0) {
                repo_list.append_val(new GitRepo( gitpath ));
                ix = GitRepo.indexOf(this.repos,  cmd.gitpath);
            }
            

            //if (typeof(repo_list[gitpath]) == 'undefined') {
            //    repo_list[gitpath] = new imports.Scm.Git.Repo.Repo( { repopath : gitpath });
            //    repo_list[gitpath].cmds = [];
             //   repo_list[gitpath].pull();
            //}
            repo_list.item(ix).cmds.append_val(cmd);

        }
        this.paused = false;
        // build add, remove and commit message list..
        
        for(var i = 0;i < repo_list.length;i++) {
    

            var repo = repo_list.item(i);

            var add_files = new Array<GitMonitorQueue>();
            var remove_files = new Array<GitMonitorQueue>();
            var messages = new Array<GitMonitorQueue>();
            //print(JSON.stringify(repo.cmds,null,4));
            
            for(var ii = 0;ii < repo.cmds.length;ii++) {
                var cmd = repo.cmds.item(ii);
    
                
                switch(cmd.action) {
                    case "add" :
                        
                        if (GitMonitorQueue.indexOfAdd(add_files, cmd.vname) > -1) {
                           break;
                        }
        
                        
                        add_files.append_val(cmd);
                        break;
                    
                    case "rm":
                        if (GitMonitorQueue.indexOfAdd(add_files, cmd.rm) > -1 ) {
                           break;
                        }
                        
                        // if file exists, do not try and delete it.
                        if (GLib.file_test(cmd.rm, GLib.FileTest.EXISTS)) {
                            break;
                        }
                        
                        remove_files.append_val(cmd);
                        break;
                    
                    case "commit" :
                        if (GitMonitorQueue.indexOfMessage(messages, cmd.message) > -1 ) {
                           break;
                        }
                         
                        messages.append_val(cmd);
                        
                        break;
                    default:
                        print("Opps unmatched action");
                        break;
                } 
            }
            
            //repo.debug = 1;
            // these can fail... at present... as we wildcard stuff.
            stdout.printf("ADD : %d files"  , add_files.length);
            
            // make sure added files do not get removed..

            var remove_files_f = new Array<GitMonitorQueue>();
            for(var ii = 0;ii < remove_files.length;ii++) {
                if (GitMonitorQueue.indexOfAdd(add_files,  remove_files.item(ii).rm) > -1 ) {
                     continue;
                }
                remove_files_f.append_val(remove_files.item(ii));
            };
            stdout.printf("REMOVE : %d files"  , remove_files.length);
             
            // make sure monitoring is paused so it does not recursively pick up
            // deletions
            
            // -- DO STUFF..
            
            repo.add(add_files);
            repo.remove(remove_files_f);
            this.paused = false;
            
            
            try { 
                success += repo.commit(
                    GitMonitorQueue.messageToString(messages),
                    add_files  
                );
                success += repo.push();

            } catch(Error e) {
                failure += e.message;
                
            }   
        }
        
        // finally merge all the commit messages.
         
        try {
            // catch notification failures.. so we can carry on..
            if (success.length) {

                
                var notification = new Notify.Notification(
                    "Git Live Commited",
                    string.joinv("\n",success),
                     "dialog-information"
                    
                );
    
                notification.set_timeout(5);
                notification.show();   
            }
            
            if (failure.length) {

                var notification = new Notify.Notification({
                    summary: "Git Live ERROR!!",
                    string.joinv("\n",failure),
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
    


    

    //string[] just_created;
 
 



   


    public void onChanged(MonitorNamePathDir src) 
    { 
        return; // always ignore this..?
        //this.parsePath(src);
    }
    

 
    /**
     *  results in  git add  + git commit..
     *
     */
    public void onChangesDoneHint(MonitorNamePathDir src)  
    { 
        
        if (this.paused) {
            return true;
        }
            

        this.lastAdd = new DateTime.now(new TimeZone.local()); 
        var cmd = new GitMonitorQueue(src);
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

        this.queue.append_val(cmd);

        var cmd = new GitMonitorQueue(src);
        cmd.action = "commit";
        cmd.message = src.vpath;
        this.queue.append_val(cmd);
 
         
    }
    public void onDeleted(MonitorNamePathDir src) 
   { 
        if (this.paused) {
            return true;
        }
        this.lastAdd = new DateTime.now(new TimeZone.local()); 
        var cmd = new GitMonitorQueue(src);
        if (cmd.shouldIgnore()) {
            return;
        }
        // should check if monitor needs removing..
        // it should also check if it was a directory.. - so we dont have to commit all..
        cmd.action = "rm";
        cmd.rm = src.vpath;
        this.queue.append_val(cmd);

        var cmd = new GitMonitorQueue(src);
        cmd.action = "commit";
        cmd.message = src.vpath;
        cmd.commit_all = true;

        this.queue.append_val(cmd);
 
    }
    public void onCreated(MonitorNamePathDir src) {

        if (this.paused) {
            return true;
        }
        this.lastAdd = new DateTime.now(new TimeZone.local()); 
        var cmd = new GitMonitorQueue(src);
        if (cmd.shouldIgnore()) {
            return;
        }

        if (!GLib.file_test(src.path, GLib.FileTest.IS_DIR)) {
           // this.just_created[src.path] = true;
            return; // we do not handle file create flags... - use done hint.
        }
        // directory has bee created
        this.monitor(src.path);
        this.top.append_val(src.path);
        this.monitor(src.path );


// -- no point in adding a dir.. as git does not handle them...
//        this.queue.push( 
  //          [ src.gitpath, 'add' , src.vpath,  { all: true } ],
 //           [ src.gitpath, 'commit' , { all: true, message: src.vpath} ]
  //          
   //     );

    }

    public void onAttributeChanged(MonitorNamePathDir src) { 

        if (this.paused) {
            return true;
        }
        this.lastAdd = new DateTime.now(new TimeZone.local()); 
        var cmd = new GitMonitorQueue(src);
        if (cmd.shouldIgnore()) {
            return;
        }
        cmd.action = "add";
        this.queue.append_val(cmd);

        var cmd = new GitMonitorQueue(src);
        cmd.action = "commit";
        cmd.message = "Attribute changed " + cmd.vpath;
        this.queue.append_val(cmd);
    }


   public void onMoved(MonitorNamePathDir src,MonitorNamePathDir dest)  
    { 
        this.lastAdd = new DateTime.now(new TimeZone.local()); 
        var cmd_s = new GitMonitorQueue(src);

        var cmd_d = new GitMonitorQueue(src);
   
        
        if (cmd_d.gitpath != cmd_s.gitpath) {
            this.onDeleted(src);
            this.onCreated(dest);
            this.onChangedDoneHint(dest);
            return;
        }
        // needs to handle move to/from unsupported types..
        
        if (this.shouldIgnore(src)) {
            this.onCreated(dest);
            this.onChangedDoneHint(dest);
            return;

        }
        if (this.shouldIgnore(dest)) {
            
            this.onDeleted(src);
 

            return;
        }
        
        cmd_s.action = "rm";
        this.queue.append_val(cmd_s);




        cmd_d.action = "add";
        this.queue.append_val(cmd_d);


        var cmd = new GitMonitorQueue(dest);
        cmd.action = "commit";
        cmd.message = "MOVED " + cmd_s.vpath + " to " + cmd_d.vpath;
        this.queue.append_val(cmd);


         
    }
       
}
