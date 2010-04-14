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
 * g.
 */


/**
 * @class Git
 * @param cfg {Object} settings - see git manual for this..
 * 
 * 
 */
var prototypeInit = false;
function Git( repo) {
    if (!prototypeInit) {
        // proto type on set up yet..
        var props = Gil.prototypeInit();
        for (var i in props) {
            this[i]= props[i];
        }
    }
    
}
Git.prototype = {
    _run : function() {
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
        
        
    }
}


    /usr/lib/git-core/