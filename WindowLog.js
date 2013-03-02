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
        
    getStatus : function()
    {
        
         
        var output =  xorg.screensaverinfo_get_idletime();
        //print(output);
         
        if (output * 1 > 10000) {
            if (this.win != false) { 
                print( (xDate.newDate()).format("Y-m-d H:i:s") + " IDLE");
                this.write(false, "IDLE");
            }
            this.win = false;
            return true;
        }
        
        this.screen.force_update();
       
        var aw = this.screen.get_active_window();
        if (aw) { 
            var win = aw.get_name();
            var app = aw.get_application();
            var pid = app.get_pid();
            //print("PID " + pid);
            //var cmd = File.realpath('/proc/'+ pid + '/exe');
            var cmd = pid ? File.read('/proc/'+ pid + '/cmdline') : 'UNKNOWN';
            
            if (!this.win || (this.win && win != this.win)) { 
        
                print((xDate.newDate()).format("Y-m-d H:i:s") + " " + win + ' - '+ cmd );
                this.write(cmd, win);
                this.win=win;
            }
        }
        
        
        return true;
    },
    lastdir : false,
    
    
    
    
    write : function (cmd , str)
    {
        
        var dir =  this.outdir + (xDate.newDate()).format("/Y/m");
        if (!this.lastdir || this.lastdir != dir) {
            if (!File.isDirectory(dir)) {
               File.mkdir(dir,true);
            }
            this.lastdir = dir;
        }
        var ctime = xDate.newDate();
        var fname = ctime.format("/d") + ".log";
        var path  = dir + '/' + fname;
        var time  = ctime.format("H:i:s ")
        
        File.append (path, "\n" +time + str + ' ' + cmd );
        
        // copy to gitlive/gitlog (each user should check out their own gitlog!?
        if (this.lastcopy && this.lastcopy > ctime.add(Date.HOUR, -1)) {
            return;
        }
        this.lastcopy = ctime;
        var cpdir = imports.GitMonitor.GitMonitor.gitlive +
                    '/gitlog' +  (xDate.newDate()).format("/Y/m");
                    
        if (!File.isDirectory(cpdir)) {
           File.mkdir(cpdir,true);
        }
        File.copy(path, cpdir + fname, Gio.FileCopyFlags.OVERWRITE );
        
        
    }
    
}


  
