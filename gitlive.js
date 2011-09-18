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
var StatusIcon = imports.StatusIcon.StatusIcon;
var Monitor = imports.Monitor.Monitor;


//File = imports[__script_path__+'/../introspection-doc-generator/File.js'].File
Gtk.init (null, null);

// sanity check...

var gitlive = GLib.get_home_dir() + "/gitlive";

if (!GLib.file_test(gitlive, GLib.FileTest.IS_DIR)) {
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

imports.GitMonitor.GitMonitor.add(GLib.get_home_dir() + "/gitlive");
imports.GitMonitor.GitMonitor.start();

Gtk.main();
//icon.signal["activate"].connect(on_left_click);
 
