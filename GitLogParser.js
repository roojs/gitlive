
var File = imports.File.File;
xDate = imports.Date;


GitLogParser = { 

    parse : function(date)
    {
        this.date  = date;        
        var home = '/home/alan';        
        var lines = File.read(  home + '/.gitlog' + date.format('/Y/M/d') + 'txt').split("\n");
        // first just convert them..
        
        for (var i = 0; i < lines.length; i++) {
            lines[i] = this.parseLine(lines[i]);
            if (i > 0) {
                lines[i-1].span = lines[i].start - lines[i-1].start; // should be seconds..?
            }
        });
        // summarize data...
        var hours = {};
        for (var i = 0; i < lines.length; i++) {
            var line = lines[i];
            var hour = hours[line].start.format('H');
            hours[hour] = (typeof(hours[hour]) == 'undefined') ? {} : hours[hour];
            hours[hour][project] = (typeof(hours[project]) == 'undefined') ? 
                    { total : 0, items = [] } 
                    : hours[project];
            hours[hour][project].total += line.span;
            hours[hour][project].items.push(line);
        }
        return hours;

    },
    parseLine : function(l) 
    {
        var ret = { cmd : false; line : l };
        var ar = l.split(/\S+/);
        var time = ar.shift();
        ret.start = xDate.parseDate(this.date.format('Y-m-d') + ' ' + time, 'Y-m-d H:i:s');


        while (ret.cmd !== false) {
            var ta = ar.pop();
            if (ta == 'false') || ta[0] == '/') {
                ret.cmd = ta;
                break;
            }
            if (!ar.length) {
                throw "invalid line: " + l;
            }

        }
        ret.title = ar.join(' ');
        if (ret.title == 'IDLE') {
            ret.project = 'IDLE';
            return ret;        
        }
                
        

        if (typeof(this[ret.cmd])=='undefined') {
            throw "Unknown application: " + ret.line;
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


}

var res = GitLogParser.parse(xDate.Date.parseDate('2012-07-31', 'Y-m-d'));
print(JSON.stringify(res,null,4));

// open file..

// read lines

// summarize each hour

//convert line into 'Project / filename'


