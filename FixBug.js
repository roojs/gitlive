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
    default_height : 400,
    default_width : 600,
    title : "Select Active Bug",
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
            xtype: Gtk.HBox,
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
                            listeners : {
                                changed : function (self) {
                                    var d = this.getValue();
                                    this.get('/view').load(d.description);
                                      this.get('/ok_button').el.set_sensitive(true);
                                }
                            },
                            id : "bug",
                            pack : "pack_end,true,true,3",
                            getValue : function() {
                                 var ix = this.el.get_active();
                                if (ix < 0 ) {
                                    return '';
                                }
                                return this.get('model').data[ix];
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
                                    
                                            var Repo = imports.Scm.Repo.Repo;
                                            var t = this;
                                            imports.Tasks.Tasks.list(Repo.get('gitlive'), function(res) { 
                                                t.loadData(res);
                                            });
                                            
                                                                    
                                    },
                                    loadData : function (data) {
                                                                                
                                                var iter = new Gtk.TreeIter();
                                                var el = this.el;
                                                data.forEach(function(p) {
                                                    
                                                    el.append(iter);
                                                    
                                                     
                                                    el.set_value(iter, 0, p.id);
                                                    el.set_value(iter, 1, '#' + p.id + ' - ' + p.summary );
                                                    
                                                });
                                                  
                                                                         
                                    }
                                }
                            ]
                        }
                    ]
                },
                {
                    xtype: Gtk.ScrolledWindow,
                    pack : "add",
                    id : "RightEditor",
                    items : [
                        {
                            xtype: Gtk.TextView,
                            editable : false,
                            id : "view",
                            indent_width : 4,
                            pack : "add",
                            auto_indent : true,
                            init : function() {
                                XObject.prototype.init.call(this);
                                var description = Pango.font_description_from_string("monospace");
                            
                                description.set_size(8000);
                                this.el.modify_font(description);
                            
                            },
                            load : function(str) {
                            
                            // show the help page for the active node..
                             
                            
                            
                             
                                this.el.get_buffer().set_text(str, str.length);
                             
                                
                                 var buf = this.el.get_buffer();
                                 
                                 
                                
                            },
                            show_line_numbers : true,
                            items : [
                                {
                                    xtype: GtkSource.Buffer,
                                    listeners : {
                                        changed : function (self) {
                                            /*
                                            var s = new Gtk.TextIter();
                                            var e = new Gtk.TextIter();
                                            this.el.get_start_iter(s);
                                            this.el.get_end_iter(e);
                                            var str = this.el.get_text(s,e,true);
                                            try {
                                                Seed.check_syntax('var e = ' + str);
                                            } catch (e) {
                                                this.get('/RightEditor.view').el.modify_base(Gtk.StateType.NORMAL, new Gdk.Color({
                                                    red: 0xFFFF, green: 0xCCCC , blue : 0xCCCC
                                                   }));
                                                //print("SYNTAX ERROR IN EDITOR");   
                                                //print(e);
                                                //console.dump(e);
                                                return;
                                            }
                                            this.get('/RightEditor.view').el.modify_base(Gtk.StateType.NORMAL, new Gdk.Color({
                                                    red: 0xFFFF, green: 0xFFFF , blue : 0xFFFF
                                                   }));
                                            
                                             this.get('/LeftPanel.model').changed(  str , false);
                                             */
                                        }
                                    },
                                    pack : "set_buffer"
                                }
                            ]
                        }
                    ]
                },
                {
                    xtype: Gtk.VBox,
                    pack : false,
                    items : [
                        {
                            xtype: Gtk.HBox,
                            pack : false,
                            items : [
                                {
                                    xtype: Gtk.Button,
                                    pack : false
                                },
                                {
                                    xtype: Gtk.Entry,
                                    pack : false
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
FixBug.init();
XObject.cache['/FixBug'] = FixBug;
