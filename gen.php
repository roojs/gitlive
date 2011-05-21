<?php

// A script to create komodo projects for all git repos.. need to work out how to do it for
// remote list..


$ar = explode("\n", 
 
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

