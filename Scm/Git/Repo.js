
const GLib   = imports.gi.GLib;

const XObject = imports.XObject.XObject;
const Event  = imports.Scm.Git.Event.Event;
const Spawn  = imports.Spawn.Spawn;


Repo = XObject.define(
    function(cfg) {
        // cal parent?
        XObject.extend(this,cfg);
        this.gitdir = cfg.repopath;
        if (File.isDirectory(cfg.repodir + '/.git')) {
            this.gitdir += "/.git";
        }
        Repo.superclass.constructor.call(this,cfg);
        
    },
    imports.Scm.Repo.Repo, // or Object
    {
        branches : false,
        tags : false,
        gitdir : false,
        debug : false,
        
        getMetaData : function() {
            return {
              name :  'Git',
              tool : ['git' ]  
                
            };
        },
                /* LATER...
                getBranches: function() {
                      if ($this->branches !== null) {
                      
            if ($this->branches !== null) {
                 return $this->branches;
            }
            $this->branches = array();
            $fp = $this->git('branch', '--no-color', '--verbose');
            while ($line = fgets($fp)) {
              // * master 61e7e7d oneliner
              $line = substr($line, 2);
              list($branch, $rev) = preg_split('/\s+/', $line);
              $this->branches[$branch] = $rev;
            }
            $fp = null;
            return $this->branches;
          }
        
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
            var res = [], args = [];
            
            if (object !== false) {
                rev = this.resolveRevision(null, object, ident); // from scm...
                args.push( '' + rev);  
            } else {
                args.push( "master" );
            }
           
        
            if (limit !== false) {
                if (typeof(limit) == 'number') {
                    args.push('--max-count=' + limit);
                } else if (typeof(limit) == 'object') {
                    args.push('--skip=' + limit[0]);
                    args.push('--max-count=' + limit[1]);
     
                } else {
                    args.push('--since=' + limit);
                }
            }
            
            args.push("--no-color");
            //args.push("--name-status";
            args.push("--raw");
            args.push("--no-abbrev");
            args.push("--numstat");
            args.push("--date=rfc");
            
            
            
       
            
            //echo '<PRE>';print_r($args);echo '</PRE>';
            path = path[0] == '/' ? path.substring(1) : path; 
            
            
            //   print_R(array($args, '--' ,$path));exit;
            var fp = this.git('log', args, '--', path).split("\n");
    
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
                     
            commits.forEach(commits, function(commit) {
                res.push(Event.newFromCommit(commit,this));
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
            
            
            if ($to !== null) {
              return $this->git('diff', "$from..$to", '--', $path);
            }
            return $this->git('diff', "$from^..$from", '--', $path);
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
    
        
         
        
        git: function()
        {
            // convert arguments.
            
            var args_in = Array.prototype.splice.call(arguments);
             
            args_in.shift( {
                'git-dir' : this.gitdir,
                'no-pager' : true 
            });
            var args = ['git' ];
            
            if (this.gitdir != this.repopath) {
                args_in.push( { "work-tree" :  this.repopath } ); 
            }
            args_in.forEach(function(arg) { 
                 if (typeof(arg) == 'string') {
                    args.push(arg);
                    continue;
                }
                if (typeof(arg) == 'object') {
                    for(var k in arg) {
                        var v = arg[k];
                        
                        args.push(k.length > 1 ? ('--' + k) : ('-' + k));
                        
                        if (v === true) {
                            continue;
                        }
                        args.push(v);
                    }
                }
            })
            if(this.debug) {
                print( args.join(" ")); 
            }
            
            var env =  [  "HOME=" + GLib.get_home_dir() ];
            // do not need to set gitpath..
            //if (File.exists(this.repo + '/.git/config')) {
                //env.push("GITPATH=" + this.repo );
            //}
            
            
            var sp = new Spawn({
                cwd : this.repopath,
                args : args,
                env : env, // optional
                debug: true,
                exceptions : false,
                async : false
            });
            var out = sp.run();
            // parse output for some commands ?
            return out;
        }
  
   
});

