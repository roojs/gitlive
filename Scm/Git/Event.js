var XObject = imports.XObject.XObject;


Event = XObject.define( 
    function (cfg) {
        // do nothing?? universal ctr ?
        XObject.extend(this,cfg);
        if (this.commit.length) {
            this.parseCommit();
        }
        //print(JSON.stringify(this, null,4)); Seed.quit();
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
            
            this.branches    = []; // FIXME
            this.tags        = []; // FIXME
            this.files       = {};
        
         
             
            var lines = this.commit.split("\n");
            
            // print ('--->'+ lines.join("\n"));

            var line = lines.shift();
            if (!line.match(/^commit\s+(\S+)/)) {
                throw "Invalid commit line";
            }
            this.rev = line.replace(/^commit\s+/,'');
            
            while (lines.length) {
                line = lines.shift();
                if (!line.length) {
                    break; //  empty line = STOP?
                }
                if (line.match(/^(\S+):\s+(.*)\s*/)) {
                    var k,v
                    line.replace(/^(\S+):\s+(.*)\s*/, function(m,ma,mb) {
                        k = ma;
                        v = mb;
                    }) 
                   
                    switch (k) {
                        case 'Author':
                          this.changeby = v;
                          break;
                        
                        case 'Date':
                          //var ts = strtotime(v);
                          this.ctime = v; //MTrackDB::unixtime(ts);
                          break;
                    }
                }
            }
        
            this.changelog = "";
        
            if (lines[0] == '') {
                lines.shift();
            }
        
            while ( lines.length ) {
                line = lines.shift();
                if (!line.match(/^    /)) { 
                    lines.unshift( line );
                    break;
                }
                line = line.substring( 4);
                this.changelog += line + "\n";
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
                    var lr = line.split(/\t/);
                    var info = lr[0].substring(1).split(/\s+/);
                    
                      
                   // print_r(info);
                    var f = {}; //new MTrackSCMFileEvent; //generic..
                   
                    f.oldperm = info.shift();
                    f.newperm = info.shift();
                    f.oldver  = info.shift();
                    f.newver  = info.shift();;
                    f.status  = info.shift();
                    f.name = lr[1]; // not the right way to do this!!! - does not handle names correclty.
                    ent.files[f.name] = f;
                     
                    return;
                }
             
                var info = line.substring(1).split(/\t/); // 3 only..
                //print_r(info);
                var added = info.shift();
                var removed = info.shift();
                
                var name = info.join("\t");
                
                ent.files[name] = XObject.extend(
                    typeof(ent.files[name]) == 'undefined' ? {}  : ent.files[name],
                    {
                         added   : added,
                         removed : removed
                    }
                );                
            });
            // fixme..
            if (!this.branches.length) {
                this.branches.push(  'master' );
            }
        
         }
    }
);

 