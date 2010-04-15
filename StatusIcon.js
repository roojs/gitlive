//<script type="text/javascript">


/**
 * Status icon and menu for component of gitlive.
 * 
 * Currently only does a few things
 * a) Quit
 * 
 * b) Pause!??!
 */
 
Gtk      = imports.gi.Gtk;
 
 
XObject = imports['XObject.js'].XObject

Gtk.init(null,null);
 
StatusIcon  = new XObject({
    
    el :  new Gtk.StatusIcon.from_stock(Gtk.STOCK_ABOUT),

    listeners : {
        'popup-menu' : function( w, event, event_time) {
            print(Array.prototype.slice.call(arguments).join(','));
            
            menu = new XObject(this.menu);
            
            menu.el.show_all();
            menu.el.popup(null, null, null, null,  event, event_time);
        }
    },
    menu : {
            xtype: Gtk.Menu,
            xid : 'menu',
            pack: false,
            items : [
                {
                    xtype: Gtk.MenuItem,
                    label: 'About',
                    pack:  'append',
                    listeners : {
                        activate : function () {
                            var msg = new Gtk.MessageDialog({message_type:
                                Gtk.MessageType.INFO, buttons : Gtk.ButtonsType.OK, text: "GIT Live - auto commits and pushes everything in ~/gitlive"});
                            msg.run();
                            msg.destroy();
                        }
                    }
                },
                
                {
                    xtype: Gtk.MenuItem,
                    label: 'Close',
                    pack:  'append',
                    listeners : {
                        activate : function () {
                            Seed.quit();
                        }
                    }
                }
                
                
            ]
        }
     
    
});


// test..



 Gtk.main()