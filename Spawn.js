///<script type="text/javascript">

Gio      = imports.gi.Gio;
GLib      = imports.gi.GLib;


/**
* @namespace Spawn
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
        output : function (line) { Seed.print(line); },
*       stderr :  function (line) {Seed.print("ERROR" + line);  },
*       input : function() { return 'xxx' },
*   }
*  });
* 
* 
*/


/**
 * @class Spawn
 * @param cfg {Object} settings - see properties.
 * 
 * @arg cwd {String}            working directory. (defaults to home directory)
 * @arg args {Array}            arguments eg. [ 'ls', '-l' ]
 * @arg listeners {Object} (optional) handlers for output, stderr, input
 *     stderr/output both receive output line as argument
 *     input should return any standard input
 *     finish recieves result as argument.
 * @arg env {Array}             enviroment eg. [ 'GITDIR=/home/test' ]
 * @arg async {Boolean} (optional)return instantly, or wait for exit. (default no)
 * @arg exceptions {Boolean}    throw exception on failure (default no)
 * @arg debug {Boolean}    print out what's going on.. (default no)
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
    env : null,
    cwd: false,
    args: false,
    exceptions : false,
    debug : false,
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
    result: 0,
    /**
     * @property pid {Number} pid of child process (of false if it's not running)
     */
    pid : false,
    
   
    
    /**
     * @property in_ch {GLib.IOChannel} input io channel
     */
    in_ch : false,
    /**
     * @property out_ch {GLib.IOChannel} output io channel
     */
    out_ch : false,
    /**
     * @property err_ch {GLib.IOChannel} stderr io channel
     */
    err_ch : false,
    
    /**
     * 
     * @method run
     * Run the configured command.
     * 
     */
    
    
    run : function()
    {
        
        var _this = this;
        
        var err_src = false;
        var out_src = false;
        var ctx = false; 
        var ret = {};
        
        if (this.debug) {
            print("spawn : " + this.args.join(" "));
        }
        
        GLib.spawn_async_with_pipes(this.cwd, this.args, this.env, 
            GLib.SpawnFlags.DO_NOT_REAP_CHILD + GLib.SpawnFlags.SEARCH_PATH , 
            null, null, ret);
            
        this.pid = ret.child_pid;
        
        if (this.debug) {
            print("PID: " + this.pid);
        }
        function tidyup()
        {
            if (_this.pid) {
                GLib.spawn_close_pid(_this.pid); // hopefully kills it..
                _this.pid = false;
            }
            if (_this.in_ch)  GLib.io_channel_close(_this.in_ch);
            if (_this.out_ch)  GLib.io_channel_close(_this.out_ch);
            if (_this.err_ch)  GLib.io_channel_close(_this.err_ch);
            // blank out channels
            _this.in_ch = false;
            _this.err_ch = false;
            _this.out_ch = false;
            // rmeove listeners !! important otherwise we kill the CPU
            if (err_src !== false) GLib.source_remove(err_src);
            if (out_src !== false) GLib.source_remove(out_src);
            err_src = false;
            out_src = false;
            
        }
        
        
        
        GLib.child_watch_add(GLib.PRIORITY_DEFAULT, this.pid, function(pid, result) {
            _this.result = result;
            if (_this.debug) {
                print("result: " + result);
            }
            _this.read(_this.out_ch);
            _this.read(_this.err_ch);
            
            GLib.spawn_close_pid(_this.pid);
            _this.pid = false;
            if (ctx) {
                GLib.main_loop_quit(ctx);
            }
            tidyup();
            if (_this.listeners.finish) {
                _this.listeners.finish.call(this, _this.result);
            }
        });
        
        
        this.in_ch = GLib.io_channel_unix_new(ret.standard_input);
        this.out_ch = GLib.io_channel_unix_new(ret.standard_output);
        this.err_ch = GLib.io_channel_unix_new(ret.standard_error);
       
        // make everything non-blocking!
        GLib.io_channel_set_flags (this.in_ch,GLib.IOFlags.NONBLOCK);
        GLib.io_channel_set_flags (this.out_ch,GLib.IOFlags.NONBLOCK);
        GLib.io_channel_set_flags (this.err_ch,GLib.IOFlags.NONBLOCK);

      
        // add handlers for output and stderr.
        out_src= GLib.io_add_watch(this.out_ch, GLib.PRIORITY_DEFAULT, 
            GLib.IOCondition.OUT + GLib.IOCondition.IN  + GLib.IOCondition.PRI, function()
        {
            _this.read(_this.out_ch);
            
        });
        err_src= GLib.io_add_watch(this.err_ch, GLib.PRIORITY_DEFAULT, 
            GLib.IOCondition.ERR + GLib.IOCondition.IN + GLib.IOCondition.PRI + GLib.IOCondition.OUT, 
            function()
        {
            _this.read(_this.err_ch);
             
        });
        
      
        
        // call input.. 
        if (this.pid !== false) {
            // child can exit before we get this far..
            if (this.listeners.input) {
                try {
                    this.write(this.listeners.input.call(this));
                } catch (e) {
                    tidyup();
                    throw e;
                    
                }
                
            }
        }
        // start mainloop if not async..
        if (!this.async) {
            if (this.pid !== false) {
                if (this.debug) {
                    print("starting main loop");
                }
                ctx = GLib.main_loop_new (null, false);
                GLib.main_loop_run(ctx, false); // wait fore exit?
                
            } else {
                tidyup(); // tidyup get's called in main loop. 
            }
            
            if (this.exceptions && this.result != 0) {
                throw this; // we throw self...
            }
        }
         
        
        // finally throw, or return self..
        
        return this;
    
    },
    /**
     * write to stdin of process
     * @arg str {String} string to write to stdin of process
     * @returns GLib.IOStatus (0 == error, 1= NORMAL)
     */
    write : function(str) // write a line to 
    {
        if (!this.in_ch) {
            return; // input is closed
        }
        var ret = {};
        var res = GLib.io_channel_write_chars(this.in_ch, str, str.length);
        if (res != GLib.IOStatus.NORMAL) {
            throw "Write failed";
        }
        return ret.bytes_written;
        
    },
    /**
     * read from pipe and call appropriate listerner and add to output or stderr string.
     * @arg giochannel to read from.
     * @returns none
     */
    read: function(ch) 
    {
        var prop = ch == this.out_ch ? 'output' : 'stderr';
        var _this = this;
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
                    if (_this.debug) {
                        print(prop + ':' + x.str);
                    }
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
    
};
/**
 * @function run 
 * 
 * simple run a process - returns result, or throws stderr result...
 * @param cfg {Object}  see spawn
 */
function run(cfg) {
    cfg.exceptions = true;
    cfg.async = false;
    var s = new Spawn(cfg);
    var ret = s.run();
    return ret.output;
}

// test


Seed.print(run({
    args: ['ls', '/tmp'],
    //debug : true
}));

     