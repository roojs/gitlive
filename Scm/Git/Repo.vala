
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
            this.git( { "add",   f });
        }
    }
    
      /**
     * remove:
     * remove files to track.
     *
     * @argument {Array} files the files to add.
     */
    public string remove : function ( files )
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
    
