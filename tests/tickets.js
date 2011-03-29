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
        
        
    },
    
    fetchBugs : function()
    {
        var session = new Soup.SessionSync();
        
        var status = session.send_message(
            new Soup.Message({
                method:"GET",
                uri:new Soup.URI.c_new("http://roojs.com/mtrack.php/Bugs")
            })                                          
        );
        
        var data = request.response_body.data;
        print(data);
        
    }
    
    
    
}

Tickets.parseNetrc();
//print ( JSON.stringify(Tickets.machines) );

Tickets.fetchBugs();
