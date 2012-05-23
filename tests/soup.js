#!/usr/bin/env seed

Soup = imports.gi.Soup;

var session = new Soup.SessionSync();




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

//print(msg.response_body.data);
