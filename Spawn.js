///<script type="text/javascript">

var Gio      = imports.gi.Gio;
var GLib      = imports.gi.GLib;


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
*
*  CRITICAL - needs this change to gir in GLib-2.0.gir g_spawn_async_with_pipes
*
    <parameter name="argv" transfer-ownership="none">
         <array c:type="gchar**">
            <type name="utf8"/>
          </array>
        </parameter>
        <parameter name="envp" transfer-ownership="none" allow-none="1">
          <array c:type="gchar**">
            <type name="utf8"/>
          </array>
        </parameter>
*
*
*<method name="read_line"
              c:identifier="g_io_channel_read_line"
              throws="1">
        <return-value transfer-ownership="none">
          <type name="IOStatus" c:type="GIOStatus"/>
        </return-value>
        <parameters>
          <parameter name="str_return" transfer-ownership="full" direction="out">
            <type name="utf8" c:type="gchar**"/>
          </parameter>
          <parameter name="length" transfer-ownership="none" direction="out">
            <type name="gsize" c:type="gsize*"/>
          </parameter>
          <parameter name="terminator_pos" transfer-ownership="none"  direction="out">
            <type name="gsize" c:type="gsize*"/>
          </parameter>
        </parameters>
      </method>
*
*
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
    debug : true,
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
	    print("cd " + this.cwd +";" + this.args.join(" "));
        }
        
        GLib.spawn_async_with_pipes(this.cwd, this.args, this.env, 
            GLib.SpawnFlags.DO_NOT_REAP_CHILD + GLib.SpawnFlags.SEARCH_PATH , 
            null, null, ret);
            
	print(JSON.stringify(ret));    
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
            if (_this.in_ch)  _this.in_ch.close();
            if (_this.out_ch)  _this.out_ch.close();
            if (_this.err_ch)  _this.err_ch.close();
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
        
        
        this.in_ch = GLib.io_channel_unix_new(ret.standard_input);
        this.out_ch = GLib.io_channel_unix_new(ret.standard_output);
        this.err_ch = GLib.io_channel_unix_new(ret.standard_error);
        
        // make everything non-blocking!
        this.in_ch.set_flags (GLib.IOFlags.NONBLOCK);
        this.out_ch.set_flags (GLib.IOFlags.NONBLOCK);
        this.err_ch.set_flags (GLib.IOFlags.NONBLOCK);
        
        
        GLib.child_watch_add(GLib.PRIORITY_DEFAULT, this.pid, function(pid, result) {
            _this.result = result;
            if (_this.debug) {
                print("child_watch_add : result: " + result);
            }
            _this.read(_this.out_ch);
            _this.read(_this.err_ch);
            
            GLib.spawn_close_pid(_this.pid);
            _this.pid = false;
            if (ctx) {
                ctx.quit();
            }
            tidyup();
            if (_this.listeners.finish) {
                _this.listeners.finish.call(this, _this.result);
            }
        });
        
        
       

      
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
        // async - if running - return..
        if (this.async && this.pid) {
            return this;
        }
        
        
        // start mainloop if not async..
        
        if (this.pid !== false) {
            if (this.debug) {
                print("starting main loop");
            }
	    
            ctx = new GLib.MainLoop.c_new (null, false);
            ctx.run(false); // wait fore exit?
            
        } else {
            tidyup(); // tidyup get's called in main loop. 
        }
        
        if (this.exceptions && this.result != 0) {
            this.toString = function() { return this.stderr; };
            throw this; // we throw self...
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
            return 0; // input is closed
        }
        var ret = {};
        var res = this.in_ch.write_chars(str, str.length);
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
	print("prop: " + prop);
        var _this = this;
        
        //print(JSON.stringify(ch, null,4));
        while (true) {
            var x = {};
            var status = ch.read_line(x);
	    //print("READ LINE STRING STATUS: " + status);
             //print("got: " + JSON.stringify(x, null,4));

            switch(status) {
                case GLib.IOStatus.NORMAL:
		
                    //write(fn, x.str);
                    if (this.listeners[prop]) {
                        this.listeners[prop].call(this, x.str_return);
                    }
                    _this[prop] += x.str_return;
                    if (_this.debug) {
                        print(prop + ':' + x.str_return);
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
 * @return {string} stdout output.
 */
function run(cfg) {
    cfg.exceptions = true;
    cfg.async = false;
    var s = new Spawn(cfg);
    var ret = s.run();
    return s.output;
}
 /*
// test
try { 
    Seed.print(run({
        args: ['ls', '/tmp'],
        debug : true
    }));
} catch (e) { print(JSON.stringify(e)); }
 
var secs = (new Date()).getSeconds() 

try {      
Seed.print(run({
    args: ['/bin/touch', '/tmp/spawntest-' + secs ],
    debug : true
}));
} catch (e) { print( 'Error: ' + JSON.stringify(e)); }

 */
