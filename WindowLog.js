//<script type="text/javascript">
/**
 * log desktop actions..
 *
 * a potential add-on to gitlive....
 * - basically tracks what applications are being worked on when, allowing you to
 * use it to generate time tracking (eg. invoices...) later..
 * 
 *
 * apt-get install gir1.2-wnck-3.0
 * -- needs latest seed (HEAD as of 30nov2011) with the xorg module built in..
 * 
 */




Wnck = imports.gi.Wnck;
Gtk = imports.gi.Gtk ;
Spawn = imports.Spawn;
File  = imports.File.File;
GLib        = imports.gi.GLib;
//Gtk.init(Seed.argv);
xDate = imports.Date;
xorg = imports.xorg;

WindowLog = {
    
    win : false,
    screen : false,
 
    start  : function()
    {
        
        this.outdir = GLib.get_home_dir() + "/.gitlog";
        this.screen = Wnck.Screen.get_default();
        GLib.timeout_add(GLib.PRIORITY_LOW, 500, function() { return WindowLog.getStatus() } );
        
    },
        
    getStatus : function() {
        
         
        var output =  xorg.screensaverinfo_get_idletime();
        //print(output);
         
        if (output * 1 > 10000) {
            if (this.win != false) { 
                print( (xDate.newDate()).format("Y-m-d H:i:s") + " IDLE");
                this.write("IDLE");
            }
            this.win = false;
            return true;
        }
        
        this.screen.force_update();
       
        var aw = this.screen.get_active_window();
        if (aw) { 
            var win = aw.get_name();
            if (!this.win || (this.win && win != this.win)) { 
        
                print((xDate.newDate()).format("Y-m-d H:i:s") + " " + win);
                this.write(win);
                this.win=win;
            }
        }
        
        
        return true;
    },
    lastdir : false,
    
    write : function (str) {
        
        var dir =  this.outdir + (xDate.newDate()).format("/Y/m");
        if (!this.lastdir || this.lastdir != dir) {
            if (!File.isDirectory(dir)) {
               File.mkdir(dir,true);
            }
            this.lastdir = dir;
        }
        
        var path = dir + (xDate.newDate()).format("/d") + ".log";
        var time = (xDate.newDate()).format("H:i:s ")
        
        File.append (path, time +  str + "\n");
    }
    
}


  