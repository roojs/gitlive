

/*
 valac  --pkg gio-2.0  --pkg posix  --pkg gtk+-3.0 
      GitLive.vala \
      Monitor.vala \
      GitMonitor.vala \
      Spawn.vala \
      StatusIcon.vala \
      GitRepo.vala \
    -o /tmp/Gitlive



*/





static int main (string[] args) {
    Gtk.init (ref args);
    
    GitMonitor.gitlive =  GLib.get_home_dir() + "/gitlive";

    Notify.init("gitlive");

    StatusIcon.init();


    GLib.timeout_add(GLib.PRIORITY_LOW, 500, () => {
        // this should start after we have shown the icon...
        GitMonitor.add(GitMonitor.gitlive);
        GitMonitor.start();
        
        // WindowLog.start();
    });

    Gtk.main ();

    return 0;

}
