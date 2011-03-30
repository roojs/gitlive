#!/usr/bin/seed
///<script type="text/javascript">
/**
* Git Live
* 
* inotify hooks for ~/gitlive
* that commit and push any changes made.
* Bit like a revision controled backed up file system!?
*
*
* The aims of this
* A) have a gitlive branch - where all our commits go.. - so they can be replicated on the server 
* B) HEAD branch - where things get merged to..
*    -- eventually on closing issues..
*    -- currently when we switch from one feature to another..
*    
* 
*
* Notes on feature branch implementation
* we clone directory into gitlive_feature/XXXXX
*     git branch issue_XXX
*     git checkout issue_XXX
*    
* 
*




* 
*/

GI      = imports.gi.GIRepository
GLib        = imports.gi.GLib;

// we add this in, as it appears to get lost sometimes if we set it using the ENV. variable in builder.sh
GI.IRepository.prepend_search_path(GLib.get_home_dir() + '/.Builder/girepository-1.1');

Gio         = imports.gi.Gio;
Gtk         = imports.gi.Gtk;
Notify      = imports.gi.Notify;

Spawn       = imports.Spawn;
Git         = imports.Git;
StatusIcon  = imports.StatusIcon.StatusIcon;
Monitor     = imports.Monitor.Monitor;


//File = imports[__script_path__+'/../introspection-doc-generator/File.js'].File
Gtk.init (null, null);

var gitlive = GLib.get_home_dir() + "/gitlive";

