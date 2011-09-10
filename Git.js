///<script type="text/javascript">

const Gio      = imports.gi.Gio;
const GLib      = imports.gi.GLib;

const Spawn = imports.Spawn.Spawn;
const File    = imports.File.File;
 /**
 * @namespace Git
 * 
 * Class to handle git operations..???
 * 
 * usage:
 * 
 * Git = import.Git.Git;
 * 
 * var g = new Git(  '/home/me/git' );
 * 
 * g.run('commit', { all : true , message : 'test' }, 'filename',) 
 * 
 * or 
 * print(Git.run('/home/me/git', 'log'))
 * 
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
function Git( repo ) {
    
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
    async : false,
    
    repo : '',
    /**
     * @method run
     * @arg command {String} command to run
     * @arg arguments.... {String|Object}  arguments to send to command
     * { xxxx : yyyy} -> --xxxx YYYYY
     * { x : yyyy} -> -x  yyyy
     * 
     */
    run : function() {
        //print("GIT RUN");
        var args = ['git'];
        
        
        for (var i=0;i< arguments.length;i++) {
            if (typeof(arguments[i]) == 'string') {
                args.push(arguments[i]);
                continue;
            }
            if (typeof(arguments[i]) == 'object') {
                for(var k in arguments[i]) {
                    var v = arguments[i][k];
                    
                    args.push(k.length > 1 ? ('--' + k) : ('-' + k));
                    
                    if (v === true) {
                        continue;
                    }
                    args.push(v);
                }
            }
             
        }
        var env =  [  "HOME=" + GLib.get_home_dir() ];
        
        if (File.exists(this.repo + '/.git/config')) {
            env.push("GITPATH=" + this.repo );
        }
        
        
        //print(args.join( ' '));
        var sp = new Spawn({
            //env : [ "GITPATH=" + this.repo , "HOME=" + GLib.get_home_dir() ],
            env : env,
            cwd : this.repo,
            args: args,
            debug: true,
            exceptions : false,
            async : this.async,
        });
        var out = sp.run();
        // parse output for some commands ?
        return out;
    }
}


/**
 * @function run
 * @arg command {String} command to run
 * @arg arguments.... {String|Object}  arguments to send to command
 * 
 * 
 */

function run() {
  //  print("Git.run()");
    var args = Array.prototype.slice.call(arguments);
    //print(JSON.stringify(args));
    var repo = args.shift(args);
    var x = new Git(repo);
   // print(JSON.stringify(args));
    return x.run.apply(x, args);
    
}

// test.

//print(run('/home/alan/gitlive/gitlive', 'log'));
 
