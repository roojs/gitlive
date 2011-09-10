var XObject = imports.XObject.XObject;


Event = XObject.define( 
    function (cfg) {
        // do nothing?? universal ctr ?
        Roo.apply(this,cfg);
        if (cfg.commit) {
            this.parseCommit();
        }
    },
    Object,
    {
        
         
        
        repo : false,
        /** Revision or changeset identifier for this particular file */
        rev : false,
    
        /** commit message associated with this revision */
        changelog : false,
    
        /** who committed this revision */
        changeby : false,
    
        /** when this revision was committed */
        ctime : false,
    
        /** files affected in this event; may be null, but otherwise
        * will be an array of MTrackSCMFileEvent */
        files : false,
    
        commit : false,
        
        
        
        
        parseCommit  : function()
        {
            
            var ent = this;
            ent.commit = commit;
            ent.repo = repo;
            var lines = commit.split("\n"); 
            var line = lines.shift();
        
            if (!line.match(/^commit\s+(\S+)/)) {
                throw "Invalid commit line";
            }
            var M = [];
            line.replace(/^commit\s+(\S+)/, function(v,va) {
                M.push(va);
            });
                 
            ent.rev = M[1];
        
            ent.branches    = []; // FIXME
            ent.tags        = []; // FIXME
            ent.files       = [];
        
            while (lines.length) {
                line = lines.shift();
                if (!line.length) {
                    break; //  empty line = STOP?
                }
                if (line.match(/^(\S+):\s+(.*)\s*/)) {
                    M = [];
                    line.replace(/^(\S+):\s+(.*)\s*/, function(m,ma,mb) {
                        M.push(ma);
                        M.push(mb);
                    }) 
                    var k = M[1];
                    var v = M[2];
        
                    switch (k) {
                        case 'Author':
                          ent.changeby = v;
                          break;
                        
                        case 'Date':
                          //var ts = strtotime(v);
                          ent.ctime = v; //MTrackDB::unixtime(ts);
                          break;
                    }
                }
            }
        
            ent.changelog = "";
        
            if (lines[0] == '') {
                lines.shift();
            }
        
            while ( lines.length ) {
                line = lines.shift();
                if (!line.match(/^    /)) { 
                    lines.unshift( line );
                    break;
                }
                line = substr(line, 4);
                ent.changelog += line + "\n";
            }
        
            if (lines[0] == '') {
                lines.shift();
            }
            var info;
            // this should only be the last set of lines..
            lines.forEach(function(line) { 
                if (!line.length) {
                    return;
                }
                  
                if (line.match(/^:/)) {
                    // it's our stat line..:
                    // :100755 100755 fde93abd1a71accd3aa7e97b29c1eecfb43095d7 
                    // 3d71edf6512035846d8164c3b28818de0062335a M      web/MTrackWeb/DataObjects/Changes.php
                    info = line.substr(1).split(/\s+/);
                   // print_r(info);
                    f = new MTrackSCMFileEvent; //generic..
                   
                    f.oldperm = info.unshift();
                    f.newperm = info.unshift();
                    f.oldver  = info.unshift();
                    f.newver  = info.unshift();;
                    f.status  = info.unshift();
                    f.name = info.join(' '); // not the right way to do this!!! - does not handle names correclty.
                    ent.files[f.name] = f;
                    return;
                }
             
                info = line.substr(1).split(/\s+/); // 3 only..
                //print_r(info);
                var added = info.unshift();
                var removed = info.unshift();
                
                name = info.join(" ");
                ent.files[name].added   = added;            
                ent.files[name].removed = removed;
                
            });
            // fixme..
            if (!ent.branches.length) {
                ent.branches.push(  'master' );
            }
        
            return ent;
        }
    }
);

/**
 * this is based on the output from git --raw --numstat
 */
Event.
  
 