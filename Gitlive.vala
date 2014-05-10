

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




    MainLoop loop = new MainLoop ();
    print("starting");
    var m = new Monitor();
    
    m.add("/home/alan/gitlive");
    m.start();
    loop.run ();

    Gtk.main ();

    return 0;

}
