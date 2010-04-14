///<script type="text/javascript">
/**
* Spawn
* 
* Library to wrap GLib.spawn_async_with_pipes
* 
* usage:
* 
* Spawn = import.Spawn;
* 
* simple version..
* var output = Spawn.run({
*   cwd : '/home',
*   args : [ 'ls', '-l' ],
*   env : [], // optional
*   listeners : {
        output : function (line) { },
*       stderr :  function (line) { },
*       input : function() { return 'xxx' },
*   }
*  });
* 
* 
*/

Gio      = imports.gi.Gio;
GLib      = imports.gi.GLib;

/**
 * @class Spawn
 * @arg async {Boolean} return instantly, or wait for exit. (default no)
 * @arg exceptions {Boolean} throw exception on failure (default no)
 * @arg cwd {String} working directory. (defaults to home directory)
 * @arg args {Array} arguments eg. [ 'ls', '-l' ]
 * @arg listeners {Object} handlers for output, stderr, input
 *     stderr/output both receive output line as argument
 *     input should return any standard input
 * 
 * 
 */
function Spawn(cfg) {
    for(var i in cfg) {
        this[i] = cfg[i];
    }
    // set defaults?
    this.listeners = this.listeners || {};
    this.cwd =  this.cwd || GLib.get_home_dir();
    if (!this.args || !this.args.length) {
        throw "No arguments";
    }
    
}
Spawn.prototype = {
    
    listeners : false,
    async : false,
    cwd: false,
    args: false,
    exceptions : false,
    /**
     * @property output {String} resulting output
     */
    output  : '',
    /**
     * @property stderr {String} resulting output from stderr
     */
    stderr  : '',
     /**
     * @property result {Number} execution result.
     */
    result: 0
    /**
     * @property pid {Number} pid of chlid prociss
     */
    pid : 0,
    
    /**
     * @property done {Boolean} has the process completed.
     */
    done : false,
    
    
    
    
    run : function()
    {
        var ret = {};
        GLib.spawn_async_with_pipes(this.cwd, this.args, null, 
            GLib.SpawnFlags.DO_NOT_REAP_CHILD + GLib.SpawnFlags.SEARCH_PATH , 
            null, null, ret);
            
        this.pid = ret.child_pid;
        
        var ctx = GLib.main_loop_new (null, false);
        var started = false;
        var _this = this;
        
        GLib.child_watch_add(GLib.PRIORITY_DEFAULT, this.pid, function(pid, result) {
            _this.result = result;
            _this.done = true;
            
            GLib.spawn_close_pid(_this.pid);
            if (started) {
                GLib.main_loop_quit(ctx);
            }
            
        });
        this.in_ch = GLib.io_channel_unix_new(ret.standard_input);
        var out_ch = GLib.io_channel_unix_new(ret.standard_output);
        var err_ch = GLib.io_channel_unix_new(ret.standard_error);
       
        // make everything non-blocking!
        GLib.io_channel_set_flags (this.in_ch,GLib.IOFlags.NONBLOCK);
        GLib.io_channel_set_flags (out_ch,GLib.IOFlags.NONBLOCK);
        GLib.io_channel_set_flags (err_ch,GLib.IOFlags.NONBLOCK);

        function readstr(ch, prop) {
            while (true) {
                var x = new GLib.String();
                var status = GLib.io_channel_read_line_string (ch, x);
                switch(status) {
                    case GLib.IOStatus.NORMAL:
                        //write(fn, x.str);
                        if (this.listeners[prop]) {
                            this.listeners[prop].call(this, x.str);
                        }
                        _this[prop] += x.str;
                       continue;
                    case GLib.IOStatus.AGAIN:   
                        break;
                    case GLib.IOStatus.ERROR:    
                    case GLib.IOStatus.EOF:   
                       break;
                    
                }
                break;
            }
        }
        
        var out_src= GLib.io_add_watch(out_ch, GLib.PRIORITY_DEFAULT, 
            GLib.IOCondition.OUT + GLib.IOCondition.IN  + GLib.IOCondition.PRI, function()
        {
            readstr(out_ch,  'output');
            
        });
        var err_src= GLib.io_add_watch(err_ch, GLib.PRIORITY_DEFAULT, 
            GLib.IOCondition.ERR + GLib.IOCondition.IN + GLib.IOCondition.PRI + GLib.IOCondition.OUT, 
            function()
        {
             readstr(err_ch, 'stderr');
             
        });
        if (!this.done) {
            // child can exit before we get this far..
            if (this.listeners.input) {
                this.write(this.listeners.input.call(this));
            }
            started = true;
            GLib.main_loop_run(ctx, false); // wait fore exit?
        }
        // read any resulting data.
        readstr(out_ch,  'output');
        readstr(err_ch,  'error');
        
        // clean up.
        
        
        GLib.io_channel_close(this.in_ch);
        this.in_ch = false;
        GLib.io_channel_close(out_ch);
        GLib.io_channel_close(err_ch);
        GLib.source_remove(err_src);
        GLib.source_remove(out_src);
        if (this.exceptions && this.result != 0) {
            throw this.stderr;
        }
        return this;
    
    },
    /**
     * write to stdin of process
     * @returns GLib.IOStatus (0 == error, 1= NORMAL)
     * 
     */
    
    write : function(str) // write a line to 
    {
        if (!this.in_ch) {
            return; // input is closed
        }
        return GLib.io_channel_write_chars(this.in_ch, str, str.length, ret);
        
    }
    
}

     