//<script type="text/javascript">


/**
 * Status icon and menu for component of gitlive.
 * 
 * Currently only does a few things
 * a) Quit
 * 
 * b) Pause!??!
 */
 

Object = imports['Object.js'].Object
GtkObject = imports['GtkObject.js'].GtkObject

 
StatusIcon  = Object.define(
    function ()
    {
        var icon = new Gtk.StatusIcon.from_stock(Gtk.STOCK_ABOUT);
        this.prototype.superclass.constructor.call(this);
        
    },
    GtkObject,
    
    listeners : {
        'popup-menu' : function(w, event, event_time) {
            
            var menu = this.get('menu');   
            menu.el.show_all();
            menu.el.popup(null, null, null, null,  event, event_time);
    },
    items : [
        {
            xtype: Gtk.Menu,
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
    ]
    
} 


 