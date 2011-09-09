Gtk = imports.gi.Gtk;
Gdk = imports.gi.Gdk;
Pango = imports.gi.Pango;
GLib = imports.gi.GLib;
Gio = imports.gi.Gio;
GObject = imports.gi.GObject;
GtkSource = imports.gi.GtkSource;
WebKit = imports.gi.WebKit;
Vte = imports.gi.Vte;
console = imports.console;
XObject = imports.XObject.XObject;
Merger=new XObject({
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
            if (typeof(this.get('bug').getValue()) != 'object') {
                print("ERROR");
                return;
            }
         
            this.el.hide();
                
            //var val = this.get('bug').getValue();
             //   Seed.print(val);
        }
    },
    border_width : 3,
    default_height : 700,
    default_width : 800,
    title : "Merger",
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
        this.get('/ok_button').el.set_sensitive(false);
        
        // block until we return.
        var run_ret = this.el.run();
        if (run_ret < 1 ) {
            return false;
        }
        print("RUN RETURN : " + run_ret);
        
        //print(JSON.stringify(this.get('bug').getValue()));
        return this.get('bug').getValue();
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
                    pack : "pack_start,false,false",
                    items : [
                        {
                            xtype: Gtk.Button,
                            label : "Select Branch",
                            pack : "add"
                        },
                        {
                            xtype: Gtk.Button,
                            label : "Select Branch",
                            pack : "add"
                        }
                    ]
                },
                {
                    xtype: Gtk.VPaned,
                    position : 400,
                    items : [
                        {
                            xtype: Gtk.HPaned,
                            pack : "add",
                            position : 200,
                            items : [
                                {
                                    xtype: Gtk.ScrolledWindow,
                                    init : function() {
                                        XObject.prototype.init.call(this);
                                         this.el.set_policy (Gtk.PolicyType.AUTOMATIC, Gtk.PolicyType.AUTOMATIC)
                                    },
                                    items : [
                                        {
                                            xtype: Gtk.TreeView,
                                            pack : "add",
                                            init : function() {
                                                XObject.prototype.init.call(this);
                                                    var description = new Pango.FontDescription.c_new();
                                               description.set_size(8000);
                                                 this.el.modify_font(description);
                                            
                                                 this.selection = this.el.get_selection();
                                                  this.selection.set_mode( Gtk.SelectionMode.SINGLE);
                                                var _this = this;
                                                /*
                                             780                                                                     
                                             781                                                                         // is this really needed??
                                             782                                                                         this.selection.signal['changed'].connect(function() {
                                             783                                                                                 _this.get('/LeftTree.view').listeners.cursor_changed.apply(
                                             784                                                                                     _this.get('/LeftTree.view'), [ _this.get('/LeftTree.view'), '']
                                             785                                                                                 );
                                             786                                                                         });
                                             787                                                                         
                                             */
                                             },
                                            items : [
                                                {
                                                    xtype: Gtk.TreeStore,
                                                    pack : "set_model",
                                                    init : function() {
                                                        XObject.prototype.init.call(this);
                                                        this.el.set_column_types ( 3, [
                                                           GObject.TYPE_STRING, // title 
                                                          GObject.TYPE_STRING, // rev 
                                                      ] );
                                                    }
                                                },
                                                {
                                                    xtype: Gtk.TreeViewColumn,
                                                    pack : "append_column",
                                                    init : function() {
                                                        XObject.prototype.init.call(this);
                                                        this.el.add_attribute(this.items[0].el , 'markup', 0 );
                                                    
                                                    },
                                                    items : [
                                                        {
                                                            xtype: Gtk.CellRendererText,
                                                            pack : "pack_start"
                                                        }
                                                    ]
                                                }
                                            ]
                                        }
                                    ]
                                },
                                {
                                    xtype: Gtk.ScrolledWindow,
                                    init : function() {
                                        XObject.prototype.init.call(this);
                                          this.el.set_policy (Gtk.PolicyType.AUTOMATIC, Gtk.PolicyType.AUTOMATIC)
                                    },
                                    items : [
                                        {
                                            xtype: Gtk.TreeView,
                                            pack : "add",
                                            init : function() {
                                                XObject.prototype.init.call(this);
                                                    var description = new Pango.FontDescription.c_new();
                                               description.set_size(8000);
                                                 this.el.modify_font(description);
                                            
                                                 this.selection = this.el.get_selection();
                                                  this.selection.set_mode( Gtk.SelectionMode.SINGLE);
                                                var _this = this;
                                                /*
                                             780                                                                     
                                             781                                                                         // is this really needed??
                                             782                                                                         this.selection.signal['changed'].connect(function() {
                                             783                                                                                 _this.get('/LeftTree.view').listeners.cursor_changed.apply(
                                             784                                                                                     _this.get('/LeftTree.view'), [ _this.get('/LeftTree.view'), '']
                                             785                                                                                 );
                                             786                                                                         });
                                             787                                                                         
                                             */
                                             },
                                            items : [
                                                {
                                                    xtype: Gtk.ListStore,
                                                    pack : "set_model",
                                                    init : function() {
                                                        XObject.prototype.init.call(this);
                                                        this.el.set_column_types ( 3, [
                                                           GObject.TYPE_STRING, // title 
                                                          GObject.TYPE_STRING, // rev 
                                                      ] );
                                                    }
                                                },
                                                {
                                                    xtype: Gtk.TreeViewColumn,
                                                    min_width : 200,
                                                    pack : "append_column",
                                                    title : "Filename",
                                                    init : function() {
                                                        XObject.prototype.init.call(this);
                                                        this.el.add_attribute(this.items[0].el , 'markup', 0 );
                                                    
                                                    },
                                                    items : [
                                                        {
                                                            xtype: Gtk.CellRendererText,
                                                            pack : "pack_start"
                                                        }
                                                    ]
                                                },
                                                {
                                                    xtype: Gtk.TreeViewColumn,
                                                    min_width : 50,
                                                    pack : "append_column",
                                                    title : "Added",
                                                    init : function() {
                                                        XObject.prototype.init.call(this);
                                                        this.el.add_attribute(this.items[0].el , 'markup', 0 );
                                                    
                                                    },
                                                    items : [
                                                        {
                                                            xtype: Gtk.CellRendererText,
                                                            pack : "pack_start"
                                                        }
                                                    ]
                                                },
                                                {
                                                    xtype: Gtk.TreeViewColumn,
                                                    min_width : 50,
                                                    pack : "append_column",
                                                    title : "Removed",
                                                    width : 50,
                                                    init : function() {
                                                        XObject.prototype.init.call(this);
                                                        this.el.add_attribute(this.items[0].el , 'markup', 0 );
                                                    
                                                    },
                                                    items : [
                                                        {
                                                            xtype: Gtk.CellRendererText,
                                                            pack : "pack_start"
                                                        }
                                                    ]
                                                }
                                            ]
                                        },
                                        {
                                            xtype: Gtk.TreeView,
                                            pack : false,
                                            items : [
                                                {
                                                    xtype: Gtk.ListStore,
                                                    pack : false
                                                }
                                            ]
                                        }
                                    ]
                                }
                            ]
                        },
                        {
                            xtype: Gtk.ScrolledWindow,
                            init : function() {
                                XObject.prototype.init.call(this);
                                  this.el.set_policy (Gtk.PolicyType.AUTOMATIC, Gtk.PolicyType.AUTOMATIC)
                            },
                            items : [
                                {
                                    xtype: WebKit.WebView,
                                    id : "patchview",
                                    pack : "add"
                                }
                            ]
                        }
                    ]
                }
            ]
        },
        {
            xtype: Gtk.Button,
            label : "Cancel",
            pack : "add_action_widget,0"
        },
        {
            xtype: Gtk.Button,
            id : "ok_button",
            label : "OK",
            pack : "add_action_widget,1"
        }
    ]
});
Merger.init();
XObject.cache['/Merger'] = Merger;
