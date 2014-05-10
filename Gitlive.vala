

/*
 valac  --pkg gio-2.0  --pkg posix 
      GitLive.vala \
      Monitor.vala \
      GitMonitor.vala \
      Spawn.vala \
      StatusIcon.vala \
      GitRepo.vala \
    -o /tmp/Gitlive









static int main (string[] args) {
    // A reference to our file
    //var file = File.new_for_path ("data.txt");
    MainLoop loop = new MainLoop ();
    print("starting");
    var m = new Monitor();
    
    m.add("/home/alan/gitlive");
    m.start();
    loop.run ();

    return 0;

}
