var Gtk = imports.gi.Gtk;

var Repo = imports.Scm.Git.Repo.Repo;


Gtk.init(Seed.argv);

var repo = new Repo({ repopath : '/home/alan/gitlive/roojs1' });
 
var hist = repo.history('/', false, 'rev', 'github..master');
//var hist = repo.getBranches();

//var hist = repo.changedFiles('/',   'rev', 'github..master');


print(JSON.stringify(hist,null,4));
  
//Gtk.main();