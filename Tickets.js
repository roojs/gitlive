/**
 *
 * let's see if we can pull a list of tickets from the tracker..
 *
 */

GI      = imports.gi.GIRepository
GLib        = imports.gi.GLib;


Soup = imports.gi.Soup ;


var File = imports.File.File;

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
    
    fetchBugs : function(url)
    {
        Tickets.parseNetrc();
        var ar = url.split('/');
        print(JSON.stringify(ar, null, 4));
        var auth = new Soup.Auth()
        var session = new Soup.SessionSync();
        session.signal.authenticate.connect(function(sess, msg, auth, rt) {
            //print("authenticate?");
            auth.authenticate(
                    Tickets.machines[ar[2]].login,
                    Tickets.machines[ar[2]].password
            );
        });
        var request = new Soup.Message({
                method:"GET",
                uri:new Soup.URI.c_new(url)
            });
        var status = session.send_message(request); 
        
        var data = request.response_body.data;
        
        print(data);
        return JSON.parse(data).data;
        
    }
    
    
    
}


//print ( JSON.stringify(Tickets.machines) );




//Tickets.fetchBugs("http://www.roojs.com/mtrack/index.php/Gitlive/web.hex");
 