#!/usr/bin/seed 
//<Script type="text/javascript">
/**
 * runtime file
 * takes a gtk project directory, and turns it into an application!
 * by compling the files into JS files..
 * 
 * Initially developed for runtime testing. (the vte runner)
 * 
 * Might be the way to go for full runtime 
 * 
 * 
 * Usage: (call with wrapper to set up directories..)
 *    sh builder.sh
 * 
 * Concepts.. 
 * a) load dependancies.. (eg. gi's..) - derived later?
 * Gtk.init()
 * 
 * loop the files (find .bjs)
 *   - comple to js (if not exist // or force enabled..)
 * b) load all the files
 * 
 * Gtk.main();
 * 
 */
// autogen?

// sort out import path - this is  a bit of a mess..
GIRepository = imports.gi.GIRepository;
GLib        = imports.gi.GLib;

// we add this in, as it appears to get lost sometimes if we set it using the ENV. variable in builder.sh
GIRepository.IRepository.prepend_search_path(GLib.get_home_dir() + '/.Builder/girepository-1.1');
//print(JSON.stringify(GIRepository.IRepository.get_search_path()));

Gtk         = imports.gi.Gtk;
Gdk         = imports.gi.Gdk;
Pango       = imports.gi.Pango;

Gio         = imports.gi.Gio;
GObject     = imports.gi.GObject;
GtkSource   = imports.gi.GtkSource;
WebKit      = imports.gi.WebKit;
Vte         = imports.gi.Vte;

Gdl         = imports.gi.Gdl;

GtkClutter  = imports.gi.GtkClutter;

if (GtkClutter) {    
    GtkClutter.init(Seed.argv);
}

File    = imports.File.File;

XObject = imports.XObject.XObject;
//XObject.debug = true;
Gtk.init(Seed.argv);


imports.searchPath.push('/'); // allow global paths..
// error checking todo..
 
var ret = imports.FixBug.FixBug.show();
print("show returned\n");
print(JSON.stringify(ret,null, 4));


           
Gtk.main();
 
