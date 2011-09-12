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
Branches=new XObject({
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
    ' modal' : true,
    border_width : 3,
    default_height : 300,
    default_width : 500,
    title : "Branches",
    deletable : true,
    modal : true,
    show : function(c) {
        
        if (!this.el) {
            this.init();
        }
        var _this = this;
        this.get('/branchView').load();
        this.el.show_all();
        
        var run_ret = this.el.run();
        if (run_ret < 1 ) {
            return  "DONE";
        }
        print("RUN RETURN : " + run_ret);
        return "DONE";
        
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
                                
                                     return;
                                    var RemoteEdit=    imports.RemoteEdit.RemoteEdit
                                     RemoteEdit.repo = Remotes.repo;
                                    RemoteEdit.el.set_transient_for(Remotes.el);
                                
                                    var res =  RemoteEdit.show();
                                    
                                    if (res != false) {
                                        Remotes.repo.remotes(res);
                                    }
                                    
                                    this.get('/remotesStore').load();
                                
                                    
                                }
                            },
                            label : "Add",
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
                                cursor_changed : function (self)
                                {
                                
                                   return;
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
                            id : "branchView",
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
                                    id : "remotesStore",
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
                                        
                                        var tr = Remotes.repo.remotes();
                                        
                                        
                                        for(var i =0 ; i < tr.length; i++) {
                                            var ret = {  };
                                           
                                            this.el.append(ret);
                                            
                                            //print(JSON.stringify(ret,null,4));
                                             
                                              
                                            this.el.set_value(ret.iter, 0, ''  +  tr[i].name );
                                            this.el.set_value(ret.iter, 1, '' + tr[i].url );
                                           this.el.set_value(ret.iter, 2, '' + tr[i].type );
                                     
                                            
                                        }     
                                    }
                                },
                                {
                                    xtype: Gtk.TreeViewColumn,
                                    min_width : 70,
                                    pack : "append_column",
                                    resizable : true,
                                    title : "Name",
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
                                    min_width : 70,
                                    pack : "append_column",
                                    resizable : true,
                                    title : "Type",
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
                                },
                                {
                                    xtype: Gtk.TreeViewColumn,
                                    min_width : 200,
                                    pack : "append_column",
                                    title : "URL",
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
Branches.init();
XObject.cache['/Branches'] = Branches;
