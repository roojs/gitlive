XObject = imports.XObject.XObject;

Soup = imports.gi.Soup;

var XMLHttpRequest = function (cfg) {
    if (typeof(cfg) == 'object') {
        for(var i in cfg) {
            this[i] = cfg[i];
        }
    }
    
}

XMLHttpRequest.prototype = { 
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
    
    
    _message : false,
    _session : false,
    _async   : false,
    
    // request
    open : function ( method,  url, async, user, password)
    {
        async = async || false;
        user = user || false;
        password = password || false;
        
        this._session = async ?  new Soup.SessionAsync() : new Soup.SessionSync();

        var uri = new Soup.URI.c_new(url);
        this._message = new Soup.Message({method: method, uri:uri});
        this._async = async;

        if (user || password) {
            user = user || '';
            password = password || '';
            var auth = new Soup.Auth.c_new(
                    Soup.AuthBasic.type,
                    this._message,
                    "Basic realm=\"Test\"");
 
            

            auth.authenticate(user,password);
            var authmsg = auth.get_authorization(this._message);
            //print(authmsg);
            this._message.request_headers.append(
                'Authorization', authmsg);
        }

        
        
    },
    
    setRequestHeader : function ( header,  value)
    {
        _this.message.request_headers.append(headers, value)

    },
    overrideMimeType : function ( mime)
    {
        
    },
    send  : function(data)
    {
        data = data|| false;
        if (data) {
            this._message.set_request('application/x-www-form-urlencoded', Soup.MemoryUse.COPY, data, data.length)
        }
        var _t = this;
        if (this._async) {
            this._session.queue_message(this._message, function(ses, msg) {
                // doc's say we get here after we have sent the data..
                
                //print("got queue callback");
                //_t._session.unpause_message(this._message);
                print("queue message");
                print(_t._message.response_body.data)
                _t.responseText = _t._message.response_body.data;
                _t.status = 4;
            
                if (_t.onreadystatechange) {
                    _t.onreadystatechange();
                }
                
                
            });
            return false;
            
        }
        var status = this._session.send_message(this._message);
        this.responseText = this._message.response_body.data;
        this.status = 4;
        if (_t.onreadystatechange) {
            _t.onreadystatechange();
        }
        return status;

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
   
    
};
