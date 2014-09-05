
 

public class GitMonitorQueue : MonitorNamePathDir {
        // name = basename
        // path = full path..
        // dir = dir path
    
        public string gitpath;
        public string vdir;  // relative path (within git)
        public string vname;  // relative filename (within git)
        public string message ; // for commit
        public bool commit_all;
         
        public GitMonitorQueue(MonitorNamePathDir f) {

            base(f.name, f.path, f.dir);
 
            this.message = "";
            this.commit_all = false;
            
            var vpath_ar = this.dir.substring(GitMonitor.gitlive.length +1).split("/", 0);
            
            if (vpath_ar[0].length < 1) {

                this.gitpath = "";
                this.vdir = "";
                this.vname = "";
            }        


            this.gitpath = GitMonitor.gitlive + "/" + vpath_ar[0];
            
            string[]  vpath = {};
            for (var i = 1; i< vpath_ar.length; i++) {
                vpath += vpath_ar[i];
            }

            this.vdir =  string.joinv("/", vpath);

            this.vname =  this.vdir + (this.vdir.length > 0 ? "/" : "") + this.name;
/*
            stdout.printf(
                    "NEW GitMonitorQueue\nname: %s\npath: %s\ndir: %s\n" + 
                    "gitpath: %s\nvdir: %s\nvname: %s\n",
                    this.name, this.path, this.dir,
                    this.gitpath, this.vdir, this.vname
            );
*/

            //f.repo = new imports.Scm.Git.Repo({ repopath: f.gitpath })
        
        
        }

        public bool shouldIgnore()
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
            if (this.name[this.name.length -1] == '~') {
                return true;
            }

            //if (f.name.match(/~$/)) {
            //    return true;
            //}
            //if (f.name.match(/^nbproject/)) {
            //    return true;
            //}
            // ignore anything in top level!!!!
            if (this.gitpath.length < 1) {
                return true;
            }
            
            return false;
        }
        
        /** -- statics --*/
        
        public static int indexOfAdd( Array<GitMonitorQueue> add_files, string add)
        {
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
        public static string queueArrayToString(Array<GitMonitorQueue> list) {
            var ret = "";
            for(var i =0; i < list.length; i++) {
                
                ret += (ret.length > 0 ? ", " : "") + list.index(i).vname;
            }
            return ret;
            
        }
        
        public static bool GitMonitorQueue.queueHas(Array<GitMonitorQueue> list , GitMonitorQueue cmd_s, string action)) {
            for(var i =0; i < list.length; i++) {
                var test = list.index(i);
                if (list.index(i).gitpath != cmd_s.gitpath) {
                    continue
                }
                if (list.index(i).vname != cmd_s.vname) {
                    continue
                }
                if (list.index(i).action != action) {
                    continue
                }
                return true;
            }
            return false;
        }
        
}



public class GitMonitor : Monitor
{

    public static GitMonitor gitmonitor;
    /**
     * @property {String} the "gitlive" directory, normally ~/gitlive
     *  dset by OWNER... - we should do this as a CTOR.
     *  
     */
    public static string gitlive;
    
    
    public Array<GitMonitorQueue> queue ;
    public bool queueRunning = false;
    
    public DateTime lastAdd;
     
    
    public GitMonitor () {
        this.queue = new Array<GitMonitorQueue>();
        GitMonitor.gitmonitor = this;
    }



 
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
        
        Timeout.add_full(Priority.LOW, 500, () => {
            //stdout.printf("GitMonitor.start :: top.length = %u\n", this.top.length);
            // call this.monitor on each of 'top'
            for(int i = 0; i < this.top.length ; i++) {

                this.monitor(this.top.index(i) );
            }
            StatusIconA.statusicon.set_from_stock( Gtk.Stock.MEDIA_PLAY );
             
           
            
            try {

              
                var notification = new Notify.Notification(
                    "Git Live",
                    "%s\nMonitoring %u Directories".printf(GitMonitor.gitlive, this.monitors.length), 
                     "dialog-information"
                );
        
                notification.set_timeout(5);
                notification.show();
            } catch(Error e) {
                print(e.message);
            }
            return false; // do not keep doing this..

        });
        