if (!GLib.file_test(gitlive, GLib.FileTest.IS_DIR)) {
    var msg = new Gtk.MessageDialog({message_type:
        Gtk.MessageType.INFO, buttons : Gtk.ButtonsType.OK, text: "GIT Live - ~/gitlive does not exist."});
    msg.run();
    msg.destroy();
    
    Seed.quit();
}

 
var monitor = new Monitor({
    /**
     *
     * queue objects
     *  action: 'add' | rm | update
     *  repo : 'gitlive'
     *  file : XXXXX
     *
     * 
     *
     */
    action_queue : [],
    queueRunning : false,
     
    start: function()
    {
        var _this = this;
        this.lastAdd = new Date();
         
        GLib.timeout_add(GLib.PRIORITY_LOW, 500, function() {
            //TIMEOUT", _this.queue.length , _this.queueRunning].join(', '));
            if (!_this.queue.length || _this.queueRunning) {
                return 1;
            }
            var last = Math.floor(((new Date()) - this.lastAdd) / 100);
            if (last < 4) { // wait 1/2 a seconnd before running.
                return 1;
            }
            _this.runQueue();
            return 1;
        },null,null);
        
        Monitor.prototype.start.call(this);
        var notification = new Notify.Notification({
            summary: "Git Live",
            body : gitlive + "\nMonitoring " + this.monitors.length + " Directories"
        });

        notification.set_timeout(2000);
        notification.show();   
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
        this.queueRunning = true;
        var cmds = [];
        //this.queue.forEach(function (q) {
        //    cmds.push(q);
        //});
        
        this.action_queue.forEach(function (q) {
            cmds.push(q);
        });
        //this.queue = []; // empty queue!
        this.action_queue = [];
        var success = [];
        var failure = [];
        var repos = [];
        var done = [];
        
        function readResult(sp) {
            switch (sp.result * 1) {
                case 0: // success:
                    success.push(sp.args.join(' '));
                    if (sp.output.length) success.push(sp.output + '');
                  // if (sp.stderr.length) success.push(sp.stderr + '');
                    break;
                default: 
                    failure.push(sp.args.join(' '));
                    if (sp.output.length) failure.push(sp.output);
                    if (sp.stderr.length) failure.push(sp.stderr);
                    break;
            }
        }
            
        cmds.forEach(function(cmd) {
            // prevent duplicate calls..
            if (done.indexOf(JSON.stringify(cmd)) > -1) {
                return;
            }
            done.push(JSON.stringify(cmd));
            // --- we keep a list of repositories that will be pushed to at the end..
            
            if (repos.indexOf(cmd.repos) < 0) {
                repos.push(cmd.repos);
                //    Git.run(cmd.repos , 'pull'); // pull before we push!
            }
            
            var gp  = gitlive + '/' + cmd.repo;
            
            switch( cmd.action ) {
                case 'add':
                    readResult(Git.run(gp, 'add',  cmd.file ));
                    readResult(Git.run(gp, 'commit',  src.file, { message: cmd.file}  ));
                    break;
                    
                case 'rm':
                    readResult(Git.run(gp, 'rm',  cmd.file ));
                    readResult(Git.run(gp, 'commit',  { all: true, message: cmd.file}  ));
                    break;
                     
                case 'update':
                    readResult(Git.run(gp, 'commit', cmd.file  , {   message: cmd.file}  ));
                    break;
                    
                case 'mv':
                    readResult(Git.run(gp, 'mv', cmd.file , cmd.target));
                    readResult(Git.run(gp, 'commit', cmd.file  , cmd.target,
                            {   message: 'MOVED ' + src.file +' to ' + dest.target }  ));
                    break; 
            }
            
             
            
        });
         
        // push upstream.
        repos.forEach(function(r) {
            var sp = Git.run(gitlive + '/' +r , 'push', { all: true } );
            if (sp.length) {
                success.push(sp);
            }
            
        });
        
        if (success.length) {
            print(success.join("\n"));
            var notification = new Notify.Notification({
                summary: "Git Live Commited",
                body : success.join("\n")
                
            });

            notification.set_timeout(2000);
            notification.show();   
        }
        if (failure.length) {
        
            var notification = new Notify.Notification({
                summary: "Git Live ERROR!!",
                body : failure.join("\n")
                
            });

            notification.set_timeout(5000); // show errros for longer
            notification.show();   
        }
        this.queueRunning = false;
    },
    
    shouldIgnore: function(f)
    {
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
        // ignore anything in top level!!!!
        if (!f.vpath.length) {
            return true;
        }
        
        return false;
        
    },
    
    /**
     * set gitpath and vpath
     * 
     * 
     */
    
    parsePath: function(f)
    {
           
        var vpath_ar = f.path.substring(gitlive.length +1).split('/');
        f.repo = vpath_ar.shift();
        f.gitpath = gitlive + '/' + f.repo;
        f.vpath =  vpath_ar.join('/');
        
        
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
     *
     *
     */
    
    onChangesDoneHint : function(src) 
    { 
        this.parsePath(src);
        if (this.shouldIgnore(src)) {
            return;
        }
        
        var add_it = false;
        if (typeof(this.just_created[src.path]) !='undefined') {
            delete this.just_created[src.path];
            this.lastAdd = new Date();
            //this.queue.push( 
            //    [ src.gitpath,  'add', src.vpath ],
            //    [ src.gitpath,  'commit',  src.vpath, { message: src.vpath} ] 
            //    
            //);
            this.action_queue.push({
                action: 'add',
                repo : src.repo,
                file : src.vpath
            });
            
            
         
            return;
        }
        this.lastAdd = new Date();
        //this.queue.push( 
        //    [ src.gitpath,  'add', src.vpath ],
        //    [ src.gitpath,  'commit', src.vpath, {  message: src.vpath} ]
        //
        //);
        
        this.action_queue.push({
            action: 'add',
            repo : src.repo,
            file : src.vpath
        });
        

    },
    onDeleted : function(src) 
    { 
        this.parsePath(src);
        if (this.shouldIgnore(src)) {
            return;
        }
        // should check if monitor needs removing..
        // it should also check if it was a directory.. - so we dont have to commit all..
        
        this.lastAdd = new Date();
        //this.queue.push( 
        //    [ src.gitpath, 'rm' , src.vpath ],
        //    [ src.gitpath, 'commit', { all: true, message: src.vpath} ]
        //    
        //);
        this.action_queue.push({
            action: 'rm',
            repo : src.repo,
            file : src.vpath
        });
        
    },
    onCreated : function(src) 
    { 
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
        
        /*
          since git does not really handle directory adds...
         
        this.lastAdd = new Date();
        this.action_queue.push({
            action: 'add',
            repo : src.repo,
            file : src.vpath
        });
        
        this.queue.push( 
            [ src.gitpath, 'add' , src.vpath,  { all: true } ],
            [ src.gitpath, 'commit' , { all: true, message: src.vpath} ]
            
        );
        */
        
        
    },
    onAttributeChanged : function(src) { 
        this.parsePath(src);
        if (this.shouldIgnore(src)) {
            return;
        }
        this.lastAdd = new Date();
        
        
        //this.queue.push( 
       //     [ src.gitpath, 'commit' ,  src.vpath, { message: src.vpath} ]
       // );
        this.action_queue.push({
            action: 'update',
            repo : src.repo,
            file : src.vpath
        });
 
    
    },
    
    onMoved : function(src,dest)
    { 
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
        this.lastAdd = new Date();
       // this.queue.push( 
       //     [ src.gitpath, 'mv',  '-k', src.vpath, dest.vpath ],
       //     [ src.gitpath, 'commit' ,  src.vpath, dest.vpath ,
       //         { message:   'MOVED ' + src.vpath +' to ' + dest.vpath} ]
       // );
        
        this.action_queue.push({
            action: 'mv',
            repo : src.repo,
            file : src.vpath,
            target : dest.vpath
            
        });
        
    }
          
    
});
 
 
  

function errorDialog(data) {
    var msg = new Gtk.MessageDialog({
            message_type: Gtk.MessageType.ERROR, 
            buttons : Gtk.ButtonsType.OK, 
            text: data
    });
    msg.run();
    msg.destroy();
}

 



//
// need a better icon...


StatusIcon.init();   


Notify.init("gitlive");

monitor.add(GLib.get_home_dir() + "/gitlive");
monitor.start();
Gtk.main();
//icon.signal["activate"].connect(on_left_click);
 
