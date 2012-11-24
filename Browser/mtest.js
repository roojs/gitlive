Gtk = imports.gi.Gtk;
WebKit = imports.gi.WebKit;
Gtk.init(null);

let win = new Gtk.Window();

let sw = new Gtk.ScrolledWindow({});
win.add(sw);

let view = new WebKit.WebView();
view.load_uri("http://www.google.com/");
sw.add(view);

win.set_size_request(640, 480);
win.show_all();

Gtk.main();

 