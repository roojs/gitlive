#!/usr/bin/env seed

Soup = imports.gi.Soup;
Netrc = imports['../Netrc.js'].Netrc;

GLib = imports.gi.GLib;

var session = new Soup.SessionSync();
File  = imports['../File.js'].File;

Netrc.load();
 
// Soup.URI is a struct.
var uri = new Soup.URI.c_new("http://www.roojs.com/admin.php/Roo/Events");
//var uri = new Soup.URI.c_new("http://www.roojs.com/head.php");

var msg = new Soup.Message({method:"POST", uri:uri});
//var msg = new Soup.Message({method:"GET", uri:uri});

// post..
buftxt =  "remarks=test";
 
msg.set_request('application/x-www-form-urlencoded', Soup.MemoryUse.COPY, buftxt, buftxt.length)


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
