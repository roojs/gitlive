<?php

$ar = explode("\n", 
"app.Builder.js
app.MailArchiver
app.Mailer
app.MailfortTools
etc.FlexySpam
etc.Texon
gitlive
netsuite.bloomgrow
pear
Pman.Admin
Pman.Base
Pman.Builder
Pman.Cash
Pman.Cms
Pman.Core
Pman.Dav
Pman.Documents
Pman.Fax
Pman.Ftp
Pman.Git
Pman.Mail
Pman.MTrack
Pman.Signup
Pman.Timesheet
roojs1
txt.MailfortNotes
web.annerley
web.aspencart
web.aspengbic
web.Aviation
web.bloomandgrowasia.com
web.Builder
web.Dealflow
web.facebook1
web.FlexyShop
web.FlexyShop2
web.FlexySpam
web.greenpeace.skype
web.hex
web.hex.new
web.hhyc_membership_system
web.Iconstruction
web.intimateplay.com
web.iris
web.MediaOutreach
web.mtrack
web.Netsuite
web.oxfam_translators
web.Pman
web.Ris
web.roojsolutions
web.seedling
web.storkboxes
web.Texon
");




$dir = '/home/alan/gitlive';
foreach($ar as $a) {
	$a = trim($a);
	if (!file_exists($dir.'/'. $a)) {

		$cmd = 'git clone http://git.roojs.com:8081/'. $a;
echo $cmd ."\n";
		`$cmd`;
	}
	if (file_exists($dir. '/'. $a.'.komodoproject')) {
		continue;
	}
	$m = md5(rand());
	$mm = array();
	$b = array(8,4,4,4,12);
	$bl = 0;
	foreach($b as $bb) {
		$mm[] = substr($m, $bl,$bb);
		$bl+=$bb;
	}
	$mm = implode('-', $mm);

file_put_contents($dir. '/'. $a.'.komodoproject',
'<?xml version="1.0" encoding="UTF-8"?>
<!-- Komodo Project File - DO NOT EDIT -->
<project id="'.$mm.'" kpf_version="5" name="'.$a.'.komodoproject">
<preference-set idref="'.$mm.'">
  <string relative="path" id="import_dirname">'.$a.'</string>
  <string id="import_exclude_matches">*.*~;*.bak;*.tmp;CVS;.#*;*.pyo;*.pyc;.svn;.git;.hg;.bzr;*%*;tmp*.html;.DS_Store;*.swp;*.kpf;*.komodoproject;*.komodoto
ols</string>
  <string id="import_include_matches"></string>
  <string relative="path" id="last_local_directory">'.$a.'</string>
</preference-set>
</project>');
 
}

