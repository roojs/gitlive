/**
 *
 * let's see if we can pull a list of tickets from the tracker..
 *
 */
GLib        = imports.gi.GLib;



File = imports['../File.js'].File;

Tickets = {
    
    parseNetrc : function()
    {
        this.machines = {};
        // very basic parsing - only support single line version..
        var lines = File.read(GLib.get_home_dir() + '/.netrc').split(/\n/);
        var t = this;
        lines.forEach(function(l)  {
            if (!l.match(/^machine/)) {
                return;
            }
            var ar = l.split(/\s+/);
            // assume machine XXX login XXX password XXXX
            t.machines[ar[1]] = { login : ar[3], password: ar[5]}
        });
        
        
    }
    
    
}

Tickets.parseNetrc();
print ( JSON.stringify(Tickets.machines) );

