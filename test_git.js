var Gtk = imports.gi.Gtk;

var Repo = imports.Scm.Git.Repo.Repo;


Gtk.init(Seed.argv);

var repo = new Repo({ repopath : '/home/alan/gitlive/gitlive' });
 
//var hist = repo.history('/', false, 'rev', 'github..master');
var hist = repo.getBranches();

//var hist = repo.changedFiles('/',   'rev', 'github..master');

print(JSON.stringify(hist,null,4));
/*


var Git = imports.Git.Git;
var git = new Git('/home/alan/gitlive/roojs1');
git.async = true;
var out = git.run(
{ 'no-pager' : true },  
   'log',
   'github..master',
   { 'no-color' : true },
   { 'raw' : true },
   { 'numstat' : true },
   { 'date' : 'rfc' }  
);
print(out);
*/

//Gtk.main();