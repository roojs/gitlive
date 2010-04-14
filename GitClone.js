///<script type="text/javascript">

Gtk      = imports.gi.Gtk;

var builder = new Gtk.Builder();
builder.add_from_file(__script_dir__+'/gitlive.builder');
var win = builder.get_object('clone_repo');
win.show();

 