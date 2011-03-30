Gtk = imports.gi.Gtk;
Gdk = imports.gi.Gdk;
Pango = imports.gi.Pango;
GLib = imports.gi.GLib;
Gio = imports.gi.Gio;
GObject = imports.gi.GObject;
GtkSource = imports.gi.GtkSource;
WebKit = imports.gi.WebKit;
Vte = imports.gi.Vte;
GtkClutter = imports.gi.GtkClutter;
Gdl = imports.gi.Gdl;
console = imports.console;
XObject = imports.XObject.XObject;
FixBug=new XObject({
    xtype: Gtk.Dialog,
    listeners : {
        destroy_event : function (self, event) {
             this.el.hide();
                        return false;
        },
        response : function (self, id) {
          // hide
         if (id < 1) {
                this.el.hide();
                return;
            }
            if (!this.get('bug').getValue().length) {
                print("ERROR");
                    return;
                }
         
                this.el.hide();
                
                var val = this.get('bug').getValue();
                Seed.print(val);
        }
    },
    border_width : 3,
    default_height : 150,
    default_width : 600,
    title : "Project Properties",
    deletable : true,
    modal : true,
    show : function(c) {
        
        if (!this.el) {
            this.init();
        }
        var _this = this;
        /*[ 'xtype'  ].forEach(function(k) {
            _this.get(k).setValue(typeof(c[k]) == 'undefined' ? '' : c[k]);
        });
    	// shouild set path..
        */
        this.el.show_all();
        //this.success = c.success;
    },
    items : [
        {
            xtype: Gtk.VBox,
            pack : function(p,e) {
                        p.el.get_content_area().add(e.el)
                    },
            items : [
                {
                    xtype: Gtk.HBox,
                    pack : "pack_start,false,true,3",
                    items : [
                        {
                            xtype: Gtk.Label,
                            label : "Select Active Bug:",
                            pack : "pack_start,false,true,3"
                        },
                        {
                            xtype: Gtk.ComboBox,
                            id : "bug",
                            pack : "pack_end,true,true,3",
                            getValue : function() {
                                 var ix = this.el.get_active();
                                        if (ix < 0 ) {
                                            return '';
                                        }
                                        return this.get('model').data[ix].xtype;
                            },
                            init : function() {
                                XObject.prototype.init.call(this);
                              this.el.add_attribute(this.items[0].el , 'markup', 1 );  
                            },
                            setValue : function(v)
                                            {
                                                var el = this.el;
                                                el.set_active(-1);
                                                this.get('model').data.forEach(function(n, ix) {
                                                    if (v == n.xtype) {
                                                        el.set_active(ix);
                                                        return false;
                                                    }
                                                });
                                            },
                            items : [
                                {
                                    xtype: Gtk.CellRendererText,
                                    pack : "pack_start"
                                },
                                {
                                    xtype: Gtk.ListStore,
                                    id : "model",
                                    pack : "set_model",
                                    init : function() {
                                        XObject.prototype.init.call(this);
                                    
                                            this.el.set_column_types ( 2, [
                                                GObject.TYPE_STRING,  // real key
                                                GObject.TYPE_STRING // real type
                                                
                                                
                                            ] );
                                            var Tickets = imports.Tickets.Tickets;
                                            
                                            this.data = Tickets.fetchBugs("http://www.roojs.com/mtrack/index.php/Gitlive/web.hex");
                                    /*        this.data = [
                                                { xtype: 'Roo', desc : "Roo Project" },
                                                { xtype: 'Gtk', desc : "Gtk Project" },    
                                                //{ xtype: 'JS', desc : "Javascript Class" }
                                            ]
                                      */      
                                            this.loadData(this.data);
                                                                    
                                    },
                                    loadData : function (data) {
                                                                                
                                                var iter = new Gtk.TreeIter();
                                                var el = this.el;
                                                data.forEach(function(p) {
                                                    
                                                    el.append(iter);
                                                    
                                                     
                                                    el.set_value(iter, 0, p.id);
                                                    el.set_value(iter, 1, '#' + p.id + p.name );
                                                    
                                                });
                                                  
                                                                         
                                    }
                                }
                            ]
                        }
                    ]
                }
            ]
        },
        {
            xtype: Gtk.Button,
            pack : "add_action_widget,1",
            label : "OK"
        },
        {
            xtype: Gtk.Button,
            pack : "add_action_widget,0",
            label : "Cancel"
        }
    ]
});
FixBug.init();
XObject.cache['/FixBug'] = FixBug;
