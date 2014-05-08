
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
     
    function(path) {
        // cal parent?
        
        this.gitdir = path + "/.git";
        if (!GLib.file_test(this.gitdir , GLib.FileTest.IS_DIR)) {
            this.gitdir = path; // naked...
        }
        //Repo.superclass.constructor.call(this,cfg);
        
    },
