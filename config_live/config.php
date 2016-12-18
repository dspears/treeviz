<?php
/**
 * 
 */
// For dev mode, turn on all PHP error messages:
error_reporting(E_ALL ^ E_NOTICE);

define('HOST','localhost');
define('DB','jet');
define('MYSQL_LOGIN','zjet');
define('MYSQL_PASSWORD','Takeoff1Jet');

define('FIREPHP_LOGGING',false);

/**
 * Return a string that can be appended to a page title or H1 heading that tells us
 * we are running with a test database.
 * 
 * Example code:
 * <code>
 *   <h2>LTE KPI Database <?=testTitle(MYSQL_DB_CONFIG)?></h2>
 * </doce>
 * 
 * @param string $dbConfig - the path to the MYSQL db config (MYSQL_DB_CONFIG).
 * @return string to display at end of title or heading.
 */
function testTitle($dbConfig) {
  if (stristr($dbConfig,"MYSQL_TEST_DB")) {
    $r = " <span class='testTitle' style='color: red; font-size: 70%; font-style: italic;'>(USING TEST DB: ".DB.")</span>";
  } else {  
    $r = '';
  }
  return $r;
}
