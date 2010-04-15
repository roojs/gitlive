//<script type="text/javascript">


/**
 * Status icon and menu for component of gitlive.
 * 
 * Implements XObject - however we want to control initialization.
 * 
 * 
 * 
 * Currently only does a few things
 * a) Quit
 * 
 * b) Pause!??!
 */
 
Gtk      = imports.gi.Gtk;
Gdk      = imports.gi.Gdk;
XObject = imports['XObject.js'].XObject


 
StatusIcon  = new XObject({
    
    xtype : Gtk.StatusIcon,
    stock : Gtk.STOCK_MEDIA_PLAY,
    tooltip_text : 'GitLive',
    listeners : {
        'popup-menu' : function( w, event, event_time) {
            print(Array.prototype.slice.call(arguments).join(','));
            
            menu = this.get('menu');
            
            menu.el.show_all();
            
            this.get(this.status ?  'pause' : 'resume').el.hide();
            
            menu.el.popup(null, null,null, null, event, event_time);
            var g = { };
            var a = new Gdk.Rectangle();
            //  needs direction=inout setting in gir to work (in bugzilla @present)
            this.el.get_geometry(g,a,null);
            
            //print(Object.keys(a).join(','));
            //print(a.x);
            // should check to see if @ top or bottom I guess..
            menu.el.get_toplevel().move(a.x, a.y +a.height);
            //menu.el.reposition();
            
            
            //menu.el.popup(null, null , null, null,  event, event_time);
        }
    },
    items : [
       {
            xtype: Gtk.Menu,
            xid : 'menu',
            pack: false,
            items : [
                {
                    init : function() {
                        this.el = new Gtk.ImageMenuItem.from_stock(Gtk.STOCK_MEDIA_PAUSE);
                        XObject.prototype.init.call(this);
                    },
                    label: 'Pause Commits',
                   
                    always_show_image : true,
                    accel_group : null,
                    xid : 'pause',
                    //label: 'Pause',
                    pack:  'append',
                    listeners : {
                        activate : function () {
                            this.parent.parent.status = 1;
                           // this.el.label  = status ? 'Resume' : 'Pause';
                            this.parent.parent.el.set_from_stock( Gtk.STOCK_MEDIA_PAUSE );
                            
                        }
                    }
                },
                
                {
                    init : function() {
                        this.el = new Gtk.ImageMenuItem.from_stock(Gtk.STOCK_MEDIA_PLAY);
                        XObject.prototype.init.call(this);
                    },
                    label: 'Resume Commits',
                    always_show_image : true,
                    accel_group : null,
                    xid : 'resume',
                    //label: 'Pause',
                    pack:  'append',
                    listeners : {
                        activate : function () {
                            this.parent.parent.status = 0;
                            //var status = this.el.label == 'Pause' ? 1 : 0
                           // this.el.label  = status ? 'Resume' : 'Pause';
                            this.parent.parent.el.set_from_stock(   Gtk.STOCK_MEDIA_PLAY);
                            
                        }
                    }
                },
            
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
    
});


