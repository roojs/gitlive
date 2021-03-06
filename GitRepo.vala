
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

    public string name;
    public string gitdir;
    public string git_working_dir;
    public bool debug = false;

    /**
    * index of.. matching gitpath..
    */
    public static int indexOf( Array<GitRepo> repos, string gitpath) {
        // make a fake object to compare against..
        var test_repo = new GitRepo(gitpath);
        
        for(var i =0; i < repos.length; i++) {
            if (repos.index(i).gitdir == test_repo.gitdir) {
                return i;
            }
        }
        return -1;
    
    }
    
     
    
    public static   Array<GitRepo> list()
    {
        
        //if (GitRepo.list_cache !=  null) {
        //    unowned  Array<GitRepo>    ret = GitRepo.list_cache;
         //   return ret;
        //}
        
        var list_cache = new Array<GitRepo>();
        
        var dir = Environment.get_home_dir() + "/gitlive";
        
        var f = File.new_for_path(dir);
        FileEnumerator file_enum;
        try {
            file_enum = f.enumerate_children(
                FileAttribute.STANDARD_DISPLAY_NAME + ","+ 
                FileAttribute.STANDARD_TYPE,
                FileQueryInfoFlags.NONE,
                null);
        } catch (Error e) {
            
            return list_cache;
            
        }
         
        FileInfo next_file; 
        
        while (true) {
            
            try {
                next_file = file_enum.next_file(null);
                if (next_file == null) {
                    break;
                }
                
            } catch (Error e) {
                print(e.message);
                break;
            }
         
            //print("got a file " + next_file.sudo () + '?=' + Gio.FileType.DIRECTORY);
            
            if (next_file.get_file_type() !=  FileType.DIRECTORY) {
                next_file = null;
                continue;
            }
            
            if (next_file.get_file_type() ==  FileType.SYMBOLIC_LINK) {
                next_file = null;
                continue;
            }
            
            if (next_file.get_display_name()[0] == '.') {
                next_file = null;
                continue;
            }
            var sp = dir+"/"+next_file.get_display_name();
           
            var gitdir = dir + "/" + next_file.get_display_name() + "/.git";
            
            if (!FileUtils.test(gitdir, FileTest.IS_DIR)) {
                continue;
            }
            
             list_cache.append_val(new GitRepo(  sp )) ;
             
            
        }
    
        return list_cache;
        
         
          
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
        this.name =   File.new_for_path(path).get_basename();
        
        
        this.git_working_dir = path;
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
    public string add ( Array<GitMonitorQueue> files ) throws Error, SpawnError
    {
        // should really find out if these are untracked files each..
        // we run multiple versions to make sure that if one failes, it does not ignore the whole lot..
        // not sure if that is how git works.. but just be certian.
        var ret = "";
        for (var i = 0; i < files.length;i++) {
            var f = files.index(i).vname;
            try {
                string[] cmd = { "add",    f  };
                this.git( cmd );
            } catch (Error e) {
                ret += e.message  + "\n";
            }        

        }
        return ret;
    }
    
      /**
     * remove:
     * remove files to track.
     *
     * @argument {Array} files the files to add.
     */
    public string remove  ( Array<GitMonitorQueue> files ) throws Error, SpawnError
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
     
    public string commit ( string message, Array<GitMonitorQueue> files  ) throws Error, SpawnError
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
        string[] args = { "commit", "-m" };
        args +=  (message.length > 0  ? message : "Changed" );
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
    public string pull () throws Error, SpawnError
    {
        // should probably hand error conditions better... 
        string[] cmd = { "pull" , "--no-edit" };
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
    public string push () throws Error, SpawnError
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
    
    public string git(string[] args_in ) throws Error, SpawnError
    {
        // convert arguments.
        

        string[]  args = { "git" };
        //args +=  "--git-dir";
        //args +=  this.gitdir;
        args +=  "--no-pager";
 

        //if (this.gitdir != this.repopath) {
        //    args +=   "--work-tree";
         //   args += this.repopath; 
        //}
        for (var i = 0; i < args_in.length;i++) {
            args += args_in[i];
        }            

        //this.lastCmd = args.join(" ");
        //if(this.debug) {
            stdout.printf( "CWD=%s\n",  this.git_working_dir ); 
            print(  string.joinv (" ", args)); 
        //}

        string[]   env = {};
        string  home = "HOME=" + Environment.get_home_dir() ;
        env +=  home ;
        // do not need to set gitpath..
        //if (File.exists(this.repo + '/.git/config')) {
            //env.push("GITPATH=" + this.repo );
        //}
        


        var cfg = new SpawnConfig(this.git_working_dir , args , env);
        

       // may throw error...
        var sp = new Spawn(cfg);

        stdout.printf( "GOT: %s\n" , sp.output);
        // parse output for some commands ?
        return sp.output;
    }

}
