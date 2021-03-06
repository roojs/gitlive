Gtk = imports.gi.Gtk;
GObject = imports.gi.GObject;


Browser = {
    //Toolbar : imports.Toolbar.Browser.Toolbar,
    View    : imports.View.Browser.View,
    //Statusbar : imports.Statusbar.Browser.Statusbar
};

 

Browser.Tab = new GType({
    parent: Gtk.VBox.type,
    name: "BrowserTab",
    properties: [{name: "web_view",
		  type: GObject.TYPE_OBJECT,
		  nick: "WebView",
		  blurb: "The tab's represented BrowserView",
		  object_type: Browser.View,
		  flags: (GObject.ParamFlags.CONSTRUCT | GObject.ParamFlags.READABLE | GObject.ParamFlags.WRITABLE)}],
    init: function (self)
    {
        // Private
        //var toolbar = new Browser.Toolbar();
        var scroll_view = new Gtk.ScrolledWindow();
        //var statusbar = new Browser.Statusbar();
        var tab_label;

        // Public
        this.get_toolbar = function ()
        {
            return toolbar;
        };

        this.get_web_view = function ()
        {
            return self.web_view;
        };

        this.set_tab_label = function (new_tab_label)
        {
            tab_label = new_tab_label;
        };

        this.get_tab_label = function ()
        {
            return tab_label;
        };
/*
        this.get_statusbar = function ()
        {
            return statusbar;
        };
*/
        // Implementation
        if(this.web_view == null)
        	this.web_view = new Browser.View();
        
        //this.web_view.set_tab(this);

        scroll_view.smooth_scroll = true;
        scroll_view.add(this.web_view);
        scroll_view.set_policy(Gtk.PolicyType.AUTOMATIC,
                               Gtk.PolicyType.AUTOMATIC);

        //this.pack_start(toolbar);
        this.pack_start(scroll_view, true, true);
        //this.pack_start(statusbar);
        this.show_all();
    }
});