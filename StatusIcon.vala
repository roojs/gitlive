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
   
// Compile::
// valac --pkg gtk+-3.0 StatusIcon.vala -o /tmp/StatusIcon
   
//var gitlive = imports.gitlive;


using Gtk;


static int main (string[] args) {
    // A reference to our file
    Gtk.init (ref args);
    new StatusIcon();
 
    Gtk.main ();
    return 0;
     

}
 


public StatusIconA statusicon;
 
class StatusIconA : StatusIcon {

    bool paused = false;
     
    public StatusIconA() {
        
        statusicon = this;
        
        
         //title : 'gitlive',
        this.stock = Gtk.STOCK_REFRESH;
        this.tooltip_text = "GitLive";
        this.title = "gitlive";
        
        this.set_name("gitlive");
       
        
        var menu = new MenuA();
                 
         
        this.popup_menu.connect( (button,event_time) =>{
            
            //print(Array.prototype.slice.call(arguments).join(','));
            
            //var menu = this.get('menu');
            
            this.menu.show_all();
            
            if (this.paused) {
                menu.resume.show();
                menu.pause.hide();
            } else {
                menu.resume.hide();
                menu.pause.show();
            }
             
            //Gtk.get_current_event_device ()
            menu.popup(
                    
                        null, null,
                        null, button,
                        event_time, null
            );
                        
            
            
            //var g = { };
            //var a = new Gdk.Rectangle();
            //  needs direction=inout setting in gir to work (in bugzilla @present)
            //this.el.get_geometry(g,a,null);
             
            // should check to see if @ top or bottom I guess..
            //menu.el.get_toplevel().move(a.x, a.y +a.height);
            //menu.el.get_toplevel().move(10,10);
              
        }); 
        
    }
    
    class MenuA : Gtk.Menu
    {
        public ImageMenuItem pause;
        public ImageMenuItem resume;
        
        public MenuA()
        {
            this.pause = new ImageMenuItemA();
            this.append(this.pause);
            this.resume = new ImageMenuItemB();
            this.append(this.resume);
        }
        
        
        class ImageMenuItemA : ImageMenuItem {
            
            public ImageMenuItemA()
            {
                this.set_from_stock( Gtk.STOCK_MEDIA_PAUSE );
                this.label= "Pause Commits";
                this.always_show_image = true;
                this.accel_group = null;
                
                this.activate.connect( () => {
                    statusicon.paused = true;
                    
                    //GitMonitor.GitMonitor.stop();
                   // this.el.label  = status ? 'Resume' : 'Pause';
                    statusicon.set_from_stock( Gtk.STOCK_MEDIA_PAUSE );
                    
                    
                });
                //    id : 'pause',
            }
            
            
        }
         class ImageMenuItemB : ImageMenuItem {
            
            public ImageMenuItemB()
            {
                this.set_from_stock( Gtk.STOCK_MEDIA_PLAY );
                this.label= "Start Commits";
                this.always_show_image = true;
                this.accel_group = null;
                
                this.activate.connect( () => {
                    //GitMonitor.GitMonitor.start();
                    statusicon.paused = false;
                    
                    //
                   // this.el.label  = status ? 'Resume' : 'Pause';
                    statusicon.set_from_stock( Gtk.STOCK_MEDIA_PLAY );
                    
                    
                });
                //    id : 'pause',
            }
            
            
        }
    }
}
    
    /*
                
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
                        
                        this.el = XObject.isSeed ?
                            new Gtk.ImageMenuItem.from_stock(Gtk.STOCK_QUIT)
                            : new Gtk.ImageMenuItem.new_from_stock(Gtk.STOCK_QUIT, null);
                     
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
*/


