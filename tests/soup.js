#!/usr/bin/env seed

Soup = imports.gi.Soup;
GLib = imports.gi.GLib;

var session = new Soup.SessionSync();
File  = imports['../File.js'].File;

var netrc = File.read(GLib.get_home_dir() + "/.netrc");
var lines = [];
netrc.split("\n").forEach(function(nl) {
   var line = {};
   var k = false;
   nl.split(/\s+/).forEach(function(kv) {
        if (!k) {
            k = kv;
            return
        }
        line[k] = kv
        k = false;
   });
   
   lines[line.machine] = line;
    
});
print(JSON.encode(lines));

// Soup.URI is a struct.
var uri = new Soup.URI.c_new("http://www.roojs.com/admin.php/Roo/person");
var msg = new Soup.Message({method:"GET", uri:uri});

var auth = new Soup.Auth.c_new(Soup.AuthBasic.type, msg, "Basic realm=\"Test\"");
print(auth);
print(auth.authenticate);
auth.authenticate('aaaa','bbbb');
var authmsg = auth.get_authorization(msg);

msg.request_headers.append('Authorization', authmsg + '==')

//request.headers_append...
var status = session.send_message(msg);
// session.queue_message(function(ses, msg) {
//
//}
//)
print(status);

print(msg.response_body.data);
