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
    default_height : 700,
    default_width : 800,
    id : "Merger",
    title : "Merger",
    deletable : true,
    show : function(c) {
        
        if (!this.el) {
            this.init();
        }
        var _this = this;
         
          //this.el.set_title("Merger - ??? ");
    //   this.el.set_title("Merger - " + this.repo.repopath);
    
    
    
         /// load up branches
         this.get('/workingCombo').model.load(Merger.repos.branches);
         
    
    
        this.el.show_all();
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
                                    
                                    
                                 
                                    var hist = Merger.repo.dayTree('/', false, 'rev', 'github..master');
                                    this.get('/historyTreeStore').load(hist);
                                        
                                       
                                    
                                    
                                }
                            },
                            label : "Select Branch",
                            pack : "add"
                        },
                        {
                            xtype: Gtk.Label,
                            label : "Working Branch"
                        },
                        {
                            xtype: Gtk.ComboBox,
                            id : "workingCombo",
                            init : function() {
                                this.el = new Gtk.ComboBox.with_entry();
                                
                                
                                this.model  = new XObject(this.model);
                                this.model.init();
                                this.el.set_model(this.model.el);
                                 XObject.prototype.init.call(this);
                                
                            },
                            model : {
                                xtype: Gtk.ListStore,
                                id : "workingList",
                                load : function(tr)
                                {
                                    //this.insert(citer,iter,0);
                                    this.el.clear();
                                    
                                    for(var i =0 ; i < tr.length; i++) {
                                        var ret = {  };
                                        this.el.append(ret);
                                        //print(JSON.stringify(ret,null,4));
                                         
                                          
                                        this.el.set_value(ret.iter, 0, ''  +  tr[i].name );
                                        this.el.set_value(ret.iter, 1, '' + tr[i].rev  );
                                 
                                        
                                    }     
                                },
                                init : function() {
                                    XObject.prototype.init.call(this);
                                    this.el.set_column_types ( 3, [
                                           GObject.TYPE_STRING, // file  
                                          GObject.TYPE_STRING, // added
                                          GObject.TYPE_STRING, // removed
                                      ] );
                                }
                            }
                        }
                    ]
                },
                {
                    xtype: Gtk.VPaned,
                    pack : "pack_end,true,true,0",
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
                                            listeners : {
                                                cursor_changed : function (self) {
                                                
                                                    if (this.el.get_selection().count_selected_rows() < 1) {
                                                        //nothing?
                                                        return;
                                                    }
                                                    var model = this.get('/historyTreeStore');
                                                    var ret = {};        
                                                     var s = this.el.get_selection();
                                                    s.get_selected(ret);
                                                    
                                                    var value = ''+ ret.model.get_value(ret.iter, 1).value.get_string();
                                                     print("OUT?" + value);// id..
                                                    // load the list in the right grid..
                                                    var Repo = imports.Scm.Git.Repo.Repo;
                                                    
                                                    
                                                   
                                                    var files = Merger.repo.changedFiles('/',   'rev', 'github..' + value);
                                                    this.get('/changedFilesStore').load(files);
                                                    return true;
                                                
                                                }
                                            },
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
                                                    id : "historyTreeStore",
                                                    pack : "set_model",
                                                    init : function() {
                                                        XObject.prototype.init.call(this);
                                                        this.el.set_column_types ( 3, [
                                                           GObject.TYPE_STRING, // title 
                                                          GObject.TYPE_STRING, // rev 
                                                      ] );
                                                    },
                                                    load : function(tr,iter)
                                                    {
                                                        //this.insert(citer,iter,0);
                                                        if (!iter) {
                                                            this.el.clear();
                                                        }
                                                        
                                                        for(var i =0 ; i < tr.length; i++) {
                                                            var ret = {  };
                                                            if (iter) {
                                                                this.el.insert(ret ,iter,-1);
                                                            } else {
                                                                this.el.append(ret);
                                                            }
                                                            //print(JSON.stringify(ret,null,4));
                                                             
                                                              
                                                            this.el.set_value(ret.iter, 0, ''  +  tr[i].text );
                                                            this.el.set_value(ret.iter, 1, '' + tr[i].rev  );
                                                     
                                                            if (tr[i].children && tr[i].children.length) {
                                                                this.load(tr[i].children, ret.iter);
                                                            }
                                                        }     
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
                                            listeners : {
                                                cursor_changed : function (self) {
                                                  // SEE SELECTION.CHANGED
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
                                            id : "changedFilesView",
                                            pack : "add",
                                            init : function() {
                                                XObject.prototype.init.call(this);
                                                    var description = new Pango.FontDescription.c_new();
                                               description.set_size(8000);
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
                                                    id : "changedFilesStore",
                                                    pack : "set_model",
                                                    init : function() {
                                                        XObject.prototype.init.call(this);
                                                        this.el.set_column_types ( 3, [
                                                           GObject.TYPE_STRING, // file  
                                                          GObject.TYPE_STRING, // added
                                                          GObject.TYPE_STRING, // removed
                                                      ] );
                                                    },
                                                    load : function(tr)
                                                    {
                                                        //this.insert(citer,iter,0);
                                                        this.el.clear();
                                                        for(var i =0 ; i < tr.length; i++) {
                                                            var ret = {  };
                                                           
                                                            this.el.append(ret);
                                                            
                                                            //print(JSON.stringify(ret,null,4));
                                                             
                                                              
                                                            this.el.set_value(ret.iter, 0, ''  +  tr[i].filename );
                                                            this.el.set_value(ret.iter, 1, '' + tr[i].added  );
                                                            this.el.set_value(ret.iter, 2, '' + tr[i].removed  );
                                                     
                                                            
                                                        }     
                                                    }
                                                },
                                                {
                                                    xtype: Gtk.TreeViewColumn,
                                                    resizable : true,
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
                                                    title : "Removed",
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
                            xtype: Gtk.VBox,
                            items : [
                                {
                                    xtype: Gtk.HBox,
                                    pack : "pack_start,false,false,0",
                                    items : [
                                        {
                                            xtype: Gtk.Button,
                                            label : "Commit diff (no merge)"
                                        },
                                        {
                                            xtype: Gtk.Button,
                                            label : "Commit diff (merge after)"
                                        }
                                    ]
                                },
                                {
                                    xtype: Gtk.ScrolledWindow,
                                    pack : "pack_end,true,true,0",
                                    init : function() {
                                        XObject.prototype.init.call(this);
                                          this.el.set_policy (Gtk.PolicyType.AUTOMATIC, Gtk.PolicyType.AUTOMATIC)
                                    },
                                    items : [
                                        {
                                            xtype: WebKit.WebView,
                                            id : "patchview",
                                            pack : "add",
                                            showDiff : function(files) {
                                                
                                             
                                                var diff = Merger.repo.diff(files, 'github', 'master');
                                                
                                               // remove..
                                                var s  = "document.body.textContent='';var pre  = document.createElement('pre'); document.body.appendChild(pre);";
                                                s += "pre.textContent =  " +
                                                         JSON.stringify(repo.lastCmd + "\n") + '+  ' + 
                                                       JSON.stringify(diff) + ";";
                                                print(s);
                                                    
                                                this.el.execute_script(s);
                                                    
                                                    
                                                
                                                
                                                
                                            }
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
