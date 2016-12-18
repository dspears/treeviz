<?
ini_set('memory_limit','1724M');
ini_set('max_execution_time', 3600*12);
require "../../jet/config/config.php";
require "../../toolkit/WsaToolkit.php";
// Configure a Database Connection:
$db = new WsaDb(HOST, DB, MYSQL_LOGIN, MYSQL_PASSWORD);
$top1mTable = new WsaTable($db,'top1mV2', 'admin', $firephp, true, false);
$tldTable = new WsaTable($db,'tlds', 'admin', $firephp, true, false);
$tlds = $tldTable->get();
$tlds = WSA::setKey($tlds,'tld');

$csvFile = new WsaCsvFile('../../jet/data/top-1m.s2.csv'); // top-10k.csv
$top1m = $csvFile->read()->getRows(); // TODO: make the API $csvFile->get(); same as WsaTable
echo "Found ".count($top1m)." rows<br>\n";

$junkSites = array(
  "serve.com",
  "empowernetwork.com",  
);

$tbl = array();

$rowNum = 0;
foreach ($top1m as $siteRow) {

  $url = $siteRow['site'];
  $firstSlash = strpos($url,'/');
  if ($firstSlash === false) {
    $domain = $url;
    $dir = '';
  } else {
    $domain = substr($url,0,$firstSlash);
    $dir = substr($url,$firstSlash+1);
  }
  
  $domainParts = array_reverse(explode('.',$domain));
  unset($entry);
  $entry = array();
  $entry['url'] = $url;
  $entry['rank'] = $siteRow['rank'];
  $labelCount = count($domainParts);
  for ($i=0; $i<$labelCount; $i++) {
    $entry["d{$i}"] = $domainParts[$i];
  }
  $entry['site'] = determineSiteName($domainParts,$labelCount);
  $entry['path'] = $dir;
  $d0 = $entry['d0'];
  if (isset($tlds[$d0])) {
    $entry['tldtype'] = $tlds[$d0]['tldtype'];
    $entry['country'] = $tlds[$d0]['country'];
  }
  $tbl[] = $entry;
  $rowNum++;
  if (($rowNum % 5000) == 0) {
    echo "$rowNum<br>";
    echo "Saving...<br>";
    flush();
    $top1mTable->saveRows($tbl);
    echo "done.<br>";
    flush();
    unset($tbl);
    $tbl = array();
  }
}
echo "Finished.";



function determineSiteName($domainParts, $labelCount) {
  static $sites = array();
  $site = '';
  if ($labelCount == 2) {
    $site = $domainParts[1];
  } else {
    for ($i=1; $i<$labelCount; $i++) {
      if (isset($sites[$domainParts[$i]])) {
        $site = $domainParts[$i];
        break;
      }
    }
  }
  if (empty($site)) $site = $domainParts[$labelCount - 1];
  $sites[$site] = $site;
  return $site;
}

