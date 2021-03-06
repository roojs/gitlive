
/**
 * @class Scm.Git.Repo
 *
 * @extends Scm.Repo
 * 
 *
 *
 */
class GitRepo : Object
{
    


    /**
    * index of.. matching gitpath..
    */
     public static int indexOfAdd( Array<GitRepo> repos, string gitpath) {
            for(var i =0; i < repos.length; i++) {
                if (reos.index(i).gitpath == add) {
                    return i;
                }
            }
            return -1;
        }
    }



     Array<GitMontitorQueue> cmds;


     public string gitdir;
    /**
     * constructor:
     * 
     * @param {Object} cfg - Configuration
     *     (basically repopath is currently only critical one.)
     *
     */
     
    public GitRepo(path) {
        // cal parent?
        
        this.gitdir = path + "/.git";
        if (!GLib.file_test(this.gitdir , GLib.FileTest.IS_DIR)) {
            this.gitdir = path; // naked...
        }
        this.cmds = new  Array<GitMontitorQueue> ();
        //Repo.superclass.constructor.call(this,cfg);
        
    } 
    /**
     * add:
     * add files to track.
     *
     * @argument {Array} files the files to add.
     */
    public string add ( Array<GitMontitorQueue> files )
    {
        // should really find out if these are untracked files each..
        // we run multiple versions to make sure that if one failes, it does not ignore the whole lot..
        // not sure if that is how git works.. but just be certian.
        for (var i = 0; i < files.length;i++) {
            var f = files.item(i);
            
            if (!GLib.FileUtils.test(this.repopath +"/" + f, GLib.FileTest.EXISTS)) {
                continue;
            }
            printf("Checked %s - exists\n", this.repopath +"/" + f);
            try {
                this.git( { "add",   f });
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
    public string remove : function ( Array<GitMontitorQueue> files )
    {
        // this may fail if files do not exist..
        // should really find out if these are untracked files each..
        // we run multiple versions to make sure that if one failes, it does not ignore the whole lot..
        // not sure if that is how git works.. but just be certian.
        var ret = "";

        for (var i = 0; i < files.length;i++) {
            var f = files.item(i);
            try {
                this.git( { "rm",  "-f" ,  f });
            } catch (Error e) {
                ret += e.message  + "\n";
            }        
        }

        return ret;

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
     
    public string commit ( string message, Array<GitMontitorQueue> files  )
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
        var args = { "commit", "-m", message.length ? message : "Changed" }
        for (var i = i< files.length ; i++ ) {
            args += files.items(i).path; // full path?
        }
         
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
        return this.git({ "pull" });
        
        
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
        return this.git({ "push" });
        
    },
     /**
     * git:
     * The meaty part.. run spawn.. with git..
     *
     *
     */
    
    git: function(string[] args_in, string[] env = {})
    {
        // convert arguments.
        

        var args = {
           "git", 
            "--git-dir", this.gitdir,
            "--no-pager",
        }; 


        if (this.gitdir != this.repopath) {
            args +=   "--work-tree"
            args += this.repopath; 
        }
        for (var i = i; i < args_in.length;i++) {
            args += args_in[i];
        }            

        //this.lastCmd = args.join(" ");
        if(this.debug) {
         
            print(  string.joinv (", ", args_list);); 
        }
        
        env +=  ("HOME=" + GLib.get_home_dir() );
        // do not need to set gitpath..
        //if (File.exists(this.repo + '/.git/config')) {
            //env.push("GITPATH=" + this.repo );
        //}
        

        var cfg = new SpawnConfig(this.repopath, args , env);
        

       // may throw error...
        var sp = new Spawn(cfg);
                
        //print("GOT: " + output)
        // parse output for some commands ?
        return sp.output;
    }

}
