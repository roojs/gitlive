
/**
 * @class Scm.Git.Repo
 *
 * @extends Scm.Repo
 * 
 *
 *
 */
public class GitRepo : Object
{
    
    public Array<GitMonitorQueue> cmds;


    public string gitdir;
    public bool debug = false;

    /**
    * index of.. matching gitpath..
    */
     public static int indexOfAdd( Array<GitRepo> repos, string gitpath) {
        for(var i =0; i < repos.length; i++) {
            if (repos.index(i).gitdir == gitpath) {
                return i;
            }
        }
        return -1;
    
    }



   
    /**
     * constructor:
     * 
     * @param {Object} cfg - Configuration
     *     (basically repopath is currently only critical one.)
     *
     */
     
    public GitRepo(string path) {
        // cal parent?
        
        this.gitdir = path + "/.git";
        if (!FileUtils.test(this.gitdir , FileTest.IS_DIR)) {
            this.gitdir = path; // naked...
        }
        this.cmds = new  Array<GitMonitorQueue> ();
        //Repo.superclass.constructor.call(this,cfg);
        
    } 
    /**
     * add:
     * add files to track.
     *
     * @argument {Array} files the files to add.
     */
    public string add ( Array<GitMonitorQueue> files )
    {
        // should really find out if these are untracked files each..
        // we run multiple versions to make sure that if one failes, it does not ignore the whole lot..
        // not sure if that is how git works.. but just be certian.
        for (var i = 0; i < files.length;i++) {
            var f = files.index(i).vname;
            try {
                string[] cmd = { "add",    f  };
                this.git( cmd );
            } catch (Error e) {
                ret += e.message  + "\n";
            }        

        }
    }
    
      /**
     * remove:
     * remove files to track.
     *
     * @argument {Array} files the files to add.
     */
    public string remove  ( Array<GitMonitorQueue> files )
    {
        // this may fail if files do not exist..
        // should really find out if these are untracked files each..
        // we run multiple versions to make sure that if one failes, it does not ignore the whole lot..
        // not sure if that is how git works.. but just be certian.
        var ret = "";

        for (var i = 0; i < files.length;i++) {
            var f = files.index(i).vname;
            try {
                string[] cmd = { "rm",  "-f" ,  f  };
                this.git( cmd );
            } catch (Error e) {
                ret += e.message  + "\n";
            }        
        }

        return ret;

    }
    
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
     
    public string commit ( string message, Array<GitMonitorQueue> files  )
    {
        

        /*
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
        */
        string[] args = { "commit", "-m", };
        arg +=  (message.length > 0  ? message : "Changed" );
        for (var i = 0; i< files.length ; i++ ) {
            args += files.index(i).vname; // full path?
        }
         
        return this.git(args);
    }
    
    /**
     * pull:
     * Fetch and merge remote repo changes into current branch..
     *
     * At present we just need this to update the current working branch..
     * -- maybe later it will have a few options and do more stuff..
     *
     */
    public string pull ()
    {
        // should probably hand error conditions better... 
        string[] cmd = { "pull" };
        return this.git( cmd );

        
        
    }
    /**
     * push:
     * Send local changes to remote repo(s)
     *
     * At present we just need this to push the current branch.
     * -- maybe later it will have a few options and do more stuff..
     *
     */
    public string push ()
    {
        // should 
        return this.git({ "push" });
        
    }
     /**
     * git:
     * The meaty part.. run spawn.. with git..
     *
     *
     */
    
    public string git(string[] args_in, string[] env = {}) throws Error, SpawnError
    {
        // convert arguments.
        

        string[]  args = { "git" };
        args +=  "--git-dir";
        args +=  this.gitdir;
        args +=  "--no-pager";


        //if (this.gitdir != this.repopath) {
        //    args +=   "--work-tree";
         //   args += this.repopath; 
        //}
        for (var i = 0; i < args_in.length;i++) {
            args += args_in[i];
        }            

        //this.lastCmd = args.join(" ");
        if(this.debug) {
         
            print(  string.joinv (", ", args)); 
        }
        
        env +=  "HOME=" + Environment.get_home_dir() ;
        // do not need to set gitpath..
        //if (File.exists(this.repo + '/.git/config')) {
            //env.push("GITPATH=" + this.repo );
        //}
        

        var cfg = new SpawnConfig(this.gitdir, args , env);
        

       // may throw error...
        var sp = new Spawn(cfg);
                
        //print("GOT: " + output)
        // parse output for some commands ?
        return sp.output;
    }

}
