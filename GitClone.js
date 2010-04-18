///<script type="text/javascript">

Gtk      = imports.gi.Gtk;
GObject      = imports.gi.GObject;

imports.gtkbuilder;

Gtk.init(null,null);

var builder = new Gtk.Builder();
builder.add_from_file(__script_path__+'/manage_git.builder');
var win = builder.get_object('clone_repo');
builder.connect_signals({
    on_ok :  function() {
        win.hide();
    }, 
    on_cancel : function() {
        win.hide();
    }
});

Gtk.ListStore.prototype.setValue = function(r, c ,v)
{
    var tp = new Gtk.TreePath.from_string('' + r) ;
    var citer = new Gtk.TreeIter();
    if (!this.get_iter (citer, tp)) {
        this.append(citer);
    }
    this.set_value(citer, c, [GObject.TYPE_STRING, v ]); 
                            
}

var repos = builder.get_object('serverlist');
repos.clear();

// need to use list model here..
repos.setValue(0,0, "http://public.akbkhome.com");
repos.setValue(1,0,"http://private.akbkhome.com");
repos.setValue(2,0,"git://git.gnome.org");

// scanning repos - need to html parse the bugger..


win.show_all();
Gtk.main();

 