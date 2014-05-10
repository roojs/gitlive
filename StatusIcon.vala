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
/*

static int main (string[] args) {
    // A reference to our file
    Gtk.init (ref args);
    new StatusIconA();
 
    Gtk.main ();
    return 0;
     

}
 */


//public StatusIconA statusicon;
 
public class StatusIconA : StatusIcon {

    bool paused = false;
    public static StatusIconA statusicon;
     
    public StatusIconA() {
        
        statusicon = this;
        
         //title : 'gitlive',
        this.stock = Gtk.Stock.REFRESH;
        this.tooltip_text = "GitLive";
        this.title = "vgitlive";
        
        this.set_name("vgitlive");
        this.set_visible(true);      
        
        var menu = new MenuA();
                 
         
        this.activate.connect( () =>{
            
            //print(Array.prototype.slice.call(arguments).join(','));
            
            //var menu = this.get('menu');
            
            menu.show_all();
            
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
                        this.position_menu, 0,
                         Gtk.get_current_event_time()
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
            this.append(new ImageMenuItemC());
            this.append(new ImageMenuItemD());
            this.append(new ImageMenuItemE());
            this.append(new ImageMenuItemF());
            this.append(new ImageMenuItemG());
            
            
            
        }
        
        
        class ImageMenuItemA : ImageMenuItem {
            
            public ImageMenuItemA()
            {
                //this.set_from_stock( Gtk.Stock.MEDIA_PAUSE );
                
                var  image = new Gtk.Image();
                image.set_from_stock(Gtk.Stock.MEDIA_PAUSE,Gtk.IconSize.MENU );
                this.set_image (image);
                
                this.label= "Pause Commits";
                this.always_show_image = true;
                this.accel_group = null;
                
                this.activate.connect( () => {
                    statusicon.paused = true;
                    
                    //GitMonitor.GitMonitor.stop();
                   // this.el.label  = status ? 'Resume' : 'Pause';
                    statusicon.set_from_stock( Gtk.Stock.MEDIA_PAUSE );
                    
                    
                });
                //    id : 'pause',
            }
            
            
        }
        class ImageMenuItemB : ImageMenuItem {
            
            public ImageMenuItemB()
            {
                
                var  image = new Gtk.Image();
                image.set_from_stock(Gtk.Stock.MEDIA_PLAY,Gtk.IconSize.MENU );
		this.set_image (image);
                this.label= "Start Commits";
                this.always_show_image = true;
                this.accel_group = null;
                
                this.activate.connect( () => {
                    //GitMonitor.GitMonitor.start();
                    statusicon.paused = false;
                    
                    //
                   // this.el.label  = status ? 'Resume' : 'Pause';
                    statusicon.set_from_stock( Gtk.Stock.MEDIA_PLAY );
                    
                    
                });
            }
            
            
        }
        
        class ImageMenuItemC : ImageMenuItem {
            
            public ImageMenuItemC()
            {
                
                var  image = new Gtk.Image();
                image.set_from_stock(Gtk.Stock.FULLSCREEN,Gtk.IconSize.MENU );
		this.set_image (image);
                this.label= "Pull (Refresh) All";
                this.always_show_image = true;
                this.accel_group = null;
                
                this.activate.connect( () => {
                    /*
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
                    
                    */
                });
            }
            
            
        }
        
        
        class ImageMenuItemD : ImageMenuItem {
            
            public ImageMenuItemD()
            {
                
                var  image = new Gtk.Image();
                image.set_from_stock(Gtk.Stock.SAVE,Gtk.IconSize.MENU );
		this.set_image (image);
                this.label= "Update Timesheet";
                this.always_show_image = true;
                this.accel_group = null;
                
                this.activate.connect( () => {
                 //var ret = imports.FixBug.FixBug.show();
                });
            }
            
            
        }
        
        class ImageMenuItemE : ImageMenuItem {
            
            public ImageMenuItemE()
            {
                
                var  image = new Gtk.Image();
                image.set_from_stock(Gtk.Stock.FULLSCREEN,Gtk.IconSize.MENU );
                this.set_image (image);
                this.label= "Manage Clones";
                this.always_show_image = true;
                this.accel_group = null;
                
                this.activate.connect( () => {
                 //var ret = imports.Clones.Clones.show();
                });
            }
            
            
        }
        
        class ImageMenuItemF : ImageMenuItem {
            
            public ImageMenuItemF()
            {
                
                var  image = new Gtk.Image();
                image.set_from_stock(Gtk.Stock.ABOUT,Gtk.IconSize.MENU );
                this.set_image (image);
                this.label= "About Gitlive";
                this.always_show_image = true;
                this.accel_group = null;
                
                this.activate.connect( () => {
                 //var ret = imports.Clones.Clones.show();
                 
                    var msg = new Gtk.AboutDialog();
                    msg.program_name = "Git Live";
                    msg.version= "0.3";
                    msg.website= "http://www.roojs.org/index.php/projects/gitlive.html";
                    msg.website_label= "Roo J Solutions Ltd.";
                    msg.license = "LGPL";
                    msg.authors = { "Alan Knowles <alan@roojs.com>" };
                    msg.run();
                    msg.destroy();
                });
            }
            
            
        }
        
         class ImageMenuItemG : ImageMenuItem {
            
            public ImageMenuItemG()
            {
                
                var  image = new Gtk.Image();
                image.set_from_stock(Gtk.Stock.QUIT,Gtk.IconSize.MENU );
		this.set_image (image);
                this.label= "Quit";
                this.always_show_image = true;
                this.accel_group = null;
                
                this.activate.connect( () => {
                    // confirm?
                    Gtk.main_quit();
                 //var ret = imports.Clones.Clones.show();
                 });
            }
            
            
        }
        
    }
}
      
                
                  
