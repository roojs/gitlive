//<script type="text/javascript">


/**
 * Status icon and menu for component of gitlive.
 * 
 * Currently only does a few things
 * a) Quit
 * 
 * b) Pause!??!
 */
 Gtk.init (null, null);

//Object = imports['Object.js'].Object

StatusIcon = new GType({
    parent: Gtk.StatusIcon,
    name: "StatusIcon",
    init: function(klass){
        this.stock = Gtk.STOCK_ABOUT;
        this.append(new AboutMenu());
        this.append(new Quit());
    },
    
});
AboutMenuItem =  new GType({
    parent: Gtk.MenuItem,
    name = "AboutMenuItem",
    init: function(klass){
        this.label = "About";
    },
});

StatusIcon  = Object.define(
    function ()
    {
        var icon = new Gtk.StatusIcon.from_stock(Gtk.STOCK_ABOUT);
        
    },
    Object,
    
    listeners : {
        'popup-menu' : function(w, event, event_time) {
                var menu = new Gtk.Menu();
                var open_item = new Gtk.MenuItem({label: "About"});
                var close_item = new Gtk.MenuItem({label: "Quit"});

                menu.append(open_item);
                menu.append(close_item);

                close_item.signal["activate"].connect( function() {
                    Seed.quit();
                });
                open_item.signal["activate"].connect( 
                    function message(data) {
                        var msg = new Gtk.MessageDialog({message_type:
                            Gtk.MessageType.INFO, buttons : Gtk.ButtonsType.OK, text: "GIT Live - auto commits and pushes everything in ~/gitlive"});
                        msg.run();
                        msg.destroy();
                });
                
                menu.show_all();
                menu.popup(null, null, null, null,  event, event_time);
            })
    }
}

StatusIcon.Menu  =  Object.define(
    function ()
    {
        this.menu = new Gtk.Menu();
         
    },
    Object,
//
// need a better icon...




icon.signal["popup-menu"].connect(function(w, event, event_time) {
    var menu = new Gtk.Menu();
    var open_item = new Gtk.MenuItem({label: "About"});
    var close_item = new Gtk.MenuItem({label: "Quit"});

    menu.append(open_item);
    menu.append(close_item);

    close_item.signal["activate"].connect( function() {
        Seed.quit();
    });
    open_item.signal["activate"].connect( 
        function message(data) {
            var msg = new Gtk.MessageDialog({message_type:
                Gtk.MessageType.INFO, buttons : Gtk.ButtonsType.OK, text: "GIT Live - auto commits and pushes everything in ~/gitlive"});
            msg.run();
            msg.destroy();
    });
    
    menu.show_all();
    menu.popup(null, null, null, null,  event, event_time);
});
Notify.init("gitlive");
if (!GLib.file_test(GLib.get_home_dir() + "/gitlive", GLib.FileTest.IS_DIR)) {
    var msg = new Gtk.MessageDialog({message_type:
        Gtk.MessageType.INFO, buttons : Gtk.ButtonsType.OK, text: "GIT Live - ~/gitlive does not exist."});
    msg.run();
    msg.destroy();
    
    Seed.quit();
} else {
    start_monitor(GLib.get_home_dir() + "/gitlive", onChange);    
    var notification = new Notify.Notification({
    	summary: "Git Live",
		body : GLib.get_home_dir() + "/gitlive\nMonitoring " + ndirs + " Directories"
	});

    notification.set_timeout(500);
    notification.show();   
    
    
}

Gtk.main();