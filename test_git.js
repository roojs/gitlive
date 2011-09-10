var Gtk = imports.gi.Gtk;

Gtk.init(Seed.argv);


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

Gtk.main();