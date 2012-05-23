#!/usr/bin/env seed

Soup = imports.gi.Soup;
GLib = imports.gi.GLib;

var session = new Soup.SessionSync();
File  = imports['../File.js'].File;

var netrc = File.read(GLib.get_home_dir() + "/.netrc");
var authdata = {};
netrc.split("\n").forEach(function(nl) {
    var line = {};
    var k = false
     
    nl.replace(/\s+$/,'').replace(/^\s+/,'').split(/\s+/).forEach(function(kv) {
      
        if (!k) {
            k = kv;
            return
        }
        line[k] = kv
        k = false;
   });
       
   authdata[line.machine] = line;
    
});
 
// Soup.URI is a struct.
var uri = new Soup.URI.c_new("http://www.roojs.com/admin.php/Events");
//var uri = new Soup.URI.c_new("http://www.roojs.com/head.php");

var msg = new Soup.Message({method:"POST", uri:uri});
//var msg = new Soup.Message({method:"GET", uri:uri});

// post..

var buf = new Soup.Buffer.c_new("remarks=test");
msg.request_body.append_buffer(buf);


var auth = new Soup.Auth.c_new(Soup.AuthBasic.type, msg, "Basic realm=\"Test\"");
print(auth);
print(auth.authenticate);
var authvals = authdata['git.roojs.com'];
auth.authenticate(authvals.login ,authvals.password);
var authmsg = auth.get_authorization(msg);
print(authmsg);
msg.request_headers.append('Authorization', authmsg)

//request.headers_append...
var status = session.send_message(msg);
// session.queue_message(function(ses, msg) {
//
//}
//)
print(status);

print(msg.response_body.data);
