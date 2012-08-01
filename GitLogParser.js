
var File = imports.File.File;
xDate = imports.Date;


GitLogParser = { 

    parse : function(date)
    {
        this.date  = date;        
        var home  = GLib.get_home_dir();
        
        var flines = File.read(  home + '/.gitlog' + date.format('/Y/m/d') + '.log').split("\n");
        // first just convert them..
        // we had an old bug that did not put line breaks in there..
        // however 00:00:00: is pretty distinct, so let'st try and split on it..
        
        
        
        lines = [];
        for (var i = 0; i < flines.length; i++) {
            var xl = flines[i].split(/([0-9]{2}:[0-9]{2}:[0-9]{2})/);
            //print(JSON.stringify(xl));
            for (var ii=1; ii< xl.length; ii+=2) {
                var p = lines.length;
                lines.push( this.parseLine(xl[ii] + ' ' + xl[ii+1])); 
                if (p > 0) {
                    lines[p-1].span = lines[p].start - lines[p-1].start; // should be seconds..?
                }
            
            }
             
            
        };
        // summarize data...
        var hours = {};
        for (var i = 0; i < lines.length; i++) {
            var line = lines[i];
            var hour = hours[line].start.format('H');
            hours[hour] = (typeof(hours[hour]) == 'undefined') ? {} : hours[hour];
            hours[hour][project] = (typeof(hours[project]) == 'undefined') ? 
                    { total : 0, items : [] } 
                    : hours[project];
            hours[hour][project].total += line.span;
            hours[hour][project].items.push(line);
        }
        return hours;

    },
    parseLine : function(l) 
    {
        var ret = { cmd : false,  line : l };
        var ar = l.split(/\s+/);
        print(JSON.stringify(ar));
            
        var time = ar.shift();
        print("time: " + time);
        
        ret.start = xDate.Date.parseDate(this.date.format('Y-m-d') + ' ' + time, 'Y-m-d H:i:s');
        

        while (ret.cmd === false) {
            var ta = ar.pop();
            print("TA:"+ta)
            if (ta[0] !=  '-') { //hopfully withc catch stuff.
                ret.cmd = ta;
                break;
            }
            if (!ar.length) {
                // just assume it's the last bit..
                print(line);
                throw "invalid line: " + l;
            }

        }
        print(ret.cmd);
        
        
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
            return;
        }
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
          print(l);
              
         throw "Unknown match: " + ret.line;
    },
    'guake' : 'Local Terminal',
    'mono' : 'mono?'
    

}

var res = GitLogParser.parse(xDate.Date.parseDate('2012-07-31', 'Y-m-d'));
print(JSON.stringify(res,null,4));

// open file..

// read lines

// summarize each hour

//convert line into 'Project / filename'


