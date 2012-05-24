const GLib = imports.gi.GLib;

const File  = imports['../File.js'].File;


Netrc = {
    
    data : {},
    
    load : function()
    {
        
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
        this.data = authdata;
         
    },
    
    forhost: function(name)
    {
        return this.data[name];
    }
    
    
}
