
Netrc = imports['../Netrc.js'].Netrc;
var netrc  = Netrc.forHost('git.roojs.com');
var home_page = 'www.roojs.com/admin.php';
//var home_page = 'www.google.com';
  
var select_new_tabs = false;

// Test for Gtk >= 2.16 (otherwise don't have a progress bar)

var have_progress_bar = false;

if(imports.gi.Gtk.Entry.prototype.set_progress_fraction)
{
	have_progress_bar = true;
}

