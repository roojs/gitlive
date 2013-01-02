
var File = imports.File.File;
xDate = imports.Date;





GitLogParser = { 

    parse : function(date)
    {
        this.date  = date;        
        var home  = GLib.get_home_dir();
        print( "READING FILE");
        var flines = File.read(  home + '/.gitlog' + date.format('/Y/m/d') + '.log').split("\n");
        print("loaded");
        // first just convert them..
        // we had an old bug that did not put line breaks in there..
        // however 00:00:00: is pretty distinct, so let'st try and split on it..
        
        
        
        lines = [];
        
        // read the lines, and fill in the 'spans'
        
        for (var i = 0; i < flines.length; i++) {
            
            var xl = flines[i].split(/([0-9]{2}:[0-9]{2}:[0-9]{2})/);
            
            //print(JSON.stringify(xl));
            for (var ii=1; ii< xl.length; ii+=2) {
                var p = lines.length;
                lines.push( this.parseLine(xl[ii] + ' ' + xl[ii+1])); 
                if (p > 0) {
                    lines[p-1].span = lines[p].start - lines[p-1].start; // should be seconds..?
                    lines[p-1].spanMin = lines[p-1].span/60000;
                    
                    
                }
            
            }
             
            
        }
        print("parsed");
        //print(JSON.stringify(lines,null,4));
        
        // summarize data...
        var hours = {};
        var shours = {};
        
        // shours should be:
        // hour : [ ]
        
        
        for (var i = 0; i < lines.length; i++) {
            var line = lines[i];
            var hour = line.start.format('H');
            
            if (line.project == 'IDLE' && line.spanMin >= 5 ) {
                line.project = 'LONGIDLE';
            }
            if (line.project == 'IDLE' || line.project == 'LONGIDLE') {
                line.desc = line.project;
            }
            
            var project = line.project;
            hours[hour] = (typeof(hours[hour]) == 'undefined') ? {} : hours[hour];
            hours[hour][project] = (typeof(hours[hour][project]) == 'undefined') ? 
                    { total : 0, items : [] } 
                    : hours[hour][project];
            hours[hour][project].total += line.span;
            hours[hour][project].items.push(line);
            
            
            
            
        }
        return hours;

    },
    parseLine : function(l) 
    {
        var ret = { cmd : false,  line : l, span : 0 };
        var ar = l.split(/\s+/);
        //print(JSON.stringify(ar));
        
            
        var time = ar.shift();
        
        ret.desc = ar.join(' ');
        
        //print("time: " + time);
        
        ret.start = xDate.Date.parseDate(this.date.format('Y-m-d') + ' ' + time, 'Y-m-d H:i:s');
        

        while (ret.cmd === false) {
            var ta = ar.pop();
            //print("TA:"+ta)
            if (ta[0] !=  '-') { //hopfully withc catch stuff.
                ret.cmd = ta;
                break;
            }
            if (!ar.length) {
                // just assume it's the last bit..
                //print(line);
                throw "invalid line: " + l;
            }

        }
        //print(ret.cmd);
        
        
        ret.title = ar.join(' ');
        if (ret.title == 'IDLE') {
            ret.project = 'IDLE';
            return ret;        
        }
                
        

        if (typeof(this[ret.cmd])=='undefined') {
             ret.project = 'Unknown';
            return ret;
            print( "Unknown application: " + ret.line);
            throw { error : "TEST"};
        }
        
        print(ret.cmd);
        print(ret.title);
        if (typeof(this[ret.cmd])=='string') {
            ret.project = this[ret.cmd]  
        } else {

            this[ret.cmd](ret);
        }


        return ret;

    },
 
    '/usr/bin/perl' : function(ret) {
        if (ret.title.match(/^PAC/)) {
            ret.project = 'Unknown';
            return  'Unknown';
        }
        return 'Unknown';
        throw "Unknown match: " + ret.line;
    },
    '/usr/lib/icedove/icedove-bin' : 'Checking Mail',
    '/usr/lib/chromium/chromium' : function (ret) {

          switch(true) {

                case (ret.title.match(/Media Clipping Portal/)):
                    ret.project = 'Media Outreach';
                    return;
                
                default:
                    ret.project = 'Browsing';
                    return;
          }

    },
    '/usr/lib/Komodo-Edit-7/lib/mozilla/komodo' : function(ret) {
        var l = ret.title.match(/Project\s+(^\)+)/);
        if (!l) {
            ret.project="Unknown";
            return;
        }
        throw "Unknown match: " + ret.line;
    },
    'guake' : 'Local Terminal',
    'mono' : 'mono?'
    

}
//print(Seed.argv[2]);Seed.quit();
if (typeof(Seed.argv[2]) == 'undefined') {
    print("pick a date");
    Seed.quit();
}


var res = GitLogParser.parse(xDate.Date.parseDate(Seed.argv[2], 'Y-m-d'));
var totals = { work : 0 , idle: 0, shortidle : 0}
for (var h in res) {
    for (var p in res[h]) {
        if (p == 'LONGIDLE') {
            var idletime = Math.floor(res[h][p].total/60000) ;
            print(h + ' ' + Math.floor(res[h][p].total/60000) +'m LONGIDLE' );
            totals.idle += idletime;
            
             
            continue;
        }
        if (p == 'IDLE') {
            var idletime = Math.floor(res[h][p].total/60000) ;
            print(h + ' ' + Math.floor(res[h][p].total/60000) +'m SHORT IDLE' );
            totals.shortidle += idletime;
            
             
            continue;
        }
        
        
        print(h + ' ' + Math.floor(res[h][p].total/60000) +'m ' + p );  
        totals.work += Math.floor(res[h][p].total/60000) ;
        for (var k in res[h][p].items) {
             
            //print( '     ' + Math.floor(res[h][p].items[k].span/60000) +'m ' + res[h][p].items[k].line );
                 
        }
        
        
    }
    
}
print("\nLONGIDLE : " +(totals.idle/60).toFixed(2) +"h" );
print("\nShort Idle : " +(totals.shortidle/60).toFixed(2) +"h" );

print("Worked: " + (totals.work/60).toFixed(2) +"h\n" );
 

// open file..

// read lines

// summarize each hour

//convert line into 'Project / filename'


