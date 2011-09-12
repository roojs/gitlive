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
Clones=new XObject({
    xtype: Gtk.Dialog,
    listeners : {
        destroy_event : function (self, event) {
             this.el.hide();
                        return false;
        },
        response : function (self, id) {
          // hide
             //if (id < 1) {
                this.el.hide();
                return;
            //}
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
    default_height : 500,
    default_width : 600,
    title : "Manage Clones",
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
        // load clones..
            this.get('/reposStore').load();
        
        //this.get('/ok_button').el.set_sensitive(false);
        
        // block until we return.
        var run_ret = this.el.run();
        if (run_ret < 1 ) {
            return  "DONE";
        }
        print("RUN RETURN : " + run_ret);
        return "DONE";
        //print(JSON.stringify(this.get('bug').getValue()));
       // return this.get('bug').getValue();
        //this.success = c.success;
    },
    items : [
        {
            xtype: Gtk.VBox,
            pack : function(p,e) {
                    p.el.get_content_area().pack_start(e.el,true,true,0)
                },
            items : [
                {
                    xtype: Gtk.HBox,
                    pack : "pack_start,false,true",
                    items : [
                        {
                            xtype: Gtk.Button,
                            listeners : {
                                clicked : function (self) {
                                    
                                    
                                 
                                       
                                    
                                    
                                }
                            },
                            label : "Add Clone",
                            pack : "add"
                        },
                        {
                            xtype: Gtk.Button,
                            listeners : {
                                clicked : function (self) {
                                    
                                    
                                 
                                       
                                    
                                    
                                }
                            },
                            label : "Add Branch",
                            pack : "add"
                        },
                        {
                            xtype: Gtk.Button,
                            listeners : {
                                clicked : function (self) {
                                    var Merger =     imports.Merger.Merger;
                                    Merger.repo = new Repo('/home/alan/gitlive/roojs1');
                                    Merger.show();
                                
                                       
                                    
                                    
                                }
                            },
                            label : "Run Merger",
                            pack : "add"
                        },
                        {
                            xtype: Gtk.Button,
                            listeners : {
                                clicked : function (self) {
                                    
                                    
                                 
                                       
                                    
                                    
                                }
                            },
                            label : "Switch Branch",
                            pack : "add"
                        },
                        {
                            xtype: Gtk.Button,
                            listeners : {
                                clicked : function (self) {
                                    
                                    
                                 
                                       
                                    
                                    
                                }
                            },
                            label : "Pull",
                            pack : "add"
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
                            listeners : {
                                cursor_changed : function (self) {
                                  // SEE SELECTION.CHANGED
                                  
                                  
                                  return;
                                  
                                    if (this.el.get_selection().count_selected_rows() < 1) {
                                        //nothing? - clea it?
                                        return;
                                    }
                                        var ret = {};         
                                    var model = this.get('/changedFilesStore');
                                
                                     var s = this.el.get_selection();
                                     var files = [];
                                    s.selected_foreach(function(model,p,iter) {
                                    
                                       files.push( model.get_value(iter, 0).value.get_string());
                                     
                                    });
                                    this.get('/patchview').showDiff(files); 
                                    //var value = ''+ ret.model.get_value(ret.iter, 1).value.get_string();
                                     //print("OUT?" + value);// id..
                                    // load the list in the right grid..
                                     
                                    return true;
                                
                                }
                            },
                            id : "reposView",
                            pack : "add",
                            init : function() {
                                XObject.prototype.init.call(this);
                                    var description = new Pango.FontDescription.c_new();
                               description.set_size(10000);
                                 this.el.modify_font(description);
                            
                                 this.selection = this.el.get_selection();
                                  this.selection.set_mode( Gtk.SelectionMode.MULTIPLE);
                                var _this = this;
                                
                                
                              this.selection.signal['changed'].connect(function() {
                                 _this.listeners.cursor_changed.apply(
                                      _this, [ _this, '']
                                   );
                                         });
                              },
                            items : [
                                {
                                    xtype: Gtk.ListStore,
                                    id : "reposStore",
                                    pack : "set_model",
                                    init : function() {
                                        XObject.prototype.init.call(this);
                                        this.el.set_column_types ( 7, [
                                           GObject.TYPE_STRING, // repo  
                                          GObject.TYPE_STRING, // current branch
                                          GObject.TYPE_STRING, // all branch      
                                          GObject.TYPE_STRING, // updated
                                           GObject.TYPE_BOOLEAN, // auto-commit
                                            GObject.TYPE_BOOLEAN, // auto-push
                                               GObject.TYPE_BOOLEAN // active
                                      ] );
                                    },
                                    load : function()
                                    {
                                        //this.insert(citer,iter,0);
                                        print("getting list");
                                        var tr = imports.Scm.Repo.Repo.list();
                                        
                                        this.el.clear();
                                        for(var i =0 ; i < tr.length; i++) {
                                            var ret = {  };
                                           
                                            this.el.append(ret);
                                            
                                            //print(JSON.stringify(ret,null,4));
                                             tr[i].getBranches();
                                              
                                            this.el.set_value(ret.iter, 0, '' +  tr[i].repopath.split('/').pop() );
                                            this.el.set_value(ret.iter, 1, '' + tr[i].currentBranch   );
                                            this.el.set_value(ret.iter, 2, '' + tr[i].branches.map(
                                                            function(e) { return e.name; 
                                                        }).join(', ') 
                                             );
                                            this.el.set_value(ret.iter, 3, '' + 'tbc' );        
                                            this.el.set_value(ret.iter, 4, tr[i].autocommit() );                
                                            this.el.set_value(ret.iter, 5, tr[i].autopush() );                        
                                            this.el.set_value(ret.iter, 6, true );      
                                            
                                        }     
                                    }
                                },
                                {
                                    xtype: Gtk.TreeViewColumn,
                                    min_width : 50,
                                    pack : "append_column",
                                    title : "Auto Commit",
                                    init : function() {
                                        XObject.prototype.init.call(this);
                                        this.el.add_attribute(this.items[0].el , 'active', 4 );
                                        this.items[0].el.set_activatable(true);
                                    
                                    },
                                    items : [
                                        {
                                            xtype: Gtk.CellRendererToggle,
                                            listeners : {
                                                toggled : function (self, path) {
                                                    var ret ={} ;
                                                    var store = this.get('/reposStore');
                                                    store.el.get_iter_from_string(ret, path);
                                                                                                                 
                                                    var value =   store.el.get_value(ret.iter,4).value.get_boolean();
                                                                                                                 
                                                    //print(JSON.stringify(value));
                                                    store.el.set_value(ret.iter,4, !value);
                                                    
                                                }
                                            },
                                            pack : "pack_start",
                                            mode : Gtk.CellRendererMode.ACTIVATABLE
                                        }
                                    ]
                                },
                                {
                                    xtype: Gtk.TreeViewColumn,
                                    min_width : 50,
                                    pack : "append_column",
                                    title : "Auto Push",
                                    init : function() {
                                        XObject.prototype.init.call(this);
                                        this.el.add_attribute(this.items[0].el , 'active', 5 );
                                          this.items[0].el.set_activatable(true);
                                    },
                                    items : [
                                        {
                                            xtype: Gtk.CellRendererToggle,
                                            listeners : {
                                                toggled : function (self, path) {
                                                    var ret ={} ;
                                                    var store = this.get('/reposStore');
                                                    store.el.get_iter_from_string(ret, path);
                                                                                                                 
                                                    var value =   store.el.get_value(ret.iter,5).value.get_boolean();
                                                                                                                 
                                                    print(JSON.stringify(value));
                                                    store.el.set_value(ret.iter,5, !value);
                                                    
                                                }
                                            },
                                            pack : "pack_start",
                                            mode : Gtk.CellRendererMode.ACTIVATABLE
                                        }
                                    ]
                                },
                                {
                                    xtype: Gtk.TreeViewColumn,
                                    min_width : 200,
                                    pack : "append_column",
                                    resizable : true,
                                    title : "Repo",
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
                                    title : "Current Branch",
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
                                },
                                {
                                    xtype: Gtk.TreeViewColumn,
                                    min_width : 50,
                                    pack : "append_column",
                                    title : "Last updated",
                                    init : function() {
                                        XObject.prototype.init.call(this);
                                        this.el.add_attribute(this.items[0].el , 'markup', 3 );
                                    
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
                                    resizable : false,
                                    title : "All Branches",
                                    init : function() {
                                        XObject.prototype.init.call(this);
                                        this.el.add_attribute(this.items[0].el , 'markup', 2 );
                                    
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
Clones.init();
XObject.cache['/Clones'] = Clones;
