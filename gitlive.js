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

 
var gitlive = GLib.get_home_dir() + "/gitlive";

var monitor = new Monitor({
    
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
            Git.run(src.gitpath, 'add', src.vpath);
            var sp = Git.run(src.gitpath, 'commit', { all: true, message: src.vpath});
            Git.run(src.gitpath , 'push', { all: true } );
            notify(src.name,"CHANGED", sp);
            return;
        }
                
        var sp = Git.run(src.gitpath, 'commit', { all: true, message: src.vpath});
        Git.run(src.gitpath , 'push', '--all' );
        notify(src.name,"CHANGED", sp);

    },
    onDeleted : function(src) 
    { 
        this.parsePath(src);
        if (this.shouldIgnore(src)) {
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
        // director has bee cread.
        this.monitor(src.path);
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



  

function errrodialog(data) {
    var msg = new Gtk.MessageDialog({
            message_type: Gtk.MessageType.ERROR, 
            buttons : Gtk.ButtonsType.OK, 
            text: data
    });
    msg.run();
    msg.destroy();
}

 


Gtk.init (null, null);
//
// need a better icon...

StatusIcon.init(); 



Notify.init("gitlive");
if (!GLib.file_test(GLib.get_home_dir() + "/gitlive", GLib.FileTest.IS_DIR)) {
    var msg = new Gtk.MessageDialog({message_type:
        Gtk.MessageType.INFO, buttons : Gtk.ButtonsType.OK, text: "GIT Live - ~/gitlive does not exist."});
    msg.run();
    msg.destroy();
    
    Seed.quit();
} else {
    monitor.add(GLib.get_home_dir() + "/gitlive");
    monitor.start();
    var notification = new Notify.Notification({
    	summary: "Git Live",
		body : GLib.get_home_dir() + "/gitlive\nMonitoring " + monitor.monitors.length + " Directories"
	});

    notification.set_timeout(500);
    notification.show();   
    
    
}

Gtk.main();
//icon.signal["activate"].connect(on_left_click);
 