#!/usr/bin/env seed
XMLHttpRequest = imports['../XMLHttpRequest.js'].XMLHttpRequest;
Netrc = imports['../Netrc.js'].Netrc;
File  = imports['../File.js'].File;
Gtk      = imports.gi.Gtk;

Gtk.init (null, null);

// sa

 
var authvals = Netrc.forHost('git.roojs.com');


//print(JSON.stringify(imports['../XMLHttpRequest.js'], null,4));

var x = new XMLHttpRequest({
    onreadystatechange : function()
    {
        print("GOT " + x.responseText);
        
        
    }
    
    
});
print(JSON.stringify(x));

//"http://www.roojs.com/admin.php/Roo/Events" POST
x.open("GET", "http://www.roojs.com/admin.php/Roo/Events?limit=3", true, authvals.login ,authvals.password)
//buftxt =  "remarks=test";


x.send();
 
Gtk.main();
//var msg = new Soup.Message({method:"GET", uri:uri});

// post..
 
// session.queue_message(function(ses, msg) {
//
//}
//)
