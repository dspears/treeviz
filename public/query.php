<?php
error_reporting(E_ALL ^ E_NOTICE);
require "../../jet/config/config.php";
require "../../toolkit/WsaToolkit.php";
WSA::app("Jet");

// Configure a Database Connection:
$db = new WsaDb(HOST, DB, MYSQL_LOGIN, MYSQL_PASSWORD);
// Setup a DB Table objects:
$topTbl = new WsaTable($db,'top10k','admin', $firephp, true, false);
$tableName = "domainsV2";
$treeTable = new WsaTable($db,$tableName,'admin', $firephp, true, false);

// Get query filters:
$n = $_REQUEST['n'];
if (empty($n)) $n = "All";
$d = $_REQUEST['d'];
if (empty($d)) $d = "All";
$s = $_REQUEST['s'];
$debug = $_REQUEST['debug'];

$t = $_REQUEST['t'];

switch ($t) {
  case 'top100':
    // Structure vs. Content
    $fields = "id,nodeType,nodeName,treepath,tleft,tright,url,rank,localRank,site,tldtype,country,numChildNodes,numLeaves,numDescendantNodes,numDescendantLeaves,source_id";
    // Query for all of structure and top 100 ranked domains:
    $sql = "SELECT $fields FROM $tableName WHERE nodeType='leaf' AND site NOT like 'x%' AND site NOT like 'porn%'  ORDER BY rank LIMIT 100";
    $rows = $treeTable->sql($sql)->get();
    $json = json_encode($rows);
    // TODO: Cache the resulting query?
    break;
  case 'q':
    // Content
    $fields = "id,nodeType,nodeName,treepath,tleft,tright,url,rank,localRank,site,tldtype,country,numChildNodes,numLeaves,numDescendantNodes,numDescendantLeaves,source_id";
    // Query for all of structure and top 100 ranked domains:
    $sql = "SELECT $fields FROM $tableName WHERE nodeType='leaf' AND site like '%$s%' ORDER BY rank LIMIT 200";
    $rows = $treeTable->sql($sql)->get();
    $json = json_encode($rows);
    break;
  case 'tree':
    // Structure vs. Content
    $fields = "id,nodeType,nodeName,treepath,tleft,tright,url,rank,site,tldtype,country,numChildNodes,numLeaves,numDescendantNodes,numDescendantLeaves,source_id";
    // Query for all of structure and top 100 ranked domains:
    //$sql = "(SELECT $fields FROM $tableName WHERE nodeType='leaf' ORDER BY rank LIMIT 100) UNION (SELECT $fields from $tableName WHERE nodeType='node') ORDER BY tleft";
    $sql = "SELECT $fields from $tableName WHERE nodeType='node' ORDER BY tleft";

    $rows = $treeTable->sql($sql)->get();
    $rows = __::filter($rows,function($row) { return !is_numeric($row['nodeName']); });
    $tree = new WsaTree($treeTable,'','');
    $tree->buildFromRows($rows);
    //WSA::dump($rows,'Results');
    $json = $tree->jsonEncode();

    // TODO: Cache the resulting json for the structure.  No need to re-run query, and build the tree structure each time!.
    if ($debug=='y') {
      WSA::dump($tree,'tree structure');
      exit;
    }
    break;
  default:
    $json = json_encode(array("status"=>"failed","msg"=>"unknown query type"));
}

header("Content-type: text/json");

echo $json;

?>