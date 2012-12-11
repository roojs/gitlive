
XObject = imports.XObject.XObject;
XMLHttpRequest = imports.XMLHttpRequest.XMLHttpRequest;
Netrc = imports.Netrc.Netrc;
Date = imports.Date.Date;
/**
 *
 * Projects - 
 *
 *
 *
 */

Projects = {
    
    list : [],
    
    // called on startup..??
    // clear list, and call again to refresh..
    
    fetch: function(callback)
    {
        // have we got the status in the last 15 mins..
        // we should not need to get it again... - it's probably not changed.
        
        if (this.list.length) {
            callback( this.list);
        }
        
        _this = this;
        // do the request to get the task..
        var r = new XMLHttpRequest({
            onreadystatechange : function() {
                print("Got result.");
                if (this.status != 4) {
                    return;
                }
                
                  
                var res = JSON.parse(this.responseText);
                
                //print(JSON.stringify(res,null,4))
                //print([ res.success , res.data.length ]);
                if (!res.success || !res.data.length)  {
                    print("NO tasks returned");
                    Projects.list = []; //res.data;
                    return;
                }
                Projects.list = res.data;
                
                //print("Current task:" + JSON.stringify(_this.curTask,null,4));
                callback(res.data);
            }
            
        });
        var netrc  = Netrc.forHost('git.roojs.com');
        
        r.open('GET',
               "http://roojs.com/admin.php/Roo/Projects?sort=code&dir=ASC&active=1"
               ,true, netrc.login, netrc.password  );
        // print("Getting current task: "  +  "http://roojs.com/admin.php/Roo/mtrack_ticket?repo_shortname=" + repo.name);        
        r.send();
        
    },
    
    
    
      
    
};




 







//-------------- testing

Gtk = imports.gi.Gtk;
Gtk.init(Seed.argv);
Projects.fetch( function(list) { print(JSON.stringify(list,null,4)); } );
Gtk.main();
 