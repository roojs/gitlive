

/*
 valac  --pkg gio-2.0  --pkg posix  --pkg gtk+-3.0 --pkg libnotify --pkg  libwnck-3.0 \
      Gitlive.vala \
      Monitor.vala \
      GitMonitor.vala \
      Spawn.vala \
      StatusIcon.vala \
      GitRepo.vala \
    xorg_idletime.c \
    WindowLog.vala \
    --Xcc=-lXss \
    --Xcc=-DWNCK_I_KNOW_THIS_IS_UNSTABLE \
    -o /tmp/Gitlive && /tmp/Gitlive



*/





static int main (string[] args) {
    Gtk.init (ref args);
    
    GitMonitor.gitlive =  Environment.get_home_dir() + "/gitlive";

    print("GitMonitor.gitlive=" + GitMonitor.gitlive);

    Notify.init("gitlive");

    new StatusIconA();
    var gm = new GitMonitor();


    Timeout.add_full(Priority.LOW, 500, () => {
        // this should start after we have shown the icon...
        print("adding GitMonitor.gitlive: " + GitMonitor.gitlive);
        gm.add(GitMonitor.gitlive);
        print("gm.start()");
        gm.start();

        new WindowLog();

        return false;

    });

    Gtk.main ();

    return 0;

}
