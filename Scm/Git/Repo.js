
const GLib   = imports.gi.GLib;

const XObject = imports.XObject.XObject;
const Event  = imports.Scm.Git.Event.Event;
const Spawn  = imports.Spawn.Spawn;
const File  = imports.File.File;


Repo = XObject.define(
    function(cfg) {
        // cal parent?
        XObject.extend(this,cfg);
        this.gitdir = cfg.repopath + "/.git";
        
        if (!File.isDirectory(this.gitdir)) {
            this.gitdir = this.repopath;
        }
        //Repo.superclass.constructor.call(this,cfg);
        
    },
    imports.Scm.Repo.Repo, // or Object
    {
        branches : false,
        currentBranch : false,
        tags : false,
        gitdir : false,
        debug : false,
        lastCmd : false, 
        
        getMetaData : function() {
            return {
              name :  'Git',
              tool : ['git' ]  
                
            };
        },
        getBranches : function()
        {
            if (this.branches !== false) {
                return this.branches;
            }
            this.branches = [];
            
            var bl = this.git([ 'branch', {
                'no-color' : true,
                'verbose' : true,
                'no-abbrev'  : true,
                'a' : true
            }]).split("\n");
            var bmap = {};
            var _this=this;
            
            var local = [];
            var remotes = [];
            
            bl.forEach(function(line) {
                  // * master 61e7e7d oneliner
                var active = line[0]=='*';
                if (!line.length) {
                    return;
                }
                line = line.substring(2);
                
                //print(JSON.stringify(line));
                var parts = line.split(/\s+/);
                if (parts[1] == '->') {
                    return; // it's an alias like  remotes/origin/HEAD    -> origin/master
                }
                var br = {
                    lastrev :  parts[1],
                    name :      '',
                    remote :    '',
                    remoterev : ''
                };
                if (parts[0].match(/^remotes\//)) {
                    br.remote = parts[0];
                    bmap[br.remote] = br;
                    remotes.push(br);
                } else { 
                    br.name = parts[0];
                    bmap[br.name] = br;
                    local.push(br);
                }
                
                if (active) {
                    _this.currentBranch = parts[0];
                }
            });
            
            print(JSON.stringify(local));
            print(JSON.stringify(remotes));
            print(JSON.stringify(bmap,null,4));

            
            // overlay tracking informaion
            bl = this.git([
                'for-each-ref',
                { format :  '%(refname:short):remotes/%(upstream:short)' },
                'refs/heads'
            ]).split("\n");
            //print(this.lastCmd);
            
            //print(JSON.stringify(bl,null,4));
            
            bl.forEach(function(line) {
                if (!line.length) {
                    return;
                }
                var ar = line.split(':remotes/');
                
                var lname= ar[0];
                var rname = 'remotes/' + ar[1];
                //print(rname);
                // we should always have a local version of it.
                bmap[lname].remote = rname;
                if (typeof(bmap[rname]) == 'undefined') {
                    return;
                }
                bmap[lname].remoterev =  bmap[rname].lastrev;
                // flag it for not adding..
                
                bmap[rname].name = lname;
            });
            var _this =this;
            // add any remotes that do not have name..
            remotes.forEach(function(r) {
                if (r.name.length) {
                    return;
                }
                
                // create a tracking branch..
                var name = r.remote.replace(/^remotes\//, '' ).replace('/', '.');
                
                r.remoterev = r.lastrev;
                //r.name = name;
                local.push(r);
                return;
                
                _this.git([ 
                    'branch',
                    {
                        f : true,
                        track : true
                    },
                    name,
                    r.remote
                ]);
                
                r.remoterev = r.lastrev;
                r.name = name;
                local.push(r);
            });
            
            this.branches = local;
            
            
            
            return this.branches;
        },
        _remotes : false,
        
        remotes: function(cfg)
        {
            
            if (cfg) {
                this._remotes = false; // reset so we can query it..
                
                var url = Repo.parseURL(cfg.url);
                if ((url.scheme == 'http://' || url.scheme == 'https://' )
                    && url.user.length) {
                    // remove username - as it confuses netrc..
                    cfg.url = url.scheme + url.host + '/' +url.path;
                    
                }
                
                
                this.git([
                    'remote',
                    'add',
                    cfg.name,
                    cfg.url
                ]);
                this.branches = false;
                
                this.git([
                    'fetch',
                    cfg.name,
                    { 'a' : true }
                ]);
                
                
                
                //print(this.lastCmd);

            }
            
            
            if (this._remotes!== false) {
                return this._remotes;
            }
            this._remotes = [];
            
            var bl = this.git([ 'remote', {
            //    'no-color' : true,
                'verbose' : true
            }]).split("\n");
            
            var _this=this;
            bl.forEach(function(line) {
                if (!line.length) {
                    return;
                  // * master 61e7e7d oneliner
                }
               // print(JSON.stringify( line));
                var parts = line.split(/\t/);
                var type = false;
                parts[1] = parts[1].replace(/\([a-z]+\)$/, function( a) {
                    type = a.substr(1,a.length-2);
                    return '';
                });
                
                _this._remotes.push( {
                    name: parts[0],
                    url : parts[1],
                    type:  type
                });
                
            });
            return this._remotes;
        },
        
        
        
        lastupdated: function() {
            return 'tbc';
        },
        autocommit: function() {
            return true;
        },
        
        autopush: function() {
            return true;
        },
          /*
        
          public function getTags()
          {
            if ($this->tags !== null) {
              return $this->tags;
            }
            $this->tags = array();
            $fp = $this->git('tag');
            while ($line = fgets($fp)) {
              $line = trim($line);
              $this->tags[$line] = $line;
            }
            $fp = null;
            return $this->tags;
          }
        
          public function readdir($path, $object = null, $ident = null)
          {
            $res = array();
        
            if ($object === null) {
              $object = 'branch';
              $ident = 'master';
            }
            $rev = $this->resolveRevision(null, $object, $ident);
        
            if (strlen($path)) {
              $path = rtrim($path, '/') . '/';
            }
        
            $fp = $this->git('ls-tree', $rev, $path);
        
            $dirs = array();
            require_once 'MTrack/SCM/Git/File.php';
            while ($line = fgets($fp)) {
                // blob = file, tree = dir..
                list($mode, $type, $hash, $name) = preg_split("/\s+/", $line);
                //echo '<PRE>';echo $line ."\n</PRE>";
                $res[] = new MTrack_SCM_Git_File($this, "$name", $rev, $type == 'tree', $hash);
            }
            return $res;
          }
        
          public function file($path, $object = null, $ident = null)
          {
            if ($object == null) {
              $branches = $this->getBranches();
              if (isset($branches['master'])) {
                $object = 'branch';
                $ident = 'master';
              } else {
                // fresh/empty repo
                return null;
              }
            }
            $rev = $this->resolveRevision(null, $object, $ident);
            require_once 'MTrack/SCM/Git/File.php';
            return new MTrack_SCM_Git_File($this, $path, $rev);
          }
       */
        /**
         * 
         * @param  string path (can be empty - eg. '')
         * @param  {number|date} limit  how many to fetch
         * @param  {string} object = eg. rev|tag|branch  (use 'rev' here and ident=HASH to retrieve a speific revision
         * @param  {string} ident = 
         *
         * Example:
         *   - fetch on revision?:  '.',1,'rev','xxxxxxxxxx'
         *
         *
         * range... object ='rev' ident ='master..release'
         * 
         */
        history: function(path, limit , object, ident)
        {
            limit = limit || false;
            object = object || false;
            ident = ident || false; 
            var res = [];
            var args = [ 'log' ];
             
            
            if (object !== false) {
                rev = this.resolveRevision(false, object, ident); // from scm...
                args.push( '' + rev);  
            } else {
                args.push( "master" );
            }
           
            var arg = {
                "no-color" : true, 
            //args.push("--name-status";
                "raw" : true,
                 
                "numstat" : true,
                "date" : 'iso8601'
            };
            if (limit !== false) {
                if (typeof(limit) == 'number') {
                    arg['max-count'] =  limit;
                } else if (typeof(limit) == 'object') {
                    arg.skip=  limit[0];
                    arg['max-count']=  limit[1];
     
                } else {
                    arg.since = limit;
                }
            }
            
            args.push(arg);
            
            
            
       
            
            //echo '<PRE>';print_r($args);echo '</PRE>';
            path = path[0] == '/' ? path.substring(1) : path; 
            
            args.push({ '' : true });
            args.push(path);
            
            //   print_R(array($args, '--' ,$path));exit;
            var fp = this.git(args).split("\n");
    
            var commits = [];
            var commit = false;
            while (fp.length) {
                var line = fp.shift() + "\n";
                
                if (line.match(/^commit/)) {
                    if (commit !== false) {
                        commits.push( commit );
                    }
                    commit = line;
                    continue;
                }
                commit += line ;
            }
             
            if (commit !== false) {
                commits.push( commit );
            }
            var res = [];
            //print(JSON.stringify(commits,null,4));
            
            var _t = this;
            commits.forEach( function(c) {
              //       print(typeof(Event)); print(JSON.stringify(c));
                var ev = new Event( {commit : c, repo: _t });
                res.push(ev);
                  
            });
            // close 'fp'
            return res;
        },
        diff : function(path, from, to)
        {
            to = to || false;
            from = from || false;
            
             
            
            
            /*
            if ($path instanceof MTrackSCMFile) {
                if ($from === null) {
                    $from = $path->rev;
                }
                $path = $path->name;
                
            }
            // if it's a file event.. we are even lucker..
            if ($path instanceof MTrackSCMFileEvent) {
                return $this->git('log', '--max-count=1', '--format=format:', '--patch', $from, '--', $path->name);
                
            }
            */
            // diff ignoring white space..
            args = [ 'diff' , { 'w' : true} ]
        
            if (to == false) {
                to = from;
                from = from + '^';
            }
            
            args.push(from+'..'+to);
            args.push( { '' : true });
            if (typeof(path) != 'string') {
                path.forEach(function(p) { args.push(p); })
            }
            return this.git(args); 
        },
        
        
        
        dayTree: function (path, limit , object, ident)
        {
            
            var ar = this.history(path, limit , object, ident);
            
            // the point of this is to extract all the revisions, and group them.
            
            
            
            //echo '<PRE>';print_R($ar);
            
            // need to get a 2 dimensional array of
            // files along top, and commints down.
            var cfiles = []
            var rows = [];
            
            var days = {};
            
            ar.forEach(function( commit) {
                
                var files = commit.files;
                var day = commit.cday;
                if (typeof(days[day]) == 'undefined') { 
                    days[day] = {
                        'text' : day,
                        'rev' : day,
                        'children' : {}
                    }
                }
                var time= commit.ctime;
                if (typeof(days[day]['children'][time]) == 'undefined' ) { 
                    days[day]['children'][time] = {
                        'text' : time,
                        'rev' : day + ' ' + time,
                        'children' : [] 
                    };
                }
                days[day]['children'][time]['children'].push( {
                    'text' : commit.changelog,
                    'rev' : commit.rev,
                    'leaf' :  true
                });
            });
            var out = [];
            
            for(var d in days) {
                var dr = days[d];
                dcn = dr['children'];
                dr['children'] = [];
                for(var t in dcn) {
                    var to = dcn[t];
                    to['rev']  = to['children'][0]['rev'];
                    dr['children'].push( to);
                }
                dr['rev'] = dr['children'][0]['rev'];
                out.push( dr);
            }
            
            return out;            
             
            
        },
        
        
    
    
        changedFiles :function(path,  object, ident)
        {
             object = object || false;
            ident = ident || false; 
            var res = [];
            var args = [ 'diff', { 'numstat' : true}  , { 'w' : true } ];
             
            
            if (object !== false) {
                rev = this.resolveRevision(false, object, ident); // from scm...
                args.push( '' + rev);  
            } else {
                args.push( "master" );
            }
            path = path[0] == '/' ? path.substring(1) : path; 
            
            args.push({ '' : true });
            args.push(path);
              // in theory you could click a number of them and only merge those changes..
            // need to do a git diff.. and just get a list of files..
            var rows = [];
            var res = this.git(args).split("\n"); 
            res.forEach( function(line) {
                
                
                
                var ar = line.split("\t"); 
                if (ar.length !=3 ) {
                    return;
                }
                rows.push({ 
                    'added' : ar[0],
                    'removed' : ar[1],
                    'filename' : ar[2]
                });
                
                
            });
            return rows;  
    
        },
        
        
        
        
        
        
        
    merge : function(branch_from, branch_to, rev, files, use_merge)
    {
        
        var mi = this.history("/", 1, "rev", rev);
       // echo '<PRE>';print_R($mi);exit;
        
        // pause gitlive!!!!
        this.git([ 'checkout', { 'b': true }, to]);
        //$wd->git('checkout', '-b', $this->release, 'remotes/origin/'. $this->release);
        
        
        
        //$patchfile = $this->tempName('txt');
         
        
        if (files !== false) {
            
            
            
        }
        if (is_array($files)) { 
            
            var diff = this.diff(files, from, to);
             
             
               var sp = new Spawn({
                cwd : this.repopath,
                args : [ 'patch' , '-p1' ] ,
                env :  [  "HOME=" + GLib.get_home_dir() ],
                debug: false,
                exceptions : false,
                async : false,
                listeners : {
                    input : function() {
                        return diff;
                    }
                }
            });
            sp.run(); 
             
              ;  //eg . patch -p1 < /var/lib/php5/MTrackTMPgZFeAN.txt
        } else {
            // if no files -- it means all?/
            // although we should check to see if this is valid..
            this.git([' merge', { 'squash' : true }, rev ]);
       }
          
        //echo $cmd;
        /*
        $commit = (object) array(
            'when' =>  $mi[0]->ctime,
            'reason' => $_REQUEST['message'],
            'name'  => $this->authUser->name,
            'email' => $this->authUser->email,
        );
        
        $res = $wd->commit($commit);
        if (!is_array($files)) {
            // we do an actually merge commit seperatly from the merge diff, so that
            // our logs show a nice history in each of those commits.
            // not sure if this is a good idea or not..
            $wd->git('merge', '-m', "Merge Commit with working branch (no code changed)" , $rev);
        }
        
        
        $res .= $wd->push();
        $this->jok($res);
        
       // $wd->checkout($this->release);
        // generate the patch
        // apply the patch
        // commit with message..
        // push
        
        
        */
        
        
        
        
        
        
    },
        
        
        
        
    /*
        public function getWorkingCopy()
        {
            require_once 'MTrack/SCM/Git/WorkingCopy.php';
            return new MTrack_SCM_Git_WorkingCopy($this);
        }
    
      public function getRelatedChanges($revision) // pretty nasty.. could end up with 1000's of changes..
      {
        $parents = array();
        $kids = array();
    
        $fp = $this->git('rev-parse', "$revision^");
        while (($line = fgets($fp)) !== false) {
          $parents[] = trim($line);
        }
    
        // Ugh!: http://stackoverflow.com/questions/1761825/referencing-the-child-of-a-commit-in-git
        $fp = $this->git('rev-list', '--all', '--parents');
        while (($line = fgets($fp)) !== false) {
          $hashes = preg_split("/\s+/", $line);
          $kid = array_shift($hashes);
          if (in_array($revision, $hashes)) {
            $kids[] = $kid;
          }
        }
    
        return array($parents, $kids);
      } */
    
        
         
        
        git: function(args_in)
        {
            // convert arguments.
            
            //print(JSON.stringify(args_in,null,4));
            args_in.unshift( {
                'git-dir' : this.gitdir,
                'no-pager' : true 
            });
            var args = ['git' ];
            
            if (this.gitdir != this.repopath) {
                args_in.unshift( { "work-tree" :  this.gitdir } ); 
            }
            
            args_in.forEach(function(arg) { 
                 if (typeof(arg) == 'string') {
                    args.push(arg);
                    return;
                }
                if (typeof(arg) == 'object') {
                    for(var k in arg) {
                        var v = arg[k];
                        
                        args.push(k.length != 1 ? ('--' + k) : ('-' + k));
                        
                        if (v === true) {
                            continue;;
                        }
                        args.push(v);
                    }
                }
            });
            this.lastCmd = args.join(" ");
            if(this.debug) {
               
                print( args.join(" ")); 
            }
            
            var env =  [  "HOME=" + GLib.get_home_dir() ];
            // do not need to set gitpath..
            //if (File.exists(this.repo + '/.git/config')) {
                //env.push("GITPATH=" + this.repo );
            //}
            
            //print(JSON.stringify(args,null,4));  Seed.quit();
            var sp = new Spawn({
                cwd : this.repopath,
                args : args,
                env : env, // optional
                debug: this.debug,
                exceptions : false,
                async : false
            });
            sp.run();
            //print(JSON.stringify(sp,null,4));  Seed.quit();

            //print("GOT: " + output)
            // parse output for some commands ?
            return sp.output;
        }
  
   
});

Repo.parseURL = function(url)
{
    
    // git : git://github.com/roojs/roojs1.git
    // http https://roojs@github.com/roojs/roojs1.git
    // ssh  git@github.com:roojs/roojs1.git
    var ret = {
       scheme : 'ssh://'
    }
    url = url.replace(/^[a-z]+:\/\//, function(v) {
        ret.scheme = v;
        return '';
    });
    var parts = url.split(ret.scheme == 'ssh://' ? ':' : "/");
    var login_host  = parts.shift().split('@');
    var user_pass  = (login_host.length == 2 ? login_host.shift() : '').split(':');
    ret.user = user_pass[0];
    ret.pass = user_pass.length == 2 ? user_pass[1] : ''; 
    
    ret.host = login_host.shift();
    ret.path = parts.join('/');
    return ret;
    
    
}