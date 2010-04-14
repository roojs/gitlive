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

//File = imports[__script_path__+'/../introspection-doc-generator/File.js'].File

var ndirs = 0;
var watches = { };
function start_monitor(path, fn)
{
    
    ndirs++;
    Seed.print("ADD path" + path);
    var f = Gio.file_new_for_path(path);
    //var cancel = new Gio.Cancellable ();
    var fm = f.monitor(2,null); //Gio.FileMonitorFlags.SEND_MOVED
    fm.signal.changed.connect(fn);
    watches[path] = fm;
    // iterate children?
    
    var file_enum = f.enumerate_children(
        Gio.FILE_ATTRIBUTE_STANDARD_DISPLAY_NAME + ','+ 
        Gio.FILE_ATTRIBUTE_STANDARD_TYPE,
        Gio.FileQueryInfoFlags.NONE,
        null);
        
    while ((next_file = file_enum.next_file(null)) != null) {
     
        if (next_file.get_file_type() != Gio.FileType.DIRECTORY) {
            continue;
        }
        if (next_file.get_display_name()[0] == '.') {
            continue;
        }
        start_monitor(path+'/'+next_file.get_display_name(), fn)
    }
    
    file_enum.close(null);


    
}
var just_created = {}; 


function onChange(fm, f, of, event_type, uh) {
    Seed.print(f.get_path());
    if (f.get_basename()[0] == '.') {
        return;
    }
    if (f.get_basename().match(/~$/)) {
        return;
    }
    
    
    /*Seed.print(enumToString('Gio.FileMonitorEvent', event_type) + ":"  +
          f.get_path() + 
        (of ? ( " => " + of.get_path()  ) : '') 
        
    );*/
    
    // first handle maintenance..
    var path = f.get_path();
    var dpath = GLib.path_get_dirname(path);
    var gitlive = GLib.get_home_dir() + "/gitlive";
    var vpath_ar = path.substring(gitlive.length +1).split('/');
    var gitpath = gitlive + '/' + vpath_ar.shift();
    var vpath = vpath_ar.join('/');
    if (!vpath.length) {
        return;
    }
    try {
            
        
        switch(event_type) {
            case Gio.FileMonitorEvent.CHANGED:
                return; // ingore thise?? -wait for changes_done_htin?
                
            case Gio.FileMonitorEvent.CHANGES_DONE_HINT:
                var add_it = false;
                if (typeof(just_created[path]) !='undefined') {
                    delete just_created[path];
                    Git.run(gitpath, 'add', vpath);
                    var sp = Git.run(gitpath, 'commit', '-a', '-m' ,vpath);
                    Git.run(gitpath , 'push', '--all' );
                    notify(path,"CHANGED", sp);
                    return;
                }
                
                var sp = Git.run(gitpath, 'commit', '-a', '-m' ,vpath);
                Git.run(gitpath , 'push', '--all' );
                notify(path,"CHANGED", sp);
                return;
            case Gio.FileMonitorEvent.DELETED:
                var sp = Git.run(gitpath,'rm' , vpath);
                Git.run(gitpath , 'push', '--all' );
                if (sp.status !=0) {
                    notify(path,"DELETED", sp);
                    return;
                }
                sp = Git.run(gitpath,'commit' , '-a', '-m' ,vpath);
                Git.run(gitpath , 'push', '--all' );
                notify(path,"DELETED", sp);
                return;
            case Gio.FileMonitorEvent.CREATED:
                if (!GLib.file_test(path, GLib.FileTest.IS_DIR)) {
                    just_created[path] = true;
                    return; // we do not handle file create flags... - use done hint.
                }
                // director has bee cread.
                start_monitor(path, onChange);
                var sp = Git.run(gitpath, 'add', vpath);
                Git.run(gitpath , 'push', '--all' );

                if (sp.status !=0) {
                    notify(path,"CREATED", sp);
                    return;
                }
                //uh.call(fm,f,of, event_type);
                sp = Git.run(gitpath,'commit' , '-a', '-m' ,vpath);
                Git.run(gitpath , 'push', '--all' );
                notify(path,"CREATED", sp);
                return;
            
            case Gio.FileMonitorEvent.ATTRIBUTE_CHANGED: // eg. chmod/chatt
                var sp = Git.run(gitpath, 'commit', '-a', '-m' ,vpath);
                Git.run(gitpath , 'push', '--all' );
                notify(path,"ATTRIBUTE_CHANGED", sp);
                return;
            
            case Gio.FileMonitorEvent.MOVED: // eg. chmod/chatt
                var tpath = of.get_path();
                var tpath_ar = tpath.substring(gitlive.length +1).split('/');
                tpath_ar.shift();
                var vtpath = vpath_ar.join('/');
                
            
                var sp = Git.run(gitpath,  'mv',  '-k', vpath, vtpath);
                if (sp.status !=0) {
                    notify(path,"MOVED", sp);
                    return;
                }
                sp = Git.run(gitpath,'commit' , '-a', '-m' , 'MOVED ' + vpath +' to ' + vtpath);
                Git.run(gitpath , 'push', '--all' );
                notify(path,"MOVED", sp);
                return; 
            // rest ar emount related
        }
    } catch (e) {
        if (e.stderr.length) {
            notify(path, "ERROR", e.stderr);
            return;
        }
        notify(path, "ERROR", "unknown error?");
        
    }
}

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



  

function message(data) {
    var msg = new Gtk.MessageDialog({message_type:
        Gtk.MessageType.INFO, buttons : Gtk.ButtonsType.OK, text: "Information only"});
    msg.run();
    msg.destroy();
    Gtk.main_quit();
}

 


Gtk.init (null, null);
//
// need a better icon...
var icon = new Gtk.StatusIcon.from_stock(Gtk.STOCK_ABOUT);



icon.signal["popup-menu"].connect(function(w, event, event_time) {
    var menu = new Gtk.Menu();
    var open_item = new Gtk.MenuItem({label: "About"});
    var close_item = new Gtk.MenuItem({label: "Quit"});

    menu.append(open_item);
    menu.append(close_item);

    close_item.signal["activate"].connect( function() {
        Seed.quit();
    });
    open_item.signal["activate"].connect( 
        function message(data) {
            var msg = new Gtk.MessageDialog({message_type:
                Gtk.MessageType.INFO, buttons : Gtk.ButtonsType.OK, text: "GIT Live - auto commits and pushes everything in ~/gitlive"});
            msg.run();
            msg.destroy();
    });
    
    menu.show_all();
    menu.popup(null, null, null, null,  event, event_time);
});
Notify.init("gitlive");
if (!GLib.file_test(GLib.get_home_dir() + "/gitlive", GLib.FileTest.IS_DIR)) {
    var msg = new Gtk.MessageDialog({message_type:
        Gtk.MessageType.INFO, buttons : Gtk.ButtonsType.OK, text: "GIT Live - ~/gitlive does not exist."});
    msg.run();
    msg.destroy();
    
    Seed.quit();
} else {
    start_monitor(GLib.get_home_dir() + "/gitlive", onChange);    
    var notification = new Notify.Notification({
    	summary: "Git Live",
		body : GLib.get_home_dir() + "/gitlive\nMonitoring " + ndirs + " Directories"
	});

    notification.set_timeout(500);
    notification.show();   
    
    
}

Gtk.main();
//icon.signal["activate"].connect(on_left_click);
 