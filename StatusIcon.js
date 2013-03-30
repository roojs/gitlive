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
 
var Gtk      = imports.gi.Gtk;
var Gdk      = imports.gi.Gdk;
var Gio      = imports.gi.Gio;
var GLib     = imports.gi.GLib;
var Notify   = imports.gi.Notify;

var XObject = imports.XObject.XObject;

//var gitlive = imports.gitlive;

 
var StatusIcon  = new XObject({
    
    paused : false, // on!
    xtype : Gtk.StatusIcon,
    title : 'gitlive',
    stock : Gtk.STOCK_REFRESH,
    tooltip_text : 'GitLive',
        init : function() {
        XObject.prototype.init.call(this);
        this.el.set_name('gitlive');
    },
    listeners : {
        //'popup-menu' : function( w, event, event_time) {
        'activate' : function( w, event, event_time) {
            print(Array.prototype.slice.call(arguments).join(','));
            
            var menu = this.get('menu');
            
            menu.el.show_all();
            
            this.get(!this.paused ? 'resume' : 'pause' ).el.hide();
            print("MENU EL: "  + menu.el);
            print("POPUP: " + typeof(menu.el.popup));
            
            
            menu.el.popup(null, null,Gtk.StatusIcon.position_menu , this.el , 1, Gtk.get_current_event_time());
            //menu.el.popup(null, null,null, null, 1, Gtk.get_current_event_time());
            
            return;
            
            var g = { };
            var a = new Gdk.Rectangle();
            //  needs direction=inout setting in gir to work (in bugzilla @present)
            this.el.get_geometry(g,a,null);
             
            // should check to see if @ top or bottom I guess..
            menu.el.get_toplevel().move(a.x, a.y +a.height);
             
        }
    },
    items : [
       {
            xtype: Gtk.Menu,
            id : 'menu',
            pack: false,
            items : [
                {
                    init : function() {
                        
                        this.el = XObject.isSeed ?
                            new Gtk.ImageMenuItem.from_stock(Gtk.STOCK_MEDIA_PAUSE)
                            : new Gtk.ImageMenuItem.new_from_stock(Gtk.STOCK_MEDIA_PAUSE, null);
                        XObject.prototype.init.call(this);
                    },
                    label: 'Pause Commits',
                   
                    always_show_image : true,
                    accel_group : null,
                    id : 'pause',
                    //label: 'Pause',
                    pack:  'append',
                    listeners : {
                        activate : function () {
                            this.parent.parent.paused = true;
                            imports.GitMonitor.GitMonitor.stop();
                           // this.el.label  = status ? 'Resume' : 'Pause';
                            this.parent.parent.el.set_from_stock( Gtk.STOCK_MEDIA_PAUSE );
                            
                        }
                    }
                },
                
                {
                    init : function() {
                        this.el = XObject.isSeed ?
                            new Gtk.ImageMenuItem.from_stock(Gtk.STOCK_MEDIA_PLAY)
                            : new Gtk.ImageMenuItem.new_from_stock(Gtk.STOCK_MEDIA_PLAY, null);
                        XObject.prototype.init.call(this);
                    },
                    label: 'Resume Commits',
                    always_show_image : true,
                    accel_group : null,
                    id : 'resume',
                    //label: 'Pause',
                    pack:  'append',
                    listeners : {
                        activate : function () {
                            this.parent.parent.paused = false;
                             imports.GitMonitor.GitMonitor.start();
                            //var status = this.el.label == 'Pause' ? 1 : 0
                           // this.el.label  = status ? 'Resume' : 'Pause';
                               
                            
                        }
                    }
                },
                
                {
                    init : function() {
                        this.el = XObject.isSeed ?
                            new Gtk.ImageMenuItem.from_stock(Gtk.STOCK_FULLSCREEN)
                            : new Gtk.ImageMenuItem.new_from_stock(Gtk.STOCK_FULLSCREEN, null);
                      
                        XObject.prototype.init.call(this);
                    },
                    label: 'Pull (Refresh) All',
                    always_show_image : true,
                    accel_group : null,
                    //label: 'Pause',
                    pack:  'append',
                    listeners : {
                        activate : function () {
                            imports.GitMonitor.GitMonitor.stop();
                           
                            
                            var tr = imports.Scm.Repo.Repo.list();
                            for (var i= 0; i< tr.length;i++) {
                                this.parent.parent.el.set_from_stock( i%2 ?  Gtk.STOCK_FULLSCREEN : Gtk.STOCK_LEAVE_FULLSCREEN );
                                
                                var repo = tr[i];
                                if (!repo.autocommit()) {
                                    //??? should we ignore ones not on autocommit..
                                    continue;
                                }
                                try {
                                    this.parent.parent.el.set_tooltip_text("pull: " + repo.name);
                               
                                    var str = repo.pull();
                                    // do not care if it's already in sycn..
                                    if (str.match(/Already up-to-date/)) {
                                        continue;
                                    }
                                    var notification = new Notify.Notification({
                                       summary: "Updated " + repo.name,
                                       body : str
                                   });
                                   notification.set_timeout(20);
                                   notification.show();
                                   
                                } catch(e) {
                                    this.parent.parent.el.set_from_stock( Gtk.STOCK_MEDIA_RECORD );
                                    print(JSON.stringify(e));
                                    print("notification or push errror- probably to many in queue..");
                                    imports.gitlive.errorDialog(e.message);

                                }
                            }
                            this.parent.parent.el.set_tooltip_text(this.parent.parent.tooltip_text);
                               
                            
                             
                          
                            imports.GitMonitor.GitMonitor.start();
                        }   
                    }
                },
                {
                    init : function() {
                        this.el = XObject.isSeed ?
                            new Gtk.ImageMenuItem.from_stock(Gtk.STOCK_SAVE)
                            : new Gtk.ImageMenuItem.new_from_stock(Gtk.STOCK_SAVE, null);
                         
                        XObject.prototype.init.call(this);
                    },
                    label: 'Update Timesheet',
                    always_show_image : true,
                    accel_group : null,
                    
                    //label: 'Pause',
                    pack:  'append',
                    listeners : {
                        activate : function () {
                            var ret = imports.FixBug.FixBug.show();
                            
                        }
                    }
                },
                
                
                {
                    init : function() {
                        this.el = XObject.isSeed ?
                            new Gtk.ImageMenuItem.from_stock(Gtk.STOCK_FULLSCREEN)
                            : new Gtk.ImageMenuItem.new_from_stock(Gtk.STOCK_FULLSCREEN, null);
                         XObject.prototype.init.call(this);
                    },
                    label: 'Manage Clones',
                    always_show_image : true,
                    accel_group : null,
                    
                    //label: 'Pause',
                    pack:  'append',
                    listeners : {
                        activate : function () {
                             var ret = imports.Clones.Clones.show();
                            
                        }
                    }
                },
                
                
                
            
                {
                    init : function() {
                              this.el = XObject.isSeed ?
                            new Gtk.ImageMenuItem.from_stock(Gtk.STOCK_ABOUT)
                            : new Gtk.ImageMenuItem.new_from_stock(Gtk.STOCK_ABOUT, null);
                   
                        XObject.prototype.init.call(this);
                    },
                    label: 'About GitLive',
                    pack:  'append',
                    listeners : {
                        activate : function () {
                            var msg = new Gtk.AboutDialog({
                                program_name : "Git Live",
                                version: '0.3',
                                website: 'http://www.roojs.org/index.php/projects/gitlive.html',
                                website_label: 'RooJS Consulting',
                                license : 'LGPL'
                            });
                            msg.set_authors([ "Alan Knowles <alan@roojs.com>" ]);
                            msg.run();
                            msg.destroy();
                        }
                    }
                },
                
                {
                    init : function() {
                        this.el = new Gtk.ImageMenuItem.from_stock(Gtk.STOCK_QUIT);
                        XObject.prototype.init.call(this);
                    },
                    label: 'Quit',
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


