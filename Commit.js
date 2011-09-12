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
Commit=new XObject({
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
    default_height : 150,
    default_width : 500,
    title : "Remotes",
    deletable : true,
    modal : true,
    show : function(c) {
        
        if (!this.el) {
            this.init();
        }
        var _this = this;
        //this.get('/remotesStore').load();
       // this.get('/remoteURL').el.get_child().set_text('');
        //this.get('/remoteName').el.set_text('');
        
        
        this.el.show_all();
        
        var run_ret = this.el.run();
        if (run_ret < 1 ) {
            return false;
        }
        //var ret=  {
        //    url :  this.get('/remoteURL').el.get_child().get_text(),
        //    name :  this.get('/remoteName').el.get_text()
        //};
        return true;
        return ret;
        
        
        
    },
    items : [
        {
            xtype: Gtk.VBox,
            pack : function(p,e) {
                    p.el.get_content_area().pack_start(e.el,true,true,10);
                },
            items : [
                {
                    xtype: Gtk.HBox,
                    pack : "pack_start,false,true,10",
                    items : [
                        {
                            xtype: Gtk.Label,
                            label : "Fixes",
                            pack : "pack_start,false,false,10",
                            width_request : 50
                        },
                        {
                            xtype: Gtk.ComboBox,
                            listeners : {
                                changed : function (self) {
                                   var val = this.el.get_child().get_text();
                                   print(JSON.stringify(val));
                                   if (!val.length) {
                                       return;
                                   }
                                   
                                   var name = this.get('/remoteName').el.get_text();
                                   if (name.length) {
                                       return;
                                   }
                                   // fill in name
                                   var val = imports.Scm.Git.Repo.Repo.parseURL(val);
                                   if ((typeof(val.host) != 'undefined') && val.host.length) {
                                       var host = val.host;
                                       // need to add github owner...
                                        if (host.match(/github.com$/)) {
                                          host += '.' + val.path.split('/').shift();
                                        }
                                   
                                   
                                        this.get('/remoteName').el.set_text(host);
                                   }
                                    
                                   
                                }
                            },
                            id : "commitFixes",
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
                        }
                    ]
                },
                {
                    xtype: Gtk.HBox,
                    pack : "pack_start,false,true,10",
                    items : [
                        {
                            xtype: Gtk.Label,
                            label : "Date",
                            pack : "pack_start,false,false,10",
                            width_request : 50,
                            xalign : 1
                        },
                        {
                            xtype: Gtk.Entry,
                            id : "commitDate"
                        }
                    ]
                },
                {
                    xtype: Gtk.HBox,
                    pack : "pack_start,false,true,10",
                    items : [
                        {
                            xtype: Gtk.Label,
                            label : "Author",
                            pack : "pack_start,false,false,10",
                            width_request : 50,
                            xalign : 1
                        },
                        {
                            xtype: Gtk.Entry,
                            id : "commitDate"
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
            label : "Add",
            pack : "add_action_widget,1"
        }
    ]
});
Commit.init();
XObject.cache['/Commit'] = Commit;
