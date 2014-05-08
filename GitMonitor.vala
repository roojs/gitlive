 
public class GitMonitor : Monitor
{

 
    /**
     * @property {String} the "gitlive" directory, normally ~/gitlive
     *  dset by OWNER... - we should do this as a CTOR.
     *  
     */
    public string gitlive = '';
    
    
    public Array<GtkMonitorQueuequeue>;
    public bool queueRunning = false;
    
    public DateTime lastAdd;
     
     
    public void pause() {
        this.paused = true;
        // what does this do to the old one...
        this.queue = new Array<FileMonitor> ();
        StatusIcon.statusicon.set_from_stock( Gtk.Stock.MEDIA_PAUSE );

    }
    
    public void resume () {
        this.paused = false;
        this.queue = new Array<FileMonitor> ();
        StatusIcon.statusicon.set_from_stock( Gtk.Stock.MEDIA_PLAY );
        
        
    }
    /**
     * Start the monitoring
     * and run the queue every 500 milliseconds..
     *
     */
    public void start() {
        StatusIcon.statusicon.set_from_stock( Gtk.Stock.MEDIA_REFRESH );
        
         
        this.lastAdd = new DateTime.now(); 
        
        Timeout.add_full(GLib.PRIORITY_LOW, 500, () => {

            // call this.monitor on each of 'top'
            for(int i = 0; i < this.top.length ; i++) {
                this.monitor(this.top.index(i), ( fm,  f_orig,  of_orig,  event_type) => {
                    this.onEvent (fm,  f_orig,  of_orig,  event_type ) ;
                } );
            }
            StatusIcon.statusicon.set_from_stock( Gtk.Stock.MEDIA_PLAY );
             
           
            
            try { 
                var notification = new Notify.Notification({
                    "Git Live",
                    this.gitlive + "\nMonitoring " + _this.monitors.length + " Directories",
                     "dialog-information"
                });
        
                notification.set_timeout(5);
                notification.show();
            } catch(Error e) {
                print(e.toString());
            }

        });
        
        Timeout.add_full(GLib.PRIORITY_LOW, 1000, () => {
            //TIMEOUT", _this.queue.length , _this.queueRunning].join(', '));
            if (!_this.queue.length || _this.queueRunning) {
                return true;
            }

            var last = this.lastAdd.difference(new DateTime.now());

            
            //print("LAST RUN?" + last);
            
            if (last < 5 * Timespan.SECOND) { // wait 1/2 a seconnd before running.
                return 1;
            }
            //_this.lastAdd = new Date();
            //return 1;
        
            this.runQueue();
            return true;
        },null,null);
        
      
    }


    public void stop() {
        StatusIcon.statusicon.set_from_stock( Gtk.Stock.MEDIA_PAUSE );;
        base.stop();
    }
    
    
    public void monitor (string path, onEventHander fn , int depth = 0)
    {
        
        //var depth = typeof(depth) == 'number'  ? depth *1 : 0;
        
         
        // if we are not at top level.. and there is a .git directory  (it's a submodule .. ignore) 
        if (depth > 1 && GLib.file_test(path + '/.git' , GLib.FileTest.IS_DIR)) {
            return;
        }
        
        if (depth == 1) {
            // FIXME - check if repo is flagged as not autocommit..
            //var repo = imports.Scm.Repo.Repo.get(path);
            //if (!repo || !repo.autocommit()) {
            //    return;
            //} 
        }
        
        
        // check if the repo is to be monitored.
        //print("PATH : " + path);
        
        
        base.monitor(path,fn, depth);
    }

    
