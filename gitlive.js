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
// see the install instructions on how to override the default gir's
GIRepository.Repository.prepend_search_path(GLib.get_home_dir() + '/.Builder/girepository-1.2');

var Gio      = imports.gi.Gio;
var Gtk      = imports.gi.Gtk;
var Notify   = imports.gi.Notify;
 
 
var StatusIcon  = imports.StatusIcon.StatusIcon;
var Monitor     = imports.Monitor.Monitor;
var GitMonitor  = imports.GitMonitor.GitMonitor;
var WindowLog  = imports.WindowLog.WindowLog;


Gtk.init (null, null);

// sanity check...

// where is everything..
GitMonitor.gitlive =  GLib.get_home_dir() + "/gitlive";

if (!GLib.file_test(GitMonitor.gitlive, GLib.FileTest.IS_DIR)) {
    var msg = new Gtk.MessageDialog({message_type:
        Gtk.MessageType.INFO, buttons : Gtk.ButtonsType.OK, text: "GIT Live - ~/gitlive does not exist."});
    msg.run();
    msg.destroy();
    Seed.quit();
}
 
// I'm lost...

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

GitMonitor.add(GitMonitor.gitlive);
GitMonitor.start();

WindowLog.start();


Gtk.main();
vv//icon.signal["activate"].connect(on_left_click);
 
