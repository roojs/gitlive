///<script type="text/javascript">

Gio      = imports.gi.Gio;
GLib      = imports.gi.GLib;

Spawn = imports.Spawn;
/**
 * @namespace Git
 * 
 * Class to handle git operations..???
 * 
 * usage:
 * 
 * Git = import.Git.Git;
 * 
 * var g = new Git({ repo: '/home/me/git'});
 * 
 * g.run('commit', { all : true , message : 'test' }, 'filename',) 
 * 
 *  
 */


/**
 * @class Git
 * @param repo {String} directory that the repo is in, either bare or not.
 * 
 * 
 */
//var prototypeInit = false;
function Git( repo) {
    
    if (!GLib.file_test(repo, GLib.FileTest.IS_DIR)) {
        throw "Repo does not exist";
    }
    this.repo = repo;
    /*
    if (!prototypeInit) {
        // proto type on set up yet..
        // we could list this to generate methods.. /usr/lib/git-core/
        var props = Gil.prototypeInit();
        for (var i in props) {
            this[i]= props[i];
        }
    }
    */
    
}
Git.prototype = {
    repo : ''
    run : function() {
        var args = [];
        
        for (var i=0;i< arguments.length;i++) {
            if (typeof(arguments[i]) == 'string') {
                args.push(arguments[i]);
                continue;
            }
            if (typeof(arguments[i]) == 'object') {
                for(var k in arguments[i]) {
                    var v = arguments[i][k];
                    args.push('--' + k);
                    args.push(v);
                }
            }
             
        }
        var out = Spawn.run({
            env : [ "GITPATH=" + this.repo ],
            cwd : this.repo
            args: args
        });
        
        
        // parse output..
        
        return out;
    }
}


   