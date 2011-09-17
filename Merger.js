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
    
    
         Merger.loading = true; // stop change firing on combos.
         /// load up branches
         
         this.get('/historyTreeStore').el.clear();
         this.get('/changedFilesStore').el.clear();
         this.get('/patchview').clear();
        
         
         
         this.get('/workingCombo').load(Merger.repo.branches);
         
         this.get('/releaseCombo').load(Merger.repo.branches);
    
    
    
    
         Merger.loading = false;
    
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
                            xtype: Gtk.Label,
                            label : "Working Branch"
                        },
                        {
                            xtype: Gtk.ComboBox,
                            listeners : {
                                changed : function (self) {
                                   this.get('/historyTreeStore').loadTree();
                                }
                            },
                            id : "workingCombo",
                            init : function() {
                                this.el = new Gtk.ComboBox.with_entry();
                                
                                
                                this.model  = new XObject(this.model);
                                this.model.init();
                                this.el.set_model(this.model.el);
                                this.el.set_entry_text_column (0);
                                 XObject.prototype.init.call(this);
                                
                            },
                            load : function(tr)
                            {
                                //this.insert(citer,iter,0);
                                this.model.el.clear();
                                
                                var master = false;
                                var working = false;
                                
                                for(var i =0 ; i < tr.length; i++) {
                                    if (!tr[i].name.length) {
                                        continue;
                                    }
                                    var ret = {  };
                                    this.model.el.append(ret);
                                    //print(JSON.stringify(ret,null,4));
                                    if (tr[i].name == 'master') {
                                        master = i;
                                    }
                                    if (tr[i].name == 'working') {
                                        working = i;
                                    }          
                                    this.model.el.set_value(ret.iter, 0, '' + tr[i].name );
                                    this.model.el.set_value(ret.iter, 1, '' + tr[i].rev  );
                             
                                    
                                }     
                                if (master !== false) {
                                    this.el.set_active(master);
                                }
                                if (working !== false) {
                                    this.el.set_active(working);
                                }
                                
                            },
                            model : {
                                xtype: Gtk.ListStore,
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
                            xtype: Gtk.Label,
                            label : "Release Branch"
                        },
                        {
                            xtype: Gtk.ComboBox,
                            listeners : {
                                changed : function (self) {
                                   this.get('/historyTreeStore').loadTree();
                                }
                            },
                            id : "releaseCombo",
                            init : function() {
                                this.el = new Gtk.ComboBox.with_entry();
                                
                                
                                this.model  = new XObject(this.model);
                                this.model.init();
                                this.el.set_model(this.model.el);
                                this.el.set_entry_text_column (0);
                                 XObject.prototype.init.call(this);
                                
                            },
                            load : function(tr)
                            {
                                //this.insert(citer,iter,0);
                                this.model.el.clear();
                                
                                var master = false;
                                var release = false;
                                
                                for(var i =0 ; i < tr.length; i++) {
                                    var ret = {  };
                                    if (!tr[i].name.length) {
                                        continue;
                                    }
                                    
                                    this.model.el.append(ret);
                                    //print(JSON.stringify(ret,null,4));
                                    if (tr[i].name == 'master') {
                                        master = i;
                                    }
                                    if (tr[i].name == 'release') {
                                        release = i;
                                    }
                                     
                                    this.model.el.set_value(ret.iter, 0, '' + tr[i].name );
                                    this.model.el.set_value(ret.iter, 1, '' + tr[i].rev  );
                             
                                    
                                }     
                                if (master !== false) {
                                    this.el.set_active(master);
                                }
                                if (release !== false) {
                                    this.el.set_active(release);
                                }
                                
                            },
                            model : {
                                xtype: Gtk.ListStore,
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
                                                    
                                                    
                                                   
                                                    if (model.release === false) {
                                                        return;
                                                    }
                                                    model.rev = value;
                                                   
                                                    var files = Merger.repo.changedFiles('/',   'rev', model.release + '..' + value);
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
                                                    release : false,
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
                                                    },
                                                    loadTree : function() {
                                                    
                                                       this.working = false;
                                                       if (Merger.loading) {
                                                            return;
                                                       }
                                                       
                                                       
                                                       var wid = this.get('/workingCombo').el.get_active();
                                                       var rid = this.get('/releaseCombo').el.get_active();
                                                       if (wid < 0 || rid < 0 || rid == wid) {
                                                            return;
                                                       }
                                                       
                                                       var w = Merger.repo.branches[wid];
                                                       var r = Merger.repo.branches[rid];
                                                       
                                                    
                                                    
                                                        var rev = r.name + '..' + w.name;
                                                        this.release = r.name;
                                                        
                                                        // this takes some time, lets. try and dialog it..
                                                    
                                                        
                                                        
                                                        
                                                        var msg = new Gtk.MessageDialog( {
                                                            buttons : Gtk.ButtonsType.NONE,
                                                            text: "Loading History"
                                                            
                                                        });
                                                        
                                                        msg.set_transient_for(Merger.el);
                                                        msg.set_modal(true);
                                                        msg.show_all();
                                                    
                                                        var hist = Merger.repo.dayTree('/', false, 'rev', rev);
                                                        msg.hide();
                                                        
                                                        this.load(hist);
                                                            
                                                           
                                                    }
                                                },
                                                {
                                                    xtype: Gtk.TreeViewColumn,
                                                    pack : "append_column",
                                                    title : "Changes",
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
                                                    var files = this.files();
                                                    this.get('/patchview').showDiff(files); 
                                                    //var value = ''+ ret.model.get_value(ret.iter, 1).value.get_string();
                                                     //print("OUT?" + value);// id..
                                                    // load the list in the right grid..
                                                     
                                                    return true;
                                                
                                                }
                                            },
                                            id : "changedFilesView",
                                            pack : "add",
                                            files : function() {
                                                 if (this.el.get_selection().count_selected_rows() < 1) {
                                                    //nothing? - clea it?
                                                    return [];
                                                }
                                            
                                                var ret = {};         
                                             
                                            
                                                 var s = this.el.get_selection();
                                                 var files = [];
                                                  s.selected_foreach(function(model,p,iter) {
                                                
                                                   files.push( model.get_value(iter, 0).value.get_string());
                                                 
                                                });
                                                return files;
                                            },
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
                                            listeners : {
                                                clicked : function (self) {
                                                    
                                                     
                                                     var model = this.get('/historyTreeStore');
                                                    
                                                    if (model.release === false) {
                                                        return;
                                                    }
                                                    
                                                 
                                                    var files = this.get('/changedFilesView').files();
                                                    
                                                     if (!files.length) {
                                                        return; // error.!
                                                    }
                                                    var diff = Merger.repo.diff(files, model.release, model.rev);
                                                   
                                                   
                                                   print("history?");
                                                   
                                                    
                                                    var history =  Merger.repo.history(files, 1, 'rev', model.rev);
                                                    
                                                    print("History" + JSON.stringify(history, null,4));
                                                    
                                                    Commit = imports.Commit.Commit;
                                                
                                                    Commit.el.set_modal(true);
                                                    Commit.el.set_transient_for(Merger.el);
                                                
                                                    var ce = Commit.show({
                                                        repo : Merger.repo,
                                                        files : files,
                                                        release : model.release,
                                                        rev : model.rev,
                                                        author : history[0].changeby,
                                                        changed : history[0].changed_raw
                                                        
                                                    
                                                    });
                                                    if (ce === false ) {
                                                        return;
                                                    }
                                                    
                                                    var diff = Merger.repo.diff(files, model.release, model.rev);
                                                    
                                                    
                                                    print(JSON.stringify(ce,null,4));
                                                    //.... commit!!!
                                                    
                                                    imports.gitlive.monitor.pause();
                                                    
                                                    Merger.repo.checkout(model.release);
                                                    
                                                    Merger.repo.applyPatch(diff);
                                                    
                                                    var author = Merger.repo.parseAuthor(ce.author);
                                                    
                                                    // add all the files..
                                                    Merger.repo.add(files);
                                                    Merger.repo.commit({
                                                        name : author.name,
                                                        email : author.email,
                                                        author : ce.author,
                                                        changed : ce.changed,
                                                        message : ce.message
                                                        
                                                    });
                                                    
                                                    Merger.repo.checkout(model.working);
                                                    
                                                    imports.gitlive.monitor.resume();
                                                    
                                                    
                                                    
                                                    
                                                    
                                                    
                                                
                                                
                                                }
                                            },
                                            label : "Commit diff (no merge)"
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
                                            clear : function() {
                                                
                                                
                                                
                                                 
                                               // remove..
                                                var s  = "document.body.textContent='';"
                                                    
                                                this.el.execute_script(s);
                                                    
                                                    
                                                
                                                
                                                
                                            },
                                            showDiff : function(files) {
                                                this.clear();
                                                
                                                
                                                 var model = this.get('/historyTreeStore');
                                                
                                                if (model.release === false) {
                                                    return;
                                                }
                                                
                                                var diff = Merger.repo.diff(files, model.release, model.rev);
                                                
                                               // remove..
                                                var s  = "var pre  = document.createElement('pre'); document.body.appendChild(pre);";
                                                s += "pre.textContent =  " +
                                                         JSON.stringify(Merger.repo.lastCmd + "\n") + '+  ' + 
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
            id : "ok_button",
            label : "Close",
            pack : "add_action_widget,1"
        }
    ]
});
Merger.init();
XObject.cache['/Merger'] = Merger;
