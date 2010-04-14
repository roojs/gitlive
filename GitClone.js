///<script type="text/javascript">

Gtk      = imports.gi.Gtk;

imports.gtkbuilder;

Gtk.init(null,null);

var builder = new Gtk.Builder();
builder.add_from_file(__script_path__+'/gitlive.builder');
var win = builder.get_object('clone_repo');
builder.connect_signals({
    on_ok : function() {
        Seed.print("OK");
    },
    on_cancel : function() {
        Seed.print("Cancel");
    },
});


win.show_all();
Gtk.main();

 