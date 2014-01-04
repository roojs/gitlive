

using Gee; // for array list?

static int main (string[] args) {
    // A reference to our file
    var file = File.new_for_path ("data.txt");
    var m = new Monitor();
    return 0;

}

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
*
*
*var output = Spawn.run( SpawnConfig() {
    cwd = "/home",  // empty string to default to homedirectory.
    args = {"ls", "-l" },
    evn = {},
    ouput  = (line) => { stdout.printf("%d\n", line); }
    stderr  = (line) => { stdout.printf("%d\n", line); }
    input  = () => { return "xxx"; }
};
*
*
*/
delegate void SpawnOutput(string line);
delegate void SpawnErr(string line);
delegate string SpawnInput();



struct SpawnConfig
struct SpawnConfig {
    public string cwd;
    public string[] args;
    public string[]  env;
    public boolean async;
    public boolean exceptions; // fire exceptions.
    public boolean debug; // fire exceptions.
    
    public SpawnOutput output
    public SpawnErr stderr;
    public SpawnInput input;
    // defaults..
    public SpawnConfig() {
	cwd = "";
	args = [];
	env = [];
	async = false;
	exceptions = false;
	debug = false;
	
    }
}

/**
 * @class Spawn
 * @param cfg {SpawnConfig} settings - see properties.
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


public class Spawn : Object
{



    public Spawn(SpawnConfig cfg)
    {
       
     
        this.cfg = cfg;
     
    
	this.cwd =  this.cfg.cwd.length || GLib.get_home_dir();
	if (!this.cfg.args.length) {
	    throw "No arguments";
	}
    
    }

    
    boolean ctx = false; // the mainloop ctx.
    
    /**
     * @property output {String} resulting output
     */
    string output  = "";
    /**
     * @property stderr {String} resulting output from stderr
     */
    string stderr  = "";
     /**
     * @property result {Number} execution result.
     */
    int result= 0;
    /**
     * @property pid {Number} pid of child process (of false if it's not running)
     */
    int  pid = -1;
    /**
     * @property in_ch {GLib.IOChannel} input io channel
     */
    IOChannel in_ch = null;
    /**
     * @property out_ch {GLib.IOChannel} output io channel
     */
    IOChannel out_ch = null;
    /**
     * @property err_ch {GLib.IOChannel} stderr io channel
     */
    IOChannel err_ch = null;
    /**
     * 
     * @method run
     * Run the configured command.
     * result is applied to object properties (eg. 'output' or 'stderr')
     * @returns {Object} self.
     */
    public run : function()
    {
        
         
        var err_src = false;
        var out_src = false;
	int standard_input;
	int standard_output;
	int standard_error;


        var ret = {};
        
        if (this.cfg.debug) {
            print("cd " + this.cfg.cwd +";" + string.joinv(" ", this.cfg.args));
        }
        
	Process.spawn_async_with_pipes (
			this.cfg.cwd,
			this.cfg.args,
			this.cfg.env,
			SpawnFlags.SEARCH_PATH | SpawnFlags.DO_NOT_REAP_CHILD,
			null,
			out this.pid,
			out standard_input,
			out standard_output,
			out standard_error);

		// stdout:
	
         	
    	//print(JSON.stringify(gret));    
         
        if (this.cfg.debug) {
            print("PID: " + this.pid);
        }
         
        ChildWatch.add (this.pid, (w_pid, result) => {
	    
	    this.result = result;
            if (_this.debug) {
                print("child_watch_add : result: " + result);
            }
	    
            this.read(this.out_ch);
            this.read(this.err_ch);
            
			
            Process.close_pid(this.pid);
            _this.pid = false;
            if (_this.ctx) {
                _this.ctx.quit();
            }
            tidyup();
	    //print("DONE TIDYUP");
            if (_this.listeners.finish) {
                _this.listeners.finish.call(this, _this.result);
            }
        });
	    
			// Triggered when the child indicated by child_pid exits
			Process.close_pid (w_pid);
			loop.quit ();
		})
	
        GLib.child_watch_add(GLib.PRIORITY_DEFAULT, this.pid, function(pid, result) {
           
        
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
        
        
        this.in_ch = new GLib.IOChannel.unix_new(ret.standard_input);
        this.out_ch = new GLib.IOChannel.unix_new(ret.standard_output);
        this.err_ch = new GLib.IOChannel.unix_new(ret.standard_error);
        
        // make everything non-blocking!
        
        
      
			// using NONBLOCKING only works if io_add_watch
	   //returns true/false in right conditions
	   this.in_ch.set_flags (GLib.IOFlags.NONBLOCK);
	   this.out_ch.set_flags (GLib.IOFlags.NONBLOCK);
	   this.err_ch.set_flags (GLib.IOFlags.NONBLOCK);
			

      
        // add handlers for output and stderr.
        out_src= GLib.io_add_watch(this.out_ch, GLib.PRIORITY_DEFAULT, 
            GLib.IOCondition.OUT + GLib.IOCondition.IN  + GLib.IOCondition.PRI +  GLib.IOCondition.HUP +  GLib.IOCondition.ERR,
            function() {
                
               return  _this.read(_this.out_ch);
            
            }
        );
        err_src= GLib.io_add_watch(this.err_ch, GLib.PRIORITY_DEFAULT, 
            GLib.IOCondition.ERR + GLib.IOCondition.IN + GLib.IOCondition.PRI + GLib.IOCondition.OUT +  GLib.IOCondition.HUP, 
            function()
        {
            return _this.read(_this.err_ch);
             
        });
        
      
        
        // call input.. 
        if (this.pid !== false) {
            // child can exit before 1we get this far..
            if (this.listeners.input) {
				print("Trying to call listeners");
                try {
                    this.write(this.listeners.input.call(this));
		     // this probably needs to be a bit smarter...
		    //but... let's close input now..
		    this.in_ch.close();
		    _this.in_ch = false;
		   
		    
		    
		    
		    
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
	    
            this.ctx = isSeed ? new GLib.MainLoop.c_new (null, false) : GLib.MainLoop.new (null, false);;
            this.ctx.run(false); // wait fore exit?
            
            //print("main_loop done!");
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
	//print("write: " + str);
	// NEEDS GIR FIX! for return value.. let's ignore for the time being..
	//var ret = {};
        //var res = this.in_ch.write_chars(str, str.length, ret);
	var res = this.in_ch.write_chars(str, str.length);
	
	//print("write_char retunred:" + JSON.stringify(res) +  ' ' +JSON.stringify(ret)  );
	
        if (res != GLib.IOStatus.NORMAL) {
            throw "Write failed";
        }
        //return ret.value;
        return str.length;
        
    },
    
    /**
     * read from pipe and call appropriate listerner and add to output or stderr string.
     * @arg giochannel to read from.
     * @returns none
     */
    read: function(ch) 
    {
        var prop = ch == this.out_ch ? 'output' : 'stderr';
       // print("prop: " + prop);
        var _this = this;
        
	
        //print(JSON.stringify(ch, null,4));
        while (true) {
 
            var x =   {};
            var status = ch.read_line( x);
            // print('status: '  +JSON.stringify(status));
            // print(JSON.stringify(x));
             switch(status) {
                case GLib.IOStatus.NORMAL:
		
                    //write(fn, x.str);
                    if (this.listeners[prop]) {
                        this.listeners[prop].call(this, x.str_return);
                    }
                    _this[prop] += x.str_return;
                    if (_this.debug) {
                        print(prop + ':' + x.str_return.replace(/\n/, ''));
                    }
                    if (this.async) {
                        try {
                            if (imports.gi.Gtk.events_pending()) {
                                imports.gi.Gtk.main_iteration();
                            }
                        } catch(e) {
                            
                        }
                    }
                    
                    //this.ctx.iteration(true);
                   continue;
                case GLib.IOStatus.AGAIN:
		    //print("Should be called again.. waiting for more data..");
		    return true;
                    break;
                case GLib.IOStatus.ERROR:    
                case GLib.IOStatus.EOF:
		    return false;
                   break;
                
            }
            break;
        }
       
        //print("RETURNING");
         return false; // allow it to be called again..
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
 
