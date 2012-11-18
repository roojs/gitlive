
Netrc = imports['../Netrc.js'].Netrc;
var cfg = Netrc.forHost('git.roojs.com');
var home_page = 'http://' +  cfg.login + ':' + cfg.password + '@www.roojs.com/admin.php';
 
 
var select_new_tabs = false;

// Test for Gtk >= 2.16 (otherwise don't have a progress bar)

var have_progress_bar = false;

if(imports.gi.Gtk.Entry.prototype.set_progress_fraction)
{
	have_progress_bar = true;
}

