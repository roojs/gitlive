


Request = function(opts) {
    
          
        _this = this;
        // do the request to get the task..
        var r = new XMLHttpRequest({
            onreadystatechange : function()
            {
                print("Got result.");
                if (this.status != 4) {
                    return;
                }
                
                  
                var res = JSON.parse(this.responseText);
                
                //print(JSON.stringify(res,null,4))
                //print([ res.success , res.data.length ]);
                if (!res.success || !res.data.length)  {
                    print("NO tasks returned");
                    callback([]);
                    return;
                }
                
                //print("Current task:" + JSON.stringify(_this.curTask,null,4));
                if (opts.success) { 
                    opts.success.call(opts.scope || this, res.data);
                }
            }
            
        });
        
        
        var netrc  = Netrc.forHost('git.roojs.com');
        
          
        
        r.open('GET',
               'http://roojs.com/admin.php' + opts.url + '?' + r.urlEncode(opts.params)
               ,true, netrc.login, netrc.password  );
        print("Getting current task: "  +
                'http://roojs.com/admin.php' + opts.url + '?' + r.urlEncode(opts.params)
             );        
        r.send();
        
    }
}
    
    
    
