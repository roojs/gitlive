//<script type="text/javascript">

/**
 * XObject
 * Yet another attempt to create a usable object construction library for seed..
 *
 * Extend this.. to use it's wonderful features..
 * 
 * 
 */

function XObject (cfg) {
    // first apply cfg if set.
    o =  {};
    o.pack = o.pack || 'add';
       
    XObject.extend(o, cfg); // copy everything into o.
    XObject.extend(this, o);
    
    // remove items.
    this.items = [];
    this.listeners = this.listeners || {}; 
    
    
    // remove objects/functions from o, so they can be sent to the contructor.
    for (var i in o) {
        if ((typeof(o[i]) == 'object') || 
            (typeof(o[i]) == 'function') || 
            i == 'pack'
        ) {
            delete o[i];
        }
    }
    
    // do we need to call 'beforeInit here?'
     
    // handle include?
    //if ((this.xtype == 'Include')) {
    //    o = this.pre_registry[cls];
    //}
    var isSeed = typeof(Seed) != 'undefined';
     
    // xtype= Gtk.Menu ?? what about c_new stuff?
    if (typeof(this.xtype) == 'function') {
        this.el = this.el ||  new this.xtype(o);
    }
    
    if (!this.el && o.xns) 
        var NS = imports.gi[o.xns];
        if (!NS) {
            Seed.print('Invalid xns: ' + o.xns);
        }
        constructor = NS[o.xtype];
        if (!constructor) {
            Seed.print('Invalid xtype: ' + o.xns + '.' + o.xtype);
        }
        this.el  =   isSeed ? new constructor(o) : new constructor();
    }
    
    
    // register it!
    if (o.xnsid  && o.xid) {
        XObject.registry = XObject.registry || { };
        XObject.registry[o.xnsid] = XObject.registry[o.xnsid] || {}; 
        XObject.registry[o.xnsid][o.xid] = this;
    }
    
    cfg.items.forEach(this.addItem, this);
    
    for (var i in this.listeners) {
        this.addListener(i, this.listeners[i]);
    }
    // delete this.listeners ?
    
    
    // do we need to call 'init here?'
    
}
XObject.prototype = {
    /**
     * @property el {GObject} the Gtk / etc. element.
     */
    el : false, 
    /*
     * @property items {Array} list of sub elements
     */
    /**
     * @property parent {XObject} parent Element
     */
     
    addItem : function(o) {
        var item = new XObject(o);
        
        this.items.push(item);
        
         
        if (typeof(item.pack) == 'function') {
            // parent, child
            item.pack.apply(o, [ o , o.items[i] ]);
            item.parent = this;
            return;
        }
        
        
        var pack_m = typeof(item.pack) == 'string' ?  item.pack :  item.pack.shift();
        
        // handle error.
        if (pack_m && typeof(o.el[pack_m]) == 'undefined') {
            Seed.print('pack method not available : ' + o.xtype + '.' +  pack_m);
            return;
        }
        
        
        //Seed.print('Pack ' + o.xtype + '.'+ pack_m + '(' + o.items[i].xtype + ')');
        // copy.
        var args = Array.prototype.slice.call(typeof(item.pack) == 'string' ? [] : item.pack);
        item.pack.unshift(item.el);
        //Seed.print('args: ' + args.length);
        if (pack_m) {
            this.el[pack_m].apply(item.el, args);
        }
        
        item.parent = this;
        
    }
    addListener  : function(sig, fn) {
              
        var _li = XObject.createDelegate(fn,this);
        // private listeners that are not copied to GTk.
        
        if (typeof(Seed) != 'undefined') {
          //   Seed.print(typeof(_li));
            this.el.signal[sig].connect(_li);
        } else {
            this.el.connect( sig, _li);
        }
             
        
    }
    
} 
         
        
   
        
         