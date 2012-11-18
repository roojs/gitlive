#!/usr/bin/env seed

Gtk = imports.gi.Gtk;
WebKit = imports.gi.WebKit;
Hotkey = imports.gi.GtkHotkey;

Gtk.init(Seed.argv);

Tabbed   = imports.Tabbed;
Settings = imports.Settings;

window = new Gtk.Window({title: "Browser"});
//window.resize(800, 600);
//window.signal.hide.connect(Gtk.main_quit);

Tabbed.browser = new Tabbed.Browser.Tabbed();
window.add(Tabbed.browser);

var state = false;
window.show_all();
window.hide();
//window.fullscreen();
  
    var hot = new Hotkey.Info.c_new("gtkhotkey-test", "gtkhotkey-test-key","<Control>Escape" );  
	
	//g_signal_connect (hot, "notify::bound", G_CALLBACK(hotkey_bound_cb), NULL);
	//hot.bind();
	//error = NULL;
    var x = hot.bind();
    print("BIND RETURNED" + x);
	//gtk_hotkey_info_bind (hot, &error);
	hot.signal.activated.connect(function ( ) {
        
         
        if (!state) {
            window.show_all();
            GLib.timeout_add(GLib.PRIORITY_LOW, 500, function() {
                window.fullscreen();
                window.grab_focus();
            });    
            
        } else {
            window.unfullscreen();
            window.hide();
        }
        state= !state;
        print ("GOT hotkey test")
        
    }); 
 

Gtk.main();