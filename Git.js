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
 * g.commit({ all : true , message : 'test' }) 
 * 
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
    _run(
}


    /usr/lib/git-core/