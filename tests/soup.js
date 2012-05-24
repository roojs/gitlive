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
    
    timeout : 0,
    withCredentials : false,
    
    // states
    UNSENT : 0,
    OPENED : 1,
    HEADERS_RECEIVED : 2,
    LOADING : 3,
    DONE : 4,
    
    // readonly..
    readyState : 0,
    upload: null,
    
    // request
    open : function ( method,  url, async, user, password)
    {
        async = async || false;
        user = user || false;
        password = password || false;
    },
    
    setRequestHeader : function ( header,  value)
    {
           
    },
     overrideMimeType : function ( mime)
    {
        
    },
    send  : function(data)
    {
        
    },
    abort : function()
    {
        
    },
    
    // response (all readonly...)
    status : false,
    statusText : false,
    //readonly attribute any response
    responseText : false,
    responseXML : false,
    responseType : false, 
    
    // response - read
    getResponseHeader : function(  header)
    {
        
    },
    getAllResponseHeaders : function ()
    {
        
    }
   
    
});
