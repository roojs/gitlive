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
    cfg = cfg || {};
    XObject.extend(cfg);
    o.set = o.set || {}; 
    o.listeners = o.listeners || {}; 
    o.packing = o.packing || [ 'add' ]; 
    o.items = o.items || []; 
    
    
}
XObject.prototype = {
    
    
    
    
}
xnew: function (o, in_xnsid)
    {
        in_xnsid = in_xnsid || '';
        var xnsid = '' + in_xnsid;
         
        if ((o.xtype == 'Include') && (o.xns == 'xnew')) {
            if (typeof(o.cls) != 'string') {
                return xnew.xnew( o.cls.create(), xnsid);
            }
            var cls = o.cls;
            o = this.pre_registry[cls];
        }
        if (typeof(o.xtype) == 'function') {
            return   new o.xtype(o);
        }
        o.set = o.set || {}; 
        o.listeners = o.listeners || {}; 
        o.packing = o.packing || [ 'add' ]; 
        o.items = o.items || []; 
        // handle xnsid..
        
        if (typeof(o.xnsid) !='undefined') {
            Seed.print("\n\n------------------------------------------");
            Seed.print( o.xnsid);
            Seed.print("------------------------------------------\n\n");
            xnsid = ''+ o.xnsid;
        }
        if ((typeof(xnsid) != 'undefined') &&  !o.xnsid) {
            o.xnsid = xnsid;
        }
        if (o.xnsid  && o.xid) {
            xnew.registry = xnew.registry || { };
            xnew.registry[o.xnsid] = xnew.registry[o.xnsid] || {}; 
            xnew.registry[o.xnsid][o.xid] = o;
        }
        
        
        var isSeed = typeof(Seed) != 'undefined';
        
        var constructor = false
        
     
        // XNS contructor..
        Seed.print('xnew : ' + o.xns + '.' + o.xtype);
        // support for xns='Gtk', xtyle='Window'..
        var NS = imports.gi[o.xns];
        if (!NS) {
            Seed.print('Invalid xns: ' + o.xns);
        }
        constructor = NS[o.xtype];
        if (!constructor) {
            Seed.print('Invalid xtype: ' + o.xns + '.' + o.xtype);
        }
         
        // how to hanlde gjs constructor???? - can it even be done..
        
        o.el  = o.el ||  (isSeed ? new constructor(o) : new constructor());
        
        
        
        
        if (o.listeners._new) { // rendered!?!?
            Seed.print('Call : ' + o.xtype+'.listeners._new');
            o.listeners._new.call(o);
        }
        
        
        //Seed.print(o.pack.length);
        // packing  - if 'add method exists on created node use that..
        
        
        for( var i =0; i < o.items.length;i++) {
            
            
            
            
            o.items[i] = xnew.xnew(o.items[i], xnsid);
            
            if (typeof(o.items[i].packing) == 'function') {
                // parent, child
                o.items[i].packing.apply(o, [ o , o.items[i] ]);
                o.items[i].xparent = o;
                continue;
            }
            var pack_m = o.items[i].packing[0];
            
            if (pack_m && typeof(o.el[pack_m]) == 'undefined') {
                Seed.print('pack method not available : ' + o.xtype + '.' +  pack_m);
                continue;
            }
            Seed.print('Pack ' + o.xtype + '.'+ pack_m + '(' + o.items[i].xtype + ')');
            // copy..
            args = this.copyArray(o.items[i].packing);
            args[0] = o.items[i].el;
            Seed.print('args: ' + args.length);
            if (pack_m) {
                o.el[pack_m].apply(o.el, args);
            }
            
            o.items[i].xparent = o;
        }
        
        /// Setting stuff...
        
        for (var i in o.set) {
            Seed.print('Set ' + i);
            if (typeof(o.el[i].apply) !='undefined') {
                o.el[i].apply(o.el, o.set[i]);
               }
            
        }
          
        for (var i in o.listeners) {
            if (i.substring(0,1) == '_') {
                continue;
            }
            Seed.print('Add Listener ' + i);
            
            var _li = this.createDelegate(o.listeners[i],o);
            // private listeners that are not copied to GTk.
            
             
            if (isSeed) {
              //   Seed.print(typeof(_li));
                o.el.signal[i].connect(_li);
            } else {
                o.el.connect( i, _li);
            }
             
        }
       
        // apply functions..
        if (o.listeners._rendered) { // rendered!?!?
            Seed.print('Call : ' + o.xtype+'.listeners._rendered');
            o.listeners._rendered.call(o);
        }
        
        return o;

    }