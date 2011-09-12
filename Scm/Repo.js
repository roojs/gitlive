var XObject = imports.XObject.XObject;

var GLib  = imports.gi.GLib;
var File = imports.File.File;
// mix of SCM and Repo class from mtrack.

//var SCM = imports.SCM.SCM;

_abstract = function() {
    throw "abstract function not implemented";
}

Repo = XObject.define(
    function(cfg) {
        // cal parent?
        if (typeof(cfg) != 'object') {
            return;
        } 
        XObject.extend(cfg);
         
    },
    Object,
    {
            
        id : null,
         scmtype : null,
        repopath : null,
        browserurl : null,
        browsertype : null,
        description : null,
        parent : '',
        clonedfrom : null,
        serverurl : null,

    
        links_to_add : false,
        links_to_remove : false,
        links : false,
        
        
        repopath : '',
        
       
        /** Returns an array keyed by possible branch names.
        * The data associated with the branches is implementation
        * defined.
        * If the SCM does not have a concept of first-class branch
        * objects, this function returns null */
        getBranches : _abstract,
        
        /** Returns an array keyed by possible tag names.
        * The data associated with the tags is implementation
        * defined.
        * If the SCM does not have a concept of first-class tag
        * objects, this function returns null */
        getTags : _abstract,
        
        /** Enumerates the files/dirs that are present in the specified
        * location of the repository that match the specified revision,
        * branch or tag information.  If no revision, branch or tag is
        * specified, then the appropriate default is assumed.
        *
        * The second and third parameters are optional; the second
        * parameter is one of 'rev', 'branch', or 'tag', and if specifed
        * the third parameter must be the corresponding revision, branch
        * or tag identifier.
        *
        * The return value is an array of MTrackSCMFile objects present
        * at that location/revision of the repository.
        */
        readdir : _abstract,
        
        /** Queries information on a specific file in the repository.
        *
        * Parameters are as for readdir() above.
        *
        * This function returns a single MTrackSCMFile for the location
        * in question.
        */
        file : _abstract,
        
        /** Queries history for a particular location in the repo.
        *
        * Parameters are as for readdir() above, except that path can be
        * left unspecified to query the history for the entire repo.
        *
        * The limit parameter limits the number of entries returned; it it is
        * a number, it specifies the number of events, otherwise it is assumed
        * to be a date in the past; only events since that date will be returned.
        *
        * Returns an array of MTrackSCMEvent objects.
        */
        history : _abstract,
        
        /** Obtain the diff text representing a change to a file.
        *
        * You may optionally provide one or two revisions as context.
        *
        * If no revisions are passed in, then the change associated
        * with the location will be assumed.
        *
        * If one revision is passed, then the change associated with
        * that event will be assumed.
        *
        * If two revisions are passed, then the difference between
        * the two events will be assumed.
        */
        diff : _abstract,
        
        /** Determine the next and previous revisions for a given
        * changeset.
        *
        * Returns an array: the 0th element is an array of prior revisions,
        * and the 1st element is an array of successor revisions.
        *
        * There will usually be one prior and one successor revision for a
        * given change, but some SCMs will return multiples in the case of
        * merges.
        */
        getRelatedChanges : _abstract,
        
        /** Returns a working copy object for the repo
        *
        * The intended purpose is to support wiki page modifications, and
        * as such, is not meant to be an especially efficient means to do so.
        */
        getWorkingCopy : _abstract,
        
        /** Returns meta information about the SCM type; this is used in the
        * UI and tooling to let the user know their options.
        *
        * Returns an array with the following keys:
        * 'name' => 'Mercurial', // human displayable name
        * 'tools' => array('hg'), // list of tools to find during setup
        */
        getSCMMetaData : _abstract,
        
        /** Returns the default 'root' location in the repository.
        * For SCMs that have a concept of branches, this is the empty string.
        * For SCMs like SVN, this is the trunk dir */
        getDefaultRoot : function() {
             return '';
        },

        
          
        
        /* takes an MTrackSCM as a parameter because in some bootstrapping
         * cases, we're actually MTrack_Repo and not the end-class.
         * MTrack_Repo calls the end-class method and passes itself in for
         * context */
        reconcileRepoSettings  : _abstract,
        
        
        
        
        getBrowseRootName   : _abstract, 
        
        resolveRevision :function(rev, object, ident)
        {
            if (rev !== false) {
                return rev;
            }
            
            if (object === false) {
                return false;
            }
            
            switch (object) {
                case 'rev':
                    rev = ident;
                    break;
                
                case 'branch':
                    branches = this.getBranches();
                    rev = typeof(branches[ident]) == 'undefined' ? false : branches[ident];
                    break;
                
                case 'tag':
                    tags = this.getTags();
                    rev = typeof(tags[ident]) == 'undefined' ? false : tags[ident];
                    break;
            }
            if (rev === false) {
                throw   "don't know which revision to use (rev,object,ident)";
            }
            return rev;
        }
        
    
     /*
    
    function reconcileRepoSettings()
    {
        $c = self::Factory(array('scmtype'=>$this->scmtype));
        $s->reconcileRepoSettings($this);
    }
    
    function getServerURL()
    {
        if ($this->serverurl) {
            return $this->serverurl;
        }
        
        return null;
    }

    function getCheckoutCommand() {
        $url = $this->getServerURL();
        if (strlen($url)) {
          return $this->scmtype . ' clone ' . $this->getServerURL();
        }
        return null;
    }

    function canFork() {
        return false;
    }

    function getWorkingCopy() {
         throw new Exception("cannot getWorkingCopy from a generic repo object");
    }
    /*
    function deleteRepo(MTrackChangeset $CS) {
        MTrackDB::q('delete from repos where repoid = ?', $this->repoid);
        mtrack_rmdir($this->repopath);
    }
     
  

// these are needed just to implement the abstract interface..
    function getBranches() {}
    function getTags() {}
    function readdir($path, $object = null, $ident = null) {}
    function file($path, $object = null, $ident = null) {}
    function history($path, $limit = null, $object = null, $ident = null){}
    function diff($path, $from = null, $to = null) {}
    function getRelatedChanges($revision) {}
    function getSCMMetaData() { return null; }
    /**
     *  converts a commit log message (cached locally into a working object..)
     *  see Browse.php
     */
    /*
    function commitLogToEvent($str) {
        throw new Exception("no implementation for commitLogToEvent");
    }
    */
});


