<?php
/**
 * This code builds a tree from the imported top1m.
 * Once the tree is built, it is indexed (left/right nested set and path methods).
 * Then the tree is written out to the database.
 *
 *
 * User: dspears
 *
 *
 */

ini_set('max_execution_time', 3600*12);
error_reporting(E_ALL ^ E_NOTICE);
require "../../jet/config/config.php";
require "../../toolkit/WsaToolkit.php";
WSA::app("Jet");

class TerminalLogger {
  public function log($s) { echo $s."\n"; }
}

class ProgressLogger {
  private $per;
  private $lineCount;
  public function __construct($per=200) {
    $this->per = $per;
    $this->lineCount = 0;
  }
  public function log($s) {
    if ($this->lineCount % $this->per == 0) {
      echo "(Skipped {$this->per} messages)\n";
      echo $this->lineCount.': '.$s."\n";
    }
    $this->lineCount++;
  }
}

$logger = new ProgressLogger;
$all_logger = new TerminalLogger;
// Configure a Database Connection:
$db = new WsaDb(HOST, DB, MYSQL_LOGIN, MYSQL_PASSWORD);
// Setup a DB Table object:
$table = new WsaTable($db,'top600k','admin', $logger, true, false);

// Generate a tree partitioned by tldtype, then d0:
$tree3 = new WsaTree($table,array('id'),array("tldtype","d0"));
echo "Generating tree...\n"; flush();
$tree3->gen();
echo "Creating index...\n"; flush();
$tree3->index();

// Database creation string:
$tableName = "domainsV2";
$create = <<<SQL
CREATE TABLE IF NOT EXISTS $tableName (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `nodeType` varchar(10) NOT NULL,
  `nodeName` varchar(64) NOT NULL,
  `tleft` int(10) unsigned NOT NULL,
  `tright` int(10) unsigned NOT NULL,
  `treepath` varchar(1024) COLLATE utf8_unicode_ci NOT NULL,
  `numChildNodes` int(10) unsigned NOT NULL,
  `numLeaves` int(10) unsigned NOT NULL,
  `numDescendantNodes` int(10) unsigned NOT NULL,
  `numDescendantLeaves` int(10) unsigned NOT NULL,
  `source_id` int(10) unsigned NOT NULL,
  `url` varchar(256) COLLATE utf8_unicode_ci NOT NULL,
  `rank` int(10) unsigned NOT NULL,
  `localRank` int(10) unsigned NOT NULL,
  `layoutRank` int(10) unsigned NOT NULL,
  `site` varchar(64) COLLATE utf8_unicode_ci NOT NULL,
  `d6` varchar(64) COLLATE utf8_unicode_ci NOT NULL,
  `d5` varchar(64) COLLATE utf8_unicode_ci NOT NULL,
  `d4` varchar(64) COLLATE utf8_unicode_ci NOT NULL,
  `d3` varchar(64) COLLATE utf8_unicode_ci NOT NULL,
  `d2` varchar(64) COLLATE utf8_unicode_ci NOT NULL,
  `d1` varchar(64) COLLATE utf8_unicode_ci NOT NULL,
  `d0` varchar(64) COLLATE utf8_unicode_ci NOT NULL,
  `path` varchar(256) COLLATE utf8_unicode_ci NOT NULL,
  `tldtype` varchar(64) COLLATE utf8_unicode_ci NOT NULL,
  `country` varchar(128) COLLATE utf8_unicode_ci NOT NULL,
  `language` varchar(128) COLLATE utf8_unicode_ci NOT NULL,
  `Updated_By` varchar(64) COLLATE utf8_unicode_ci NOT NULL,
  `Updated_On` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `rank` (`rank`),
  KEY `url` (`url`(255)),
  KEY `d0` (`d0`),
  KEY `d1` (`d1`),
  KEY `d2` (`d2`),
  KEY `d3` (`d3`),
  KEY `d4` (`d4`),
  KEY `d5` (`d5`),
  KEY `d6` (`d6`),
  KEY `site` (`site`),
  KEY `tldtype` (`tldtype`),
  KEY `country` (`country`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci AUTO_INCREMENT=1
SQL;

echo "<br>".$create."<br>\n\n";
$table->sql($create)->get();

$treeTable = new WsaTable($db,$tableName,'admin', $all_logger, true, true);

// Modify each node by sorting children and giving them a new attribute localRank:

function rankCmp($aRow,$bRow) {
  $a = (int)$aRow['rank'];
  $b = (int)$bRow['rank'];
  if ($a == $b) {
    return 0;
  }
  return ($a < $b) ? -1 : 1;
}


echo "Creating local ranks and saving rows...\n"; flush();
$tree3->visit(function(&$node) use($treeTable) {
  usort($node->leaves,rankCmp);
  for ($i=0; $i<count($node->leaves); $i++) {
    $node->leaves[$i]['localRank'] = $i+1;
  }
  $rows = $node->getLeavesAsRows();
  $rows[] = $node->getAsRow();
  $treeTable->saveRows($rows);
  unset($rows);
});

echo "All Done.\n";



