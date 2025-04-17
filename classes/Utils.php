<?php
require_once __DIR__ . '/Constants.php';
require_once __DIR__ . '/Database.php';
require_once __DIR__ . '/DatabaseObjects.php';

function musiquizSessionStart() {
  session_start();
  date_default_timezone_set('Europe/Paris');
}

function getPostValue($key) {
  $value = $_POST [$key];
  
  return $value;
}

function getPostValues() {
  $result = array ();
  
  foreach ( $_POST as $key => $value ) {
    $result [$key] = getPostValue($key);
  }
  
  return $result;
}

function startsWith($hay, $needle) {
  return substr($hay, 0, strlen($needle)) == $needle;
}

function endsWith($hay, $needle) {
  return substr($hay, strlen($hay) - strlen($needle), strlen($needle)) == $needle;
}

function getTrackCover($track_id) {
  $image_path = 'images/tracks/' . $track_id . '.jpg';
  if (file_exists($image_path)) {
    return $image_path;
  }
  return NULL;
}

?>