#!/usr/bin/env seed

Soup = imports.gi.Soup;
Netrc = imports['../Netrc.js'].Netrc;

GLib = imports.gi.GLib;

var session = new Soup.SessionSync();
File  = imports['../File.js'].File;

 
// Soup.URI is a struct.
var uri = new Soup.URI.c_new("http://www.roojs.com/admin.php/Roo/Events");
//var uri = new Soup.URI.c_new("http://www.roojs.com/head.php");

var msg = new Soup.Message({method:"POST", uri:uri});
//var msg = new Soup.Message({method:"GET", uri:uri});

// post..
buftxt =  "remarks=test";
 
msg.set_request('application/x-www-form-urlencoded', Soup.MemoryUse.COPY, buftxt, buftxt.length)


var auth = new Soup.Auth.c_new(Soup.AuthBasic.type, msg, "Basic realm=\"Test\"");
 
var authvals = Netrc.forHost('git.roojs.com');

auth.authenticate(authvals.login ,authvals.password);
var authmsg = auth.get_authorization(msg);
//print(authmsg);
msg.request_headers.append('Authorization', authmsg)

//request.headers_append...
var status = session.send_message(msg);
// session.queue_message(function(ses, msg) {
//
//}
//)
print(status);

print(msg.response_body.data);


function XMLHttpRequest() {
    
    
}

XObject.extend(XMLHttpRequest,{ 
    // event handlers
    //onreadystatechange;
    //onloadstart;
    //onprogress;
    //onabort;
    //onerror;
    //onload;
    //ontimeout;
    //onloadend;
    
    timeout : 0;
    withCredentials : false,
    
    // states
    UNSENT : 0,
    OPENED : 1,
    HEADERS_RECEIVED : 2,
    LOADING : 3,
    DONE : 4,
    
    readyState : 0,

    // request
    open : function ( method,  url, async, user, password) {
        async = async || false;
        user = user || false;
        password = password || false;
    },
    
    setRequestHeader : function ( header,  value);
           
    readonly attribute XMLHttpRequestUpload upload;
    void send(data);
    void send(ArrayBuffer data);
    void send(Blob data);
    void send(Document data);
    void send(DOMString? data);
    void send(FormData data);
    void abort();
    
    // response
    readonly attribute unsigned short status;
    readonly attribute DOMString statusText;
    DOMString getResponseHeader(DOMString header);
    DOMString getAllResponseHeaders();
    void overrideMimeType(DOMString mime);
             attribute XMLHttpRequestResponseType responseType;
    readonly attribute any response;
    readonly attribute DOMString responseText;
    readonly attribute Document responseXML;
};
