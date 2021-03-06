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
    xtype: Gtk.Window,
    listeners : {
        destroy_event : function (self, event) {
             this.el.hide();
                        return false;
        },
        show : function (self) {
        print("ON SHOW!");
        
            this.el.fullscreen();
            this.el.grab_focus();
            this.el.set_keep_above(true);
            
            this.get('/today-vew').load();
            
        }
    },
    border_width : 3,
    default_height : 400,
    default_width : 1200,
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
       // this.get('/ok_button').el.set_sensitive(false);
        
        // block until we return.
        //    var run_ret = this.el.run();
        //    if (run_ret < 1 ) {
        //        return false;
        //    }
        //    print("RUN RETURN : " + run_ret);
        
        //print(JSON.stringify(this.get('bug').getValue()));
        //return this.get('bug').getValue();
        //this.success = c.success;
    },
    items : [
        {
            xtype: Gtk.VBox,
            pack : "add",
            items : [
                {
                    xtype: Gtk.HBox,
                    pack : "pack_start,false,true,3",
                    items : [
                        {
                            xtype: Gtk.Label,
                            label : "On this project:"
                        },
                        {
                            xtype: Gtk.ComboBox,
                            listeners : {
                                changed : function (self) {
                                    print("store: active id = " + this.el.get_active_id());
                                    this.get('/ticket-store').reload();
                                    
                                    
                                }
                            },
                            id : "project-select",
                            init : function() {
                                 this.el = new Gtk.ComboBox.with_entry();
                                                            
                                                            
                                this.model  = new XObject(this.model);
                                this.model.init();
                                this.el.set_model(this.model.el);
                                this.el.set_entry_text_column (0);
                                XObject.prototype.init.call(this);
                                
                                 var t = this;
                                imports.Projects.Projects.fetch(  function(res) { 
                                     t.load(res);
                                });
                            },
                            load : function(tr) {
                                  this.model.el.clear();
                                  this.raw_data = tr;                     
                                     for(var i =0 ; i < tr.length; i++) {
                                        var ret = {  };
                                        this.model.el.append(ret);
                                        //print(JSON.stringify(ret,null,4));
                                       
                                        this.model.el.set_value(ret.iter, 0, '' + tr[i].code + " - " + tr[i].name );
                                        this.model.el.set_value(ret.iter, 1, '' + tr[i].id  );
                                 
                                        
                                    }     
                                    
                            },
                            model : {
                                xtype: Gtk.ListStore,
                                id : "project-store",
                                init : function() {
                                    XObject.prototype.init.call(this);
                                    this.el.set_column_types ( 3, [
                                           GObject.TYPE_STRING, // file  
                                          GObject.TYPE_STRING, // added
                                          GObject.TYPE_STRING, // removed
                                      ] );
                                }
                            }
                        },
                        {
                            xtype: Gtk.Button,
                            listeners : {
                                button_press_event : function (self, event) {
                                 
                                    FixBug.el.hide();
                                }
                            },
                            height_request : 90,
                            label : "Not working on Project",
                            pack : "add"
                        },
                        {
                            xtype: Gtk.Button,
                            listeners : {
                                button_press_event : function (self, event) {
                                
                                   FixBug.el.hide();
                                }
                            },
                            id : "ok_button",
                            label : "Working on Selected Ticket",
                            pack : "add"
                        }
                    ]
                },
                {
                    xtype: Gtk.HPaned,
                    pack : "pack_end,true,true,3",
                    items : [
                        {
                            xtype: Gtk.VBox,
                            pack : "add",
                            width_request : 400,
                            items : [
                                {
                                    xtype: Gtk.HBox,
                                    pack : "pack_start,false,true,3",
                                    items : [
                                        {
                                            xtype: Gtk.Entry,
                                            listeners : {
                                                key_release_event : function (self, event) {
                                                    if (event.key.keyval == Gdk.KEY_Return) {;
                                                        // same code as button press..
                                                         var active_id = this.get('/project-select').el.get_active();
                                                     
                                                        var project_id = this.get('/project-select').raw_data[active_id].id;
                                                        
                                                        var str = this.get('/search-entry').el.get_text();
                                                        
                                                        print(str);
                                                        
                                                        var _t = this;
                                                        
                                                        imports.Tasks.Tasks.query({
                                                            project_id : project_id,
                                                            'query[filter]' : 'me',
                                                            'query[search]' : str
                                                        }, function(res) { 
                                                           // print(JSON.stringify(res,null,4));
                                                            _t.get('/ticket-store').loadData(res);
                                                        });
                                                    }
                                                    return true;
                                                }
                                            },
                                            id : "search-entry",
                                            pack : "pack_start,true,true,3"
                                        },
                                        {
                                            xtype: Gtk.Button,
                                            listeners : {
                                                clicked : function (self) {
                                                    var active_id = this.get('/project-select').el.get_active();
                                                     
                                                    var project_id = this.get('/project-select').raw_data[active_id].id;
                                                    
                                                    var str = this.get('/search-entry').el.get_text();
                                                    
                                                    print(str);
                                                    
                                                    var _t = this;
                                                    
                                                    imports.Tasks.Tasks.query({
                                                        project_id : project_id,
                                                        'query[filter]' : 'me',
                                                        'query[search]' : str
                                                    }, function(res) { 
                                                       // print(JSON.stringify(res,null,4));
                                                        _t.get('/ticket-store').loadData(res);
                                                    });
                                                }
                                            },
                                            label : "Search",
                                            pack : "pack_end,false,true,3",
                                            use_stock : true
                                        }
                                    ]
                                },
                                {
                                    xtype: Gtk.ScrolledWindow,
                                    pack : "pack_end,true,true,3",
                                    shadow_type : Gtk.ShadowType.IN,
                                    items : [
                                        {
                                            xtype: Gtk.TreeView,
                                            listeners : {
                                                cursor_changed : function (self) {
                                                    
                                                    var ret = {};
                                                    this.selection.get_selected(ret);
                                                
                                                    // var val = "";
                                                    var value = ''+ret.model.get_value(ret.iter, 0).value.get_string();
                                                    
                                                    print(value);
                                                    var rec = false;
                                                    this.get('/ticket-store').data.forEach( function(e) {
                                                        if (e.id == value) {
                                                            rec = e;
                                                            return  false;
                                                        }
                                                    });
                                                    // update the text box with the ticket data..
                                                    this.get('/view').show(rec);
                                                    //print(rec);
                                                
                                                }
                                            },
                                            id : "ticket-view",
                                            pack : "add",
                                            can_focus : true,
                                            fixed_height_mode : false,
                                            headers_visible : false,
                                            init : function() {
                                                XObject.prototype.init.call(this);
                                                var description = new Pango.FontDescription.c_new();
                                                description.set_size(10000);
                                                this.el.modify_font(description);
                                            
                                                this.selection = this.el.get_selection();
                                                this.selection.set_mode( Gtk.SelectionMode.SINGLE);
                                                var _t = this;
                                            
                                                // is this really needed??
                                                this.selection.signal['changed'].connect(function() {
                                                    print('selection changed');
                                                
                                            
                                                });
                                            
                                            },
                                            items : [
                                                {
                                                    xtype: Gtk.ListStore,
                                                    id : "ticket-store",
                                                    pack : "set_model",
                                                    columns : [
                                                            GObject.TYPE_STRING, // title 
                                                            GObject.TYPE_STRING, // tip
                                                            GObject.TYPE_STRING // source..
                                                    ],
                                                    init : function() {
                                                        XObject.prototype.init.call(this);
                                                    
                                                        this.el.set_column_types ( 2, [
                                                            GObject.TYPE_STRING,  // real key
                                                            GObject.TYPE_STRING // real type
                                                            
                                                            
                                                        ] );
                                                    
                                                    
                                                        
                                                        // var t = this;
                                                        //imports.Projects.Projects.fetch(  function(res) { 
                                                        //    t.loadData(res);
                                                       // });
                                                            
                                                                                    
                                                    },
                                                    loadData : function (data) {
                                                            print("loading data");
                                                        
                                                        
                                                        this.data = data;
                                                                              
                                                        var el = this.el;
                                                        this.el.clear();
                                                        data.forEach(function(p) {
                                                            var ret = {};
                                                            el.append(ret);
                                                           //print("ADD " + p.name);
                                                             
                                                           var line =    '[' + p.status_name + '] <b>'   + 
                                                                 GLib.markup_escape_text(p.summary, p.summary.length)  + "</b>\n"  +
                                                                 '<span color="#666">' + 
                                                                 GLib.markup_escape_text(p.description,p.description.length).split("\n").slice(0,3).join("\n") +
                                                                 '</span>';
                                                             print(line);
                                                             
                                                            el.set_value(ret.iter, 0, p.id);
                                                            el.set_value(ret.iter, 1,   '<b>#' + p.id + '</b>' +  line );
                                                            
                                                        });
                                                                  
                                                                                         
                                                    },
                                                    reload : function() {
                                                     
                                                        var active_id = this.get('/project-select').el.get_active();
                                                         
                                                        var project_id = this.get('/project-select').raw_data[active_id].id;
                                                        
                                                        var _t = this;
                                                        
                                                        imports.Tasks.Tasks.query({
                                                            project_id : project_id,
                                                            'query[filter]' : 'me'
                                                        }, function(res) { 
                                                            print(JSON.stringify(res,null,4));
                                                            _t.loadData(res);
                                                        });
                                                         
                                                        
                                                    }
                                                },
                                                {
                                                    xtype: Gtk.TreeViewColumn,
                                                    pack : "append_column",
                                                    init : function() {
                                                        XObject.prototype.init.call(this);
                                                        this.el.add_attribute(this.items[0].el , 'markup', 1 );
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
                                }
                            ]
                        },
                        {
                            xtype: Gtk.HPaned,
                            pack : "add",
                            items : [
                                {
                                    xtype: Gtk.VBox,
                                    pack : "pack1,true,true",
                                    items : [
                                        {
                                            xtype: Gtk.HBox,
                                            pack : "pack_start,false,true,3",
                                            items : [
                                                {
                                                    xtype: Gtk.Label,
                                                    label : "I am doing this:",
                                                    pack : "pack_start,false,true,3"
                                                },
                                                {
                                                    xtype: Gtk.Entry,
                                                    pack : "pack_start,true,true,3"
                                                }
                                            ]
                                        },
                                        {
                                            xtype: Gtk.HBox,
                                            pack : "pack_start,false,true,3",
                                            items : [
                                                {
                                                    xtype: Gtk.Label,
                                                    label : "Since:",
                                                    pack : "pack_start,false,true,3"
                                                },
                                                {
                                                    xtype: Gtk.Entry,
                                                    pack : "pack_start,false,false,3",
                                                    width_request : 80
                                                },
                                                {
                                                    xtype: Gtk.Label,
                                                    label : "Until",
                                                    pack : "pack_start,false,true,3"
                                                },
                                                {
                                                    xtype: Gtk.Entry,
                                                    pack : "pack_start,true,true,3"
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
                                                    id : "view",
                                                    indent_width : 4,
                                                    pack : "add",
                                                    auto_indent : true,
                                                    editable : false,
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
                                                    show : function(p) {
                                                         var line =  [
                                                                'Status : ' +   p.status_name,
                                                                'ID : ' +   p.id,
                                                                '',
                                                                'Summary :  ' +  p.summary,
                                                                 '' + 
                                                                 p.description,
                                                             ].join("\n")   ;
                                                             print(line);
                                                             
                                                             
                                                             // can not do rich text due to so many missing features..
                                                              this.el.get_buffer().set_text(line, line.length);
                                                     
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
                                        }
                                    ]
                                },
                                {
                                    xtype: Gtk.VBox,
                                    pack : "pack2,false,false",
                                    width_request : 200,
                                    items : [
                                        {
                                            xtype: Gtk.HBox,
                                            pack : "pack_start,false,true,3",
                                            items : [
                                                {
                                                    xtype: Gtk.Button,
                                                    listeners : {
                                                        clicked : function (self) {
                                                         
                                                        }
                                                    },
                                                    label : "Next/Back",
                                                    pack : "pack_end,false,true,3",
                                                    use_stock : true
                                                }
                                            ]
                                        },
                                        {
                                            xtype: Gtk.ScrolledWindow,
                                            pack : "pack_end,true,true,3",
                                            shadow_type : Gtk.ShadowType.IN,
                                            items : [
                                                {
                                                    xtype: Gtk.TreeView,
                                                    id : "today-view",
                                                    pack : "add",
                                                    can_focus : true,
                                                    fixed_height_mode : true,
                                                    headers_visible : false,
                                                    init : function() {
                                                        XObject.prototype.init.call(this);
                                                        var description = new Pango.FontDescription.c_new();
                                                        description.set_size(10000);
                                                        this.el.modify_font(description);
                                                    
                                                        this.selection = this.el.get_selection();
                                                        this.selection.set_mode( Gtk.SelectionMode.SINGLE);
                                                        var _t = this;
                                                    
                                                        // is this really needed??
                                                        this.selection.signal['changed'].connect(function() {
                                                            print('selection changed');
                                                        
                                                    
                                                        });
                                                    
                                                    },
                                                    items : [
                                                        {
                                                            xtype: Gtk.ListStore,
                                                            id : "today-store",
                                                            pack : "set_model",
                                                            columns : [
                                                                    GObject.TYPE_STRING, // title 
                                                                    GObject.TYPE_STRING, // tip
                                                                    GObject.TYPE_STRING // source..
                                                            ],
                                                            init : function() {
                                                                XObject.prototype.init.call(this);
                                                            
                                                                this.el.set_column_types ( 2, [
                                                                    GObject.TYPE_STRING,  // real key
                                                                    GObject.TYPE_STRING // real type
                                                                    
                                                                    
                                                                ] );
                                                            
                                                            
                                                                
                                                                // var t = this;
                                                                //imports.Projects.Projects.fetch(  function(res) { 
                                                                //    t.loadData(res);
                                                               // });
                                                                    
                                                                                            
                                                            },
                                                            loadData : function (data) {
                                                                    print("loading data");
                                                                                                
                                                                var el = this.el;
                                                                this.el.clear();
                                                                data.forEach(function(p) {
                                                                    var ret = {};
                                                                    el.append(ret);
                                                                   //print("ADD " + p.name);
                                                                     
                                                                    el.set_value(ret.iter, 0, p.id);
                                                                    el.set_value(ret.iter, 1,   '<b>#' + p.id + '</b>' + 
                                                                        '[' + p.status_name + '] <b>'   + p.summary  + "</b>\n"  +
                                                                         '<span color="#666">' + p.description.split("\n").slice(0,3).join("\n") +
                                                                         '</span>'
                                                                         
                                                                          );
                                                                    
                                                                });
                                                                          
                                                                                                 
                                                            },
                                                            reload : function() {
                                                             
                                                                var active_id = this.get('/project-select').el.get_active();
                                                                 
                                                                var project_id = this.get('/project-select').raw_data[active_id].id;
                                                                
                                                                var _t = this;
                                                                 
                                                                var DT = imports.Date.Date;
                                                                
                                                                new imports.Request.Request( {
                                                                   url : '/cash_invoice_entry',
                                                                   params : {
                                                                        'query[action_dt_from]' : (new DT()).format('Y-m-d'),
                                                                         'query[action_dt_to]' : (new DT()).add(DT.DAY,1).format('Y-m-d'),
                                                                        limit: 999,
                                                                        'sort' : 'action_dt',
                                                                        dir : 'ASC',
                                                                        action : 'Hours'
                                                                   },
                                                                   
                                                                   success : function(res) {
                                                                       this.loadData();
                                                                   },
                                                                   scope : this
                                                                    
                                                                    
                                                                });
                                                                 
                                                                 
                                                                
                                                            }
                                                        },
                                                        {
                                                            xtype: Gtk.TreeViewColumn,
                                                            pack : "append_column",
                                                            sizing : Gtk.TreeViewColumnSizing.FIXED,
                                                            init : function() {
                                                                XObject.prototype.init.call(this);
                                                                this.el.add_attribute(this.items[0].el , 'markup', 1 );
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
                                        }
                                    ]
                                }
                            ]
                        }
                    ]
                }
            ]
        }
    ]
});
FixBug.init();
XObject.cache['/FixBug'] = FixBug;
