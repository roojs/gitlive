
const GLib   = imports.gi.GLib;

const XObject = imports.XObject.XObject;
const Event  = imports.Scm.Git.Event.Event;
const Spawn  = imports.Spawn.Spawn;
const File  = imports.File.File;

/**
 * @class Scm.Git.Repo
 *
 * @extends Scm.Repo
 * 
 *
 *
 */
Repo = XObject.define(
    /**
     * constructor:
     * 
     * @param {Object} cfg - Configuration
     *     (basically repopath is currently only critical one.)
     *
     */
    
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
        debug : true,
        lastCmd : false,
        hasLocalChanges : false,
        
        getMetaData : function() {
            return {
              name :  'Git',
              tool : ['git' ]  
                
            };
        },
        
        
        getStatus : function()
        {
            //git status --porcelain
            // find out if we are up-to-date.
            //git ls-remote origin -h refs/heads/master
            var bl = this.git([ 'status', {
                'porcelain' : true
            }]).split("\n");
            
            this.hasLocalChanges = bl.length > 0; 
            
            
            
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
                    _this.currentBranch = br;
                }
            });
            
            //print(JSON.stringify(local));
            //print(JSON.stringify(remotes));
            //print(JSON.stringify(bmap,null,4));

            
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
                var name = r.remote.replace(/^remotes\//, '' ).replace(/^origin\//,'').replace('/', '.');
                
                 
              
                if (typeof(bmap[name]) != 'undefined') {
                    // already got aremote of that name.
                    // skip it...
                    r.remoterev = r.lastrev;
                    r.lastrev = '';
                    local.push(r);
                    return;
                }
                
                
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
         //    print(JSON.stringify(local,null,4));
            
            
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
         * history:
         * Get the log/history about repo or specific file(s)
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
            
            
            
            args.push({ '' : true });
            if (typeof(path) == 'string') {
                path = path[0] == '/' ? path.substring(1) : path;
                args.push(path);
            } else {
                path.forEach(function(p) {
                     args.push(p);
                })
            }
            
            
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
        
        
        checkout : function(branch)
        {
            this.git(['checkout', branch ]);
        },
        /**
         * stash:
         * Very basic stash the current changes (normally so you can checkout
         * another branch..)
         */
        stash: function()
        {
            this.git(['stash' ]);
        },
        
        
            
        applyPatch : function( diff )
        {
            var sp = new Spawn({
                cwd : this.repopath,
                args : [ 'patch' , '-p1' , '-f' ] ,
                env :  [  "HOME=" + GLib.get_home_dir() ],
                debug: true,
                exceptions : false,
                async : false,
                listeners : {
                    input : function() {
                        print("sedning patch!");
                        return diff;
                    }
                }
            });
            sp.run();
            return sp.output;
        } ,
        /**
         * add:
         * add files to track.
         *
         * @argument {Array} files the files to add.
         */
        add : function ( files )
        {
            // should really find out if these are untracked files each..
            // we run multiple versions to make sure that if one failes, it does not ignore the whole lot..
            // not sure if that is how git works.. but just be certian.
            var _t = this;
            files.forEach(function(f) {
                try { 
                    _t.git([ 'add', { '': true }, f ]);
                } catch(e) {} // ignore errors..
            });  
        },
        
          /**
         * remove:
         * remove files to track.
         *
         * @argument {Array} files the files to add.
         */
        remove : function ( files )
        {
            // this may fail if files do not exist..
            // should really find out if these are untracked files each..
            // we run multiple versions to make sure that if one failes, it does not ignore the whole lot..
            // not sure if that is how git works.. but just be certian.
            var _t = this;
            files.forEach(function(f) {
                try {
                    _t.git([ 'rm', { f: true } , { '': true }, f ]);
                } catch(e) {} // ignore errors..
            });  
        },
        
        /**
         * commit:
         * perform a commit.
         *
         * @argument {Object} cfg commit configuration
         * 
         * @property {String} name (optional)
         * @property {String} email (optional)
         * @property {String} changed (date) (optional)
         * @property {String} reason (optional)
         * @property {Array} files - the files that have changed. 
         * 
         */
         
        commit : function( cfg )
        {
            
            var args= [  'commit'  ];
            var env = [];
            
            if (typeof(cfg.name) != 'undefined') {
                args.push( {
                    'author' : cfg.name + ' <' + cfg.email + '>'
                });
                env.push(
                    "GIT_COMMITTER_NAME" + cfg.name,
                    "GIT_COMMITTER_EMAIL" + cfg.email
                );
            }
            if (typeof(cfg.changed) != 'undefined') {
                env.push("GIT_AUTHOR_DATE= " + cfg.changed )
                
            }
            args.push( 
                { 'm' : (cfg.reason ? cfg.reason : 'Changed') },
                { '': true }
            );
            
            cfg.files.forEach(function(f) { args.push(f); })
             
            return this.git(args, env);
        },
        
        /**
         * pull:
         * Fetch and merge remote repo changes into current branch..
         *
         * At present we just need this to update the current working branch..
         * -- maybe later it will have a few options and do more stuff..
         *
         */
        pull : function ()
        {
            // should probably hand error conditions better... 
            return this.git([ 'pull' ]);
            
            
        },
        /**
         * push:
         * Send local changes to remote repo(s)
         *
         * At present we just need this to push the current branch.
         * -- maybe later it will have a few options and do more stuff..
         *
         */
        push : function ()
        {
            // should 
            return this.git([ 'push' ]);
            
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
    
        
         
        
        git: function(args_in,env)
        {
            // convert arguments.
            
            //print(JSON.stringify(args_in,null,4));
            args_in.unshift( {
                'git-dir' : this.gitdir,
                'no-pager' : true 
            });
            var args = ['git' ];
            
            if (this.gitdir != this.repopath) {
                args_in.unshift( { "work-tree" :  this.repopath } ); 
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
            env = env || [];
            env.push(  "HOME=" + GLib.get_home_dir() );
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
            
            if (sp.result) {
                print(JSON.stringify(sp.result));
                
                print(JSON.stringify(sp.args));
                print(JSON.stringify(sp.stderr));
                
                throw {
                    name    : "RepoSpawnError",
                    message : sp.stderr,
                    spawn   : sp
                };                
            }
             
            //print("GOT: " + output)
            // parse output for some commands ?
            return sp.output;
        },
        /**
         * parseAuthor:
         * break author string with name and email into parts
         * @argument {String} author
         * @returns {Object} with 'name' and 'email' properties.
         */ 
        parseAuthor : function(author)
        {
            var lp = author.indexOf('<');
             
            return {
                name : author.substring(0, lp-1).replace(/\s+$/,''),
                email : author.substring(0, author.length-1).substring(lp+1)
            };
            
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