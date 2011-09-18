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
    stock : Gtk.STOCK_MEDIA_PLAY,
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
                        this.el = new Gtk.ImageMenuItem.from_stock(Gtk.STOCK_MEDIA_PAUSE);
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
                            imports.gitlive.monitor.stop();
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
                    id : 'resume',
                    //label: 'Pause',
                    pack:  'append',
                    listeners : {
                        activate : function () {
                            this.parent.parent.paused = false;
                            imports.gitlive.monitor.start();
                            //var status = this.el.label == 'Pause' ? 1 : 0
                           // this.el.label  = status ? 'Resume' : 'Pause';
                            this.parent.parent.el.set_from_stock(   Gtk.STOCK_MEDIA_PLAY);
                            
                        }
                    }
                },
                
                {
                    init : function() {
                        this.el = new Gtk.ImageMenuItem.from_stock(Gtk.STOCK_RELOAD);
                        XObject.prototype.init.call(this);
                    },
                    label: 'Pull (Refresh) All',
                    always_show_image : true,
                    accel_group : null,
                    //label: 'Pause',
                    pack:  'append',
                    listeners : {
                        activate : function () {
                            imports.gitlive.monitor.stop();
                            
                            var f = Gio.file_new_for_path(imports.gitlive.gitlive);
                            var file_enum = f.enumerate_children(
                                Gio.FILE_ATTRIBUTE_STANDARD_DISPLAY_NAME, Gio.FileQueryInfoFlags.NONE, null);

                            var next_file = null;
                            
                            while ((next_file = file_enum.next_file(null)) != null) {
                                
                                var fn = imports.gitlive.gitlive + '/' + next_file.get_display_name();
                                if (! GLib.file_test(fn + '/.git', GLib.FileTest.IS_DIR)) {
                                    continue;
                                }
                                
                                var repo = new imports.Scm.Git.Repo.Repo({
                                    repopath : fn
                                });
                                try { 
                                    var str = repo.pull(); 
                                    var notification = new Notify.Notification({
                                       summary: "Updated " + fn,
                                       body : res.output
                                   });
                                   notification.set_timeout(20);
                                   notification.show();
                                   
                                } catch(e) {
                                    print(JSON.stringify(e));
                                    print("notification or push errror- probably to many in queue..");
                                    imports.gitlive.errorDialog(e.message);

                                }
                                
                                    // should also update modules ideally.
                                
                            }
                            
                                
                            file_enum.close(null);

                            
                            imports.gitlive.monitor.start();
                            
                        }
                    }
                },
                {
                    init : function() {
                        this.el = new Gtk.ImageMenuItem.from_stock(Gtk.STOCK_RELOAD);
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
                        this.el = new Gtk.ImageMenuItem.from_stock(Gtk.STOCK_ABOUT);
                        XObject.prototype.init.call(this);
                    },
                    label: 'About GitLive',
                    pack:  'append',
                    listeners : {
                        activate : function () {
                            var msg = new Gtk.AboutDialog({
                                program_name : "Git Live",
                                version: '0.1',
                                website: 'http://git.akbkhome.com',
                                website_label: 'AK BK Consulting (git repo)',
                                license : 'LGPL'
                            });
                            msg.set_authors([ "Alan Knowles <alan@akbkhome.com>" ]);
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


