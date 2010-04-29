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
GI      = imports.gi.GIRepository;
Gio      = imports.gi.Gio;
GLib      = imports.gi.GLib;
Gtk      = imports.gi.Gtk;
Notify = imports.gi.Notify;

Spawn = imports.Spawn;
Git = imports.Git;
StatusIcon = imports.StatusIcon.StatusIcon;
Monitor = imports.Monitor.Monitor;


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
    nqv : false, // temp var while I switch to queued version.
    
    start: function() {
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

        notification.set_timeout(500);
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
        this.queue.forEach(function (q) {
            cmds.push(q);
        });
        this.queue = []; // empty queue!
        
        var success = [];
        var failure = [];
        var repos = [];
        cmds.forEach(function(cmd) {
            if (repos.indexOf(cmd[0]) < 0) {
                repos.push(cmd[0]);
            }
            var sp = Git.run.apply(Git,cmd);
             
            switch (sp.result) {
                case 0: // success:
                    success.push(sp.args.join(' '));
                    success.push(sp.output);
                    failure.push(sp.stderr);
                    break;
                default: 
                    failure.push(sp.args.join(' '));
                    failure.push(sp.output);
                    failure.push(sp.stderr);
                    break;
            }
            
        });
        
        
        // push upstream.
        repos.forEach(function(r) {
            var sp = Git.run(r , 'push', { all: true } );
            if (sp.length) {
                success.push(sp);
            }
            
        });
        
        if (success.length) {
        
            var notification = new Notify.Notification({
                summary: "Git Live Commited",
                body : success.join("\n")
                
            });

            notification.set_timeout(500);
            notification.show();   
        }
        if (failure.length) {
        
            var notification = new Notify.Notification({
                summary: "Git Live ERROR!!",
                body : failure.join("\n")
                
            });

            notification.set_timeout(500);
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
    
    parsePath: function(f) {
           
        var vpath_ar = f.path.substring(gitlive.length +1).split('/');
        
        f.gitpath = gitlive + '/' + vpath_ar.shift();
        f.vpath =  vpath_ar.join('/');
        
        
    },
    
    just_created : {},
      
    onChanged : function(src) 
    { 
        return; // always ignore this..?
        //this.parsePath(src);
    },
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
                [ src.gitpath,  'commit',  src.vpath, { message: src.vpath} ] 
                
            );
            if (this.nqv) {
                
                Git.run(src.gitpath, 'add', src.vpath);
                var sp = Git.run(src.gitpath, 'commit', { all: true, message: src.vpath});
                Git.run(src.gitpath , 'push', { all: true } );
                notify(src.name,"CHANGED", sp);
            }
            return;
        }
        this.lastAdd = new Date();
        this.queue.push( 
            [ src.gitpath,  'add', src.vpath ],
            [ src.gitpath,  'commit', src.vpath, {  message: src.vpath} ]

            
        );
        if (this.nqv) {
            var sp = Git.run(src.gitpath, 'commit', { all: true, message: src.vpath});
            Git.run(src.gitpath , 'push', '--all' );
            notify(src.name,"CHANGED", sp);
        }

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
        if (!this.nqv) {
            return;
        }
        
        var sp = Git.run(src.gitpath,'rm' , src.vpath);
        Git.run(src.gitpath , 'push', { all: true } );
        if (sp.status !=0) {
            notify(src.name,"DELETED", sp);
            return;
        }
        sp = Git.run(src.gitpath,'commit' ,{ all: true, message: src.vpath});
        Git.run(src.gitpath , 'push',{ all: true });
        notify(src.name,"DELETED", sp);
        return;
        
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
        if (!this.nqv) {
            return;
        }
        var sp = Git.run(src.gitpath, 'add', src.vpath);
        Git.run(src.gitpath , 'push', { all: true } );

        if (sp.status !=0) {
            notify(src.path,"CREATED", sp);
            return;
        }
        //uh.call(fm,f,of, event_type);
        sp = Git.run(src.gitpath,'commit' , { all: true, message: src.vpath});
        Git.run(src.gitpath , 'push', { all: true } );
        notify(src.path,"CREATED", sp);
        return;
        
    },
    onAttributeChanged : function(src) { 
        this.parsePath(src);
        if (this.shouldIgnore(src)) {
            return;
        }
        this.lastAdd = new Date();
        this.queue.push( 
            [ src.gitpath, 'commit' ,  src.vpath, { message: src.vpath} ]
        );
        if (!this.nqv) {
            return;
        }
        var sp = Git.run(src.gitpath, 'commit',{ all: true, message: src.vpath});
        Git.run(src.gitpath , 'push', { all: true } );
        notify(src.path,"ATTRIBUTE_CHANGED", sp);
        return;
    
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
            [ src.gitpath, 'mv',  '-k', src.vpath, dest.vpath ],
            [ src.gitpath, 'commit' ,  src.vpath, dest.vpath ,
                { message:   'MOVED ' + src.vpath +' to ' + dest.vpath} ]
        );
        
        if (!this.nqv) {
            return;
        }
        
        var sp = Git.run(src.gitpath,  'mv',  '-k', src.vpath, dest.vpath);
        if (sp.status !=0) {
            notify(dest.path,"MOVED", sp);
            return;
        }
        sp = Git.run(src.gitpath,'commit' , { all: true, message:   'MOVED ' + src.vpath +' to ' + dest.vpath} );
        Git.run(src.gitpath , 'push', { all: true } );
        notify(src.path,"MOVED", sp);
        
    }
          
    
});
 
 
 

function notify(fn, act , sp)
{
    var sum = act + " " + fn;
    
    var notification = new Notify.Notification({
    	summary: sum,
		body : sp
	});

    notification.set_timeout(500);
    notification.show();
}



  

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
 
