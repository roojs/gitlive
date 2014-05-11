
using Wnck;
  
extern int xorg_idletime();


public class WindowLog : Object  {

    string outdir;
    string win;
    Screen screen;
    string lastdir;
    
    
    DateTime lastcopy;

    public WindowLog () {
        this.outdir = Environment.get_home_dir() + "/.gitlog";
        this.screen = Wnck.Screen.get_default();
        this.win = "";
        this.lastdir = "";
        this.lastcopy = null;
        Timeout.add_full(Priority.LOW, 5000, () => {
            return this.getStatus();
        } );
        //Roo.log("Windowlog start");
        this.screen.active_window_changed.connect((pr_win) => {
            this.windowChanged();
        });
    }
    
    
    
    
    public bool getStatus()
    {
         
        var output =  xorg_idletime();
        //print(output);
        // more that 10 seconds?? - report idle..
        if (output * 1 > 10000) {
            if (this.win.length > 0) { 
                //print( (xDate.newDate()).format("Y-m-d H:i:s") + " IDLE");
                 try {
                        this.write("", "IDLE");
                } catch (Error e) {
                    print(e.message + "\n");
                }
            }
            this.win = "";
            return true;
        }
        return true;
    }

    public void windowChanged()
    {
        this.screen.force_update();
       // print("window changeD");
        var aw = this.screen.get_active_window();
        if (aw == null) { 
            return  ;
        }
        try {
            var win = aw.get_name();
            var app = aw.get_application();
            var pid = app.get_pid();
            //print("PID " + pid);
                    //var cmd = File.realpath('/proc/'+ pid + '/exe');
            string cmd = "";
            size_t len = 0;
            print("/proc/%u/cmdline".printf(pid) + "\n");

            if (pid > 0 ) { 
                FileUtils.get_contents("/proc/%u/cmdline".printf(pid), out cmd, out len);
            }  else {
                cmd = "UNKNOWN";
            } 
            //  has it changed?
            print(this.win +"\n" + cmd + "\n");
            if (this.win.length < 1 || (win != this.win)) { 
        
                //print((xDate.newDate()).format("Y-m-d H:i:s") + " " + win + ' - '+ cmd );
                this.write(cmd, win);
                this.win=win;
            }
        } catch (Error e) {
            print(e.message + "\n");
        }
        
        
        return  ;
    }

    
    public void write (string cmd , string str) throws Error
    {
        
        var now = new DateTime.now(new TimeZone.local()); 

        var dir =  this.outdir + now.format("/%Y/%m");

        if (this.lastdir.length < 1 || this.lastdir != dir) {
            if (!FileUtils.test(dir, FileTest.IS_DIR)) {
                   if (!FileUtils.test(Path.get_dirname(dir), FileTest.IS_DIR)) { 
                        File.new_for_path(Path.get_dirname(dir)).make_directory(null);
                    }
                    File.new_for_path(dir).make_directory(null);
            }
          
            this.lastdir = dir;
        }
        
        var fname = now.format("/%d") + ".log";
        var path  = dir + "/" + fname;
        var time  = now.format("%H:%i:%s ");
        var f = File.new_for_path(path);
    	FileOutputStream ios = f.append_to (FileCreateFlags.NONE);
		var data_out = new DataOutputStream (ios);

        data_out.put_string("\n" +time + str + " "  + cmd, null);
        print(time + str + " "  + cmd + "\n");
        data_out.close(null);
        

 
        // copy to gitlive/gitlog (each user should check out their own gitlog!?
        if (this.lastcopy != null && this.lastcopy.format("%H") == now.format("%H")) {
            return;
        }
        this.lastcopy = now;

        var cpdir = GitMonitor.gitlive +
                    "/gitlog" +  now.format("/%Y/%m");
                    
         if (!FileUtils.test(cpdir, FileTest.IS_DIR)) {
               if (!FileUtils.test(Path.get_dirname(cpdir), FileTest.IS_DIR)) { 
                    File.new_for_path(Path.get_dirname(cpdir)).make_directory(null);
                }
                File.new_for_path(cpdir).make_directory(null);
        }
 
        var src = File.new_for_path(path);         
        var dest = File.new_for_path(cpdir + fname);

        src.copy(dest, FileCopyFlags.OVERWRITE);
    }
    
}


  

