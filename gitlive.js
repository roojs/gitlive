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
*/

GIRepository      = imports.gi.GIRepository
GLib        = imports.gi.GLib;

//print(JSON.stringify(GI, null,4));
// we add this in, as it appears to get lost sometimes if we set it using the ENV. variable in builder.sh
//GI.Repository.prepend_search_path(GLib.get_home_dir() + '/.Builder/girepository-1.1');
GIRepository.Repository.prepend_search_path(GLib.get_home_dir() + '/.Builder/girepository-1.2');

var Gio      = imports.gi.Gio;
var Gtk      = imports.gi.Gtk;
var Notify = imports.gi.Notify;

var Spawn = imports.Spawn;
var Git = imports.Git;
var StatusIcon = imports.StatusIcon.StatusIcon;
var Monitor = imports.Monitor.Monitor;


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
    
    queue : [],
    queueRunning : false,
     
    start: function() {
        var _this = this;
        this.lastAdd = new Date();
        
        this.top.forEach(this.monitor, this);
         
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
        
        try { 
            var notification = new Notify.Notification({
                summary: "Git Live",
                body : gitlive + "\nMonitoring " + this.monitors.length + " Directories",
                timeout : 5
            });
    
            notification.set_timeout(5);
            notification.show();
        } catch(e) {
            print(e.toString());
        }

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
        
        print(JSON.stringify(cmds));
        
        cmds.forEach(function(cmd) {
            var gitpath = cmd.shift(); 
            if (typeof(repo_list[gitpath]) == 'undefined') {
                repo_list[gitpath] = new imports.Scm.Git.Repo.Repo( { repopath : gitpath });
                repo_list[gitpath].cmds = [];
                repo_list[gitpath].pull();
            }
            repo_list[gitpath].cmds.push(cmd);
        });
        
        // build add, remove and commit message list..
        
         
        for (var gitpath in repo_list) {
            var repo = repo_list[gitpath];
            var add_files = [];
            var remove_files = [];
            var messages = [];
            repo.cmds.forEach(function(cmd) {
                print(JSON.stringify(cmd));
                var name = cmd.shift();
                var arg = cmd.shift();
                
                switch(name) {
                    case 'add' :
                        if (add_files.indexOf(arg) > -1) break;
                        add_files.push(arg);
                        break;
                    
                    case 'rm':
                        remove_files.push(arg);
                        break;
                    
                    case 'commit' :
                        messages.push(arg.message);
                        break;    
                } 
            });
            repo.debug = 1;
            repo.add(add_files);
            repo.remove(remove_files);
            
            success.push(repo.commit({
                reason : messages.join("\n"),
                files : add_files  
            }));
            success.push(repo.push());
             
            
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
     * parsePath:
     * Fill in gitlive, vpath and repo  
     * 
     */
    parsePath: function(f)
    {
           
        var vpath_ar = f.path.substring(gitlive.length +1).split('/');
        
        f.gitpath = gitlive + '/' + vpath_ar.shift();
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
        this.parsePath(src);
        if (this.shouldIgnore(src)) {
            return;
        }
        
       
        var add_it = false;
        if (typeof(this.just_created[src.path]) !='undefined') {
            delete this.just_created[src.path];
            this.lastAdd = new Date();
            this.queue.push( 
                [ src.gitpath,  'add', src.vpath ],
                [ src.gitpath,  'commit',    { message: src.vpath} ] 
                
            );
         
            return;
        }
        this.lastAdd = new Date();
        this.queue.push( 
            [ src.gitpath,  'add', src.vpath ],
            [ src.gitpath,  'commit',  {  message: src.vpath} ]

            
        );
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
        this.queue.push( 
            [ src.gitpath, 'rm' , src.vpath ],
            [ src.gitpath, 'commit', { all: true, message: src.vpath} ]
            
        );
    
        
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
        this.lastAdd = new Date();
        this.queue.push( 
            [ src.gitpath, 'add' , src.vpath,  { all: true } ],
            [ src.gitpath, 'commit' , { all: true, message: src.vpath} ]
            
        );
        
        
    },
    onAttributeChanged : function(src) { 
        this.parsePath(src);
        if (this.shouldIgnore(src)) {
            return;
        }
        this.lastAdd = new Date();
        this.queue.push(
                        
            //[ src.gitpath, 'commit' ,  src.vpath, { message: src.vpath} ]
            [ src.gitpath, 'add' ,  src.vpath ],
             [ src.gitpath, 'commit' ,    {  message: "Attribute Changed :" + src.vpath} ]
        );
 
    
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
 
