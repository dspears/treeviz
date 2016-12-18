<!doctype html>
<head>
  <meta charset="utf-8" />
	<meta http-equiv="Content-type" content="text/html; charset=utf-8" />
</head>
<?php
/**
 * Retrieve a table of top level domain (tld) names from IANA.
 * 
 */
// For dev mode, turn on all PHP error messages:
error_reporting(E_ALL ^ E_NOTICE);
require "../../jet/config/config.php";
require "../../toolkit/WsaToolkit.php";

function file_get_contents_utf8($fn) {
  $content = file_get_contents($fn);
  return mb_convert_encoding($content, 'UTF-8',
      mb_detect_encoding($content, 'UTF-8, ISO-8859-1', true));
}

// Configure a Database Connection:
$db = new WsaDb(HOST, DB, MYSQL_LOGIN, MYSQL_PASSWORD);

$page = file_get_contents_utf8("http://www.iana.org/domains/root/db");
//$page = mb_convert_encoding($page,'UTF-8');

$dom = new DOMDocument();

libxml_use_internal_errors(true);

if (!$dom->loadHTML($page)) {
  echo "Errors encountered<br>\n";
  $errors='';
  foreach (libxml_get_errors() as $error)  {
    $errors.=$error->message.'<br>';
  }
  libxml_clear_errors();
  print "libxml errors:<br>$errors";
  return; 
}

$xpath = new DOMXPath($dom);

// TODO: Also parse out the link to the record for this tld.  We can then go out and
//   get the actual country name.  Or... pull from here: http://www.iso.org/iso/iso-3166-1_decoding_table
//

$rows = $xpath->query("//*/table[@id='tld-table']/tbody/tr");
$colNames = array("tld","tldtype","sponsor");
$results = array();
foreach ($rows as $row) {
  $cols = $xpath->query("td",$row);
  $entry = array();
  $i=0;
  foreach ($cols as $col) {
    // Get the text of the element using nodeValue:
    $entry[$colNames[$i++]] = $col->nodeValue;
  }
  $results[] = $entry;
  unset($entry);
}

$results = __::map($results,function($row) { $row['tld']=mb_substr($row['tld'],1); return $row; });

$renderer = new WsaClassicRenderer();
$renderer->table($results);

$tlds = new WsaTable($db,'tlds', 'admin', $firephp);
$tlds->saveRows($results,'tld');


