const GLib = imports.gi.GLib;

const File  = imports['../File.js'].File;

/**
 * usage:
 * var cfg = Netrc.forHost('www.google.com');
 * var uname = cfg.login
 * var pass = cfg.password
 *
 *
 */
Netrc = {
    
    forHost: function(name)
    {
        try {
            return this._data[name];
        } catch(e) {
            throw "Host " + name + " was not found in netrc file (or parser could not read file..)\n";
        }
    
    },
    
    _data : {},
    /**
     * private - called at the bottom..
     */
    _load : function()
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
        this._data = authdata;
         
    }
    
  
    
    
}
// load the file up.
Netrc._load();