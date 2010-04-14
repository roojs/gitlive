///<script type="text/javascript">

Gtk      = imports.gi.Gtk;

imports.gtkbuilder;

Gtk.init(null,null);

var builder = new Gtk.Builder();
builder.add_from_file(__script_path__+'/gitlive.builder');
var win = builder.get_object('clone_repo');
builder.get_object('ok').signal.clicked.connect( function() {
        win.hide();
});
builder.get_object('cancel').signal.clicked.connect( function() {
        win.hide();
});

var hosts = builder.get_object('hosts');
hosts.get_model().clear();
hosts.append("http://www.akbkhome.com");
hosts.append("git.gnome.org");


win.show_all();
Gtk.main();

 