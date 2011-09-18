var Gtk = imports.gi.Gtk;

var Repo = imports.Scm.Git.Repo.Repo;


Gtk.init(Seed.argv);

File = imports.File.File;

var repo = new Repo({ repopath : '/home/alan/gitlive/gitlive' });

repo.applyPatch(File.read('/tmp/test1.txt'));
 
//var hist = repo.history('/', false, 'rev', 'github..master');
//var hist = repo.getBranches();

//var hist = repo.changedFiles('/',   'rev', 'github..master');


print(JSON.stringify(hist,null,4));
  
//Gtk.main();