        Timeout.add_full(Priority.LOW, 1000, () => {
            //TIMEOUT", _this.queue.length , _this.queueRunning].join(', '));

            //stdout.printf("QL %u: QR: %d\n", this.queue.length, this.queueRunning ? 1 : 0);
            if (this.queue.length < 1  || this.queueRunning) {
                return true;
            }
            
            var last = -1 * this.lastAdd.difference(new DateTime.now(new TimeZone.local()));
 
            // stdout.printf("LAST RUN: %s (expect %s) \n" ,
            //         last.to_string(),   (5 * TimeSpan.SECOND).to_string() );
 
            if (last < 5 * TimeSpan.SECOND) { // wait 5 seconds before running. ????
                return true;
            }
            //_this.lastAdd = new Date();
            //return 1;
        
            this.runQueue();
            return true; //
        });
         
    }


    public new void stop() {
        StatusIconA.statusicon.set_from_stock( Gtk.Stock.MEDIA_PAUSE );;
        base.stop();
    }
    
    
    public new void monitor (string path,  int depth = 0)
    {
        
        //var depth = typeof(depth) == 'number'  ? depth *1 : 0;
        
         
        // if we are not at top level.. and there is a .git directory  (it's a submodule .. ignore) 
        if (depth > 1 && FileUtils.test(path + "/.git" , FileTest.IS_DIR)) {
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
        print("GitMonitor.runQueue\n");

        this.queueRunning = true;

        var cmds = new Array<GitMonitorQueue>();

        for(var i = 0; i < this.queue.length; i++) {
            cmds.append_val(this.queue.index(i));
        }

        this.queue = new Array<GitMonitorQueue>();// empty queue!

        
        string[] success = {};
        string[] failure = {};
       //var repos = new Array<GitRepo>(); //??
        //var done = new Array<GitMonitorQueue>();
        
        // first build a array of repo's to work with
        var repo_list = new Array<GitRepo>();
        
        // pull and group.
        
        //print(JSON.stringify(cmds));
        // make sure nothing get's added to the queue where we are doing this..

        this.paused = true;

        print("GitMonitor.runQueue - creating repos\n");
        
        for(var i = 0; i < cmds.length; i++) {
           
            var cmd = cmds.index(i);
        
            var gitpath = cmd.gitpath; 
            stdout.printf("GitMonitor.runQueue - finding %s\n", cmd.gitpath);
        
            var ix  = GitRepo.indexOf(repo_list,  cmd.gitpath);
            if (ix < 0) {
                repo_list.append_val(new GitRepo( gitpath ));
                ix = GitRepo.indexOf(repo_list,  cmd.gitpath);
            }
            stdout.printf("GitMonitor.runQueue - adding to repolist %d\n", ix);

            //if (typeof(repo_list[gitpath]) == 'undefined') {
            //    repo_list[gitpath] = new imports.Scm.Git.Repo.Repo( { repopath : gitpath });
            //    repo_list[gitpath].cmds = [];
             //   repo_list[gitpath].pull();
            //}
            repo_list.index(ix).cmds.append_val(cmd);

        }
        this.paused = false;
        // build add, remove and commit message list..

        print("GitMonitor.runQueue - creating actions\n");
        
        for(var i = 0;i < repo_list.length;i++) {
     
            var repo = repo_list.index(i);

            var add_files = new Array<GitMonitorQueue>();
            var add_files_f = new Array<GitMonitorQueue>();
            var remove_files = new Array<GitMonitorQueue>();
            var messages = new Array<GitMonitorQueue>();
            //print(JSON.stringify(repo.cmds,null,4));
            
            for(var ii = 0;ii < repo.cmds.length;ii++) {
                var cmd = repo.cmds.index(ii);
    
                
                switch(cmd.action) {
                    case "add" :
                        
                        if (GitMonitorQueue.indexOfAdd(add_files, cmd.vname) > -1) {
                           break;
                        }
                        
                        add_files.append_val(cmd);
                        break;
                    
                    case "rm":
                        if (GitMonitorQueue.indexOfAdd(remove_files, cmd.vname) > -1 ) {
                           break;
                        }
                        
                        // if file exists, do not try and delete it.
                        if (FileUtils.test(cmd.vname, FileTest.EXISTS)) {
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
                        stdout.printf("Opps unmatched action %s\n", cmd.action);
                        break;
                } 
            }
            print( "ADD : %s\n", GitMonitorQueue.queueArrayToString(add_files));
            print( "REMOVE FILES: %s\n", GitMonitorQueue.queueArrayToString(remove_files));
            //repo.debug = 1;
            // these can fail... at present... as we wildcard stuff.
           
            // make sure added files do not get removed.. ?? 
            /*
            var remove_files_f = new Array<GitMonitorQueue>();
            for(var ii = 0;ii < remove_files.length;ii++) {
                if (GitMonitorQueue.indexOfAdd(add_files,  remove_files.index(ii).vname) > -1 ) {
                     continue;
                }
                remove_files_f.append_val(remove_files.index(ii));
            };
            stdout.printf("REMOVE : %u files\n"  , remove_files_f.length);
            */
            
            // if file was added, then removed, 
            var remove_files_f = new Array<GitMonitorQueue>();
            for(var ii = 0;ii < remove_files.length;ii++) {
                if (GitMonitorQueue.indexOfAdd(add_files,  remove_files.index(ii).vname) > -1 ) {
                    // in add and remove - do not remvove
                    continue;
                }
                remove_files_f.append_val(remove_files.index(ii));
            };
            for(var ii = 0;ii < add_files.length;ii++) {
                if (GitMonitorQueue.indexOfAdd(remove_files,  add_files.index(ii).vname) > -1 ) {
                    // in add and remove - do not remvove
                    continue;
                }
                add_files_f.append_val(add_files.index(ii));
            };
            
            print( "ADD : %s\n", GitMonitorQueue.queueArrayToString(add_files_f));
            print( "REMOVE FILES: %s\n", GitMonitorQueue.queueArrayToString(remove_files_f));
           
            
            // make sure monitoring is paused so it does not recursively pick up
            // deletions
            try {
                repo.pull();
            } catch(Error e) {
                failure +=  e.message;
            }
            
            
            // -- DO STUFF..            
            try {
                repo.add(add_files_f);
            } catch(Error e) {
                failure +=  e.message;
            }  
            try {
                 repo.remove(remove_files_f);
            } catch(Error e) {
                failure +=  e.message;
            }  

            this.paused = false;
            
            
            try { 
                success += repo.commit(
                    GitMonitorQueue.messageToString(messages),
                    add_files_f
                );
                success += repo.push();

            } catch(Error e) {
                failure += e.message;
                
            }   
        }
        
        // finally merge all the commit messages.
         
        try {
            // catch notification failures.. so we can carry on..
            if (success.length > 0) {

                
                var notification = new Notify.Notification(
                    "Git Live Commited",
                    string.joinv("\n",success),
                     "dialog-information"
                    
                );
    
                notification.set_timeout(5);
                notification.show();   
            }
            
            if (failure.length > 0) {

                var notification = new Notify.Notification(
                      "Git Live ERROR!!",
                    string.joinv("\n",failure),
                    "dialog-information"
                    
                );
    
                notification.set_timeout(5); // show errros for longer
                notification.show();   
            }
        } catch(Error e) {
            print(e.message);
            
        }
        this.queueRunning = false;
    }
    


    

    //string[] just_created;
 
 



   


    public override  void onChanged(MonitorNamePathDir src) 
    { 
        print("GitMonitor.onChanged\n");        
        return; // always ignore this..?
        //this.parsePath(src);
    }
    

 
    /**
     *  results in  git add  + git commit..
     *
     */
    public override void onChangesDoneHint(MonitorNamePathDir src)  
    { 
        print("GitMonitor.onChangedHint\n");        
        if (this.paused) {
            return;
        }
            

        this.lastAdd = new DateTime.now(new TimeZone.local()); 
        var cmd = new GitMonitorQueue(src);
        if (cmd.shouldIgnore()) {
            return;
        }
        
       
        //var add_it = false;
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
        cmd.action = "add";
        this.queue.append_val(cmd);

        cmd = new GitMonitorQueue(src);
        cmd.action = "commit";
        cmd.message = cmd.vname;
        this.queue.append_val(cmd);
 
         
    }
    public override  void onDeleted(MonitorNamePathDir src) 
   { 
        print("GitMonitor.onDeleted\n");        
        if (this.paused) {
            return;
        }
        this.lastAdd = new DateTime.now(new TimeZone.local()); 
        var cmd = new GitMonitorQueue(src);
        if (cmd.shouldIgnore()) {
            return;
        }
        // should check if monitor needs removing..
        // it should also check if it was a directory.. - so we dont have to commit all..
        cmd.action = "rm";
        this.queue.append_val(cmd);

        cmd = new GitMonitorQueue(src);
        cmd.action = "commit";
        cmd.message = cmd.vname;
        cmd.commit_all = true;

        this.queue.append_val(cmd);
 
    }
    public override  void onCreated(MonitorNamePathDir src) {
        print("GitMonitor.onCreated\n");        
        if (this.paused) {
            return;
        }
        this.lastAdd = new DateTime.now(new TimeZone.local()); 
        var cmd = new GitMonitorQueue(src);
        if (cmd.shouldIgnore()) {
            return;
        }

        if (!FileUtils.test(src.path, GLib.FileTest.IS_DIR)) {
           // this.just_created[src.path] = true;
            return; // we do not handle file create flags... - use done hint.
        }
        // directory has bee created
        this.monitor(src.path);
        //this.top.append_val(src.path);
        //this.monitor(src.path );


// -- no point in adding a dir.. as git does not handle them...
//        this.queue.push( 
  //          [ src.gitpath, 'add' , src.vpath,  { all: true } ],
 //           [ src.gitpath, 'commit' , { all: true, message: src.vpath} ]
  //          
   //     );

    }

    public  override void onAttributeChanged(MonitorNamePathDir src) { 
        print("GitMonitor.onAttributeChanged\n");        
        if (this.paused) {
            return;
        }
        if (src.dir == GitMonitor.gitlive) {
           return; // attribute on top level..
        }
        
        this.lastAdd = new DateTime.now(new TimeZone.local()); 
        var cmd = new GitMonitorQueue(src);
        if (cmd.shouldIgnore()) {
            return;
        }
        cmd.action = "add";
        this.queue.append_val(cmd);

        cmd = new GitMonitorQueue(src);
        cmd.action = "commit";
        cmd.message = "Attribute changed " + cmd.vname;
        this.queue.append_val(cmd);
    }
 
   public  override void onMoved(MonitorNamePathDir src,MonitorNamePathDir dest)  
    { 
        print("GitMonitor.onMoved\n");        
        if (this.paused) {
            return;
        }
        this.lastAdd = new DateTime.now(new TimeZone.local()); 
        var cmd_s = new GitMonitorQueue(src);

        var cmd_d = new GitMonitorQueue(dest);
   
        
        if (cmd_d.gitpath != cmd_s.gitpath) {
            this.onDeleted(src);
            this.onCreated(dest);
            this.onChangesDoneHint(dest);
            return;
        }
        // needs to handle move to/from unsupported types..
        
        if (cmd_s.shouldIgnore()) {
            this.onCreated(dest);
            this.onChangesDoneHint(dest);
            return;

        }
        if (cmd_d.shouldIgnore()) {
            
            this.onDeleted(src);
 

            return;
        }
        
        
        print("RM: %s\n", cmd_s.vname);
        cmd_s.action = "rm";
        this.queue.append_val(cmd_s);

        
        
        print("ADD: %s\n", cmd_d.vname);
        cmd_d.action = "add";
        this.queue.append_val(cmd_d);


        var cmd = new GitMonitorQueue(dest);
        cmd.action = "commit";
        cmd.message = "MOVED " + cmd_s.vname + " to " + cmd_d.vname;
        if (GitMonitorQueue.queueHas(this.queue, cmd_s, "add")) {
            cmd.message = cmd_d.vname;
        }
        
        this.queue.append_val(cmd);


         
    }
       
}
