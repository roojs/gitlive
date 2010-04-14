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
    
    Seed.print(enumToString('Gio.FileMonitorEvent', event_type) + ":"  +
          f.get_path() + 
        (of ? ( " => " + of.get_path()  ) : '') 
        
    );
    
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
    
    
    switch(event_type) {
        case Gio.FileMonitorEvent.CHANGED:
            return; // ingore thise?? -wait for changes_done_htin?
            
        case Gio.FileMonitorEvent.CHANGES_DONE_HINT:
            var add_it = false;
            if (typeof(just_created[path]) !='undefined') {
                delete just_created[path];
                git(gitpath, 'add', vpath);
                var sp = git(gitpath, 'commit', '-a', '-m' ,vpath);
                notify(path,"CHANGED", sp);
                return;
            }
            
            var sp = git(gitpath, 'commit', '-a', '-m' ,vpath);
            notify(path,"CHANGED", sp);
            return;
        case Gio.FileMonitorEvent.DELETED:
            var sp = git(gitpath,'rm' , vpath);
            if (sp.status !=0) {
                notify(path,"DELETED", sp);
                return;
            }
            sp = git(gitpath,'commit' , '-a', '-m' ,vpath);
            notify(path,"DELETED", sp);
            return;
        case Gio.FileMonitorEvent.CREATED:
            if (!GLib.file_test(path, GLib.FileTest.IS_DIR)) {
                just_created[path] = true;
                return; // we do not handle file create flags... - use done hint.
            }
            // director has bee cread.
            start_monitor(path, onChange);
            var sp = git(gitpath, 'add', vpath);
            if (sp.status !=0) {
                notify(path,"CREATED", sp);
                return;
            }
            //uh.call(fm,f,of, event_type);
            sp = git(gitpath,'commit' , '-a', '-m' ,vpath);
            notify(path,"CREATED", sp);
            return;
        
        case Gio.FileMonitorEvent.ATTRIBUTE_CHANGED: // eg. chmod/chatt
            var sp = git(gitpath, 'commit', '-a', '-m' ,vpath);
            notify(path,"ATTRIBUTE_CHANGED", sp);
            return;
        
        case Gio.FileMonitorEvent.MOVED: // eg. chmod/chatt
            var tpath = of.get_path();
            var tpath_ar = tpath.substring(gitlive.length +1).split('/');
            tpath_ar.shift();
            var vtpath = vpath_ar.join('/');
            
        
            var sp = git(gitpath,  'mv',  '-k', vpath, vtpath);
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
}
function notify(fn, act , sp)
{
    var sum = act + " " + fn;
    var body = sp.output;
    if (sp.status != 0) {
        sum = "ERROR:" + sum;
        body = sp.error;
    }
    var notification = new Notify.Notification({
    	summary: sum,
		body : body
	});

    notification.set_timeout(500);
    notification.show();
}




function git()
{
    var args = Array.prototype.slice.call(arguments);
    
    
    if (!GLib.file_test(args[0]+'/.git', GLib.FileTest.IS_DIR)) {
       return; // not git managed!
    }
    
    var wd = args.shift();
    args.unshift('git');
    var out_values = { };
    Seed.print(wd+':'+args.join(' '));
    
    
    var sp = spawn(wd, args);
    Seed.print(sp.output);
    Seed.print(sp.error);
    Seed.print(sp.status);
    if (sp.status !=0 ){
        return sp;
    }
    out_values = { };
    sp = spawn(wd, [ 'git', 'push', '--all'] );
    Seed.print(sp.output);
    Seed.print(sp.error);
    Seed.print(sp.status);
    return sp;
}
function spawn(cwd, s) {
    var ret = { };
    var retval =  { output: '' , error : '', cmd : s.join(' ') , done : false};
    GLib.spawn_async_with_pipes(cwd, s, null, 
        GLib.SpawnFlags.DO_NOT_REAP_CHILD + GLib.SpawnFlags.SEARCH_PATH , 
        null, null, ret);
        
    var ctx = GLib.main_loop_new (null, false);
    var started = false;
    
    GLib.child_watch_add(GLib.PRIORITY_DEFAULT, ret.child_pid, function(pid, status) {
        retval.status = status;
        retval.done = true;
        GLib.spawn_close_pid(ret.child_pid);
        if (started) {
            GLib.main_loop_quit(ctx);
        }
        
    });
    var in_ch = GLib.io_channel_unix_new(ret.standard_input);
    var out_ch = GLib.io_channel_unix_new(ret.standard_output);
    var err_ch = GLib.io_channel_unix_new(ret.standard_error);
    // fixme - put non-blocking
    GLib.io_channel_set_flags (in_ch,GLib.IOFlags.NONBLOCK);
    GLib.io_channel_set_flags (out_ch,GLib.IOFlags.NONBLOCK);
    GLib.io_channel_set_flags (err_ch,GLib.IOFlags.NONBLOCK);

    function readstr(ch, prop) {
        while (true) {
            var x = new GLib.String();
            var cstatus = GLib.io_channel_get_buffer_condition(ch);
            cstatus = GLib.io_channel_get_flags (ch);
            var status = GLib.io_channel_read_line_string (ch, x);
            switch(status) {
                case GLib.IOStatus.NORMAL:
                    //write(fn, x.str);
                    retval[prop] += x.str;
                   continue
                case GLib.IOStatus.AGAIN:   
                    break;
                case GLib.IOStatus.ERROR:    
                case GLib.IOStatus.EOF:   
                   break;
                
            }
            break;
        }
    }
    var out_src= GLib.io_add_watch(out_ch, GLib.PRIORITY_DEFAULT, 
        GLib.IOCondition.OUT + GLib.IOCondition.IN  + GLib.IOCondition.PRI, function()
    {
        //Seed.print("GOT INOUT ON IN");
        readstr(out_ch,  'output');
        
    });
    var err_src= GLib.io_add_watch(err_ch, GLib.PRIORITY_DEFAULT, 
        GLib.IOCondition.ERR + GLib.IOCondition.IN + GLib.IOCondition.PRI + GLib.IOCondition.OUT, 
        function()
    {
        // Seed.print("GOT INOUT ON ERR");
         readstr(err_ch, 'error');
         
    });
    if (!retval.done) {
        started = true;
        //console.log("STARTING LOOP");
        GLib.main_loop_run(ctx, false); // wait fore exit?
    }
    readstr(out_ch,  'output');
    readstr(err_ch,  'error');
    GLib.io_channel_close(in_ch);
    GLib.io_channel_close(out_ch);
    GLib.io_channel_close(err_ch);
    GLib.source_remove(err_src);
    GLib.source_remove(out_src);
    
    
    return retval;
}
function enumToString(type, n) {
    
    var gi = GI.IRepository.get_default();
    var t = type.split('.');
    var bi = gi.find_by_name(t[0], t[1]);  
    for(var i =0; i < GI.enum_info_get_n_values(bi); i++) {
        var prop = GI.enum_info_get_value(bi,i);
        if (GI.value_info_get_value(prop)  == n) {
            return GI.base_info_get_name(prop).toUpperCase();
        }
    }
    return '??';
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
 