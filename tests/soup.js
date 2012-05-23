#!/usr/bin/env seed

Soup = imports.gi.Soup;

var session = new Soup.SessionSync();

// Soup.URI is a struct.
var uri = new Soup.URI.c_new("http://www.roojs.com/admin.php");
var msg = new Soup.Message({method:"GET", uri:uri});
//request.headers_append...
var status = session.send_message(msg);
// session.queue_message(function(ses, msg) {
//
//}
//)
print(status);

print(msg.response_body.data);
