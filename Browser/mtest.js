Gtk = imports.gi.Gtk;
WebKit = imports.gi.WebKit;
Gtk.init(typeof(Seed) == 'object' ? Seed.argv : null);

var  win = new Gtk.Window({});

var  sw = new Gtk.ScrolledWindow({});
win.add(sw);

var  view = new WebKit.WebView();
view.load_uri("http://www.google.com/");
sw.add(view);

win.set_size_request(640, 480);
win.show_all();

Gtk.main();

 