/*
 
    static $scms = array();
    static function factory($ar)
    {
        //print_r($ar);
        $type = ucfirst($ar['scmtype']);
        $fn = 'MTrack/SCM/'.$type .'/Repo.php';
        $cls = 'MTrack_SCM_'.$type .'_Repo';
        require_once $fn;
        
        $ret = new $cls($ar);
        
        return $ret;
        
    }
    
 
    static function getAvailableSCMs()
    {
        $ret = array();
        $ar = scandir(dirname(__FILE__).'/SCM');
        
        foreach($ar as $a) {
            if (empty($a) || $a[0] == '.') {
                continue;
            }
            $fn = dirname(__FILE__).'/SCM/'.$a.'/Repo.php';
            if (!file_exists($fn)) {
                continue;
            } 
            $ret[$a] = MTrack_Repo::factory(array('scmtype'=> $a));
            
        }
        return $ret;
    }  
*/

Repo._list  = false;
Repo.list = function()
{
    
    if (Repo._list !== false) {
        return Repo._list;
    }
    Repo._list  = [];
    var dir = GLib.get_home_dir() + '/gitlive';
    var ar = File.list(dir );
    print(JSON.stringify(ar));
    ar.forEach(function(f) {
        if (File.exists(dir + '/' + f +'/.git')) {
            Repo._list.push(new imports.Scm.Git.Repo.Repo({repopath : dir  +'/' + f }))
            
        }
        
    });
    
    return Repo._list;
    
    
    
}

