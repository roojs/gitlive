///<script type="text/javascript">

Gtk      = imports.gi.Gtk;
Gtk.init(null,null);

var builder = new Gtk.Builder();
builder.add_from_file(__script_path__+'/gitlive.builder');
var win = builder.get_object('clone_repo');
win.show();
Gtk.main();

 