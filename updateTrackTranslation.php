<?php
require_once __DIR__ . "/classes/Utils.php";

musiquizSessionStart();

$track_id = $_GET['id'];
$track_type = $_GET['type'];
$track_title_fr = trim($_GET['title_fr']);
$track_title_es = trim($_GET['title_es']);
$track_title_en = trim($_GET['title_en']);

$existing_track = getObjectFromDB(Track_translation::class, "TRACK_ID=" . $track_id);
$data = array(
  'track_id' => $track_id,
  'type' => $track_type,
  'title_fr' => $track_title_fr,
  'title_es' => $track_title_es,
  'title_en' => $track_title_en,
  'done' => '1'
);

if ($existing_track) {
  updateObjectToDB(Track_translation::class, "TRACK_ID=" . $track_id, $data);
} else {
  createObjectToDB(Track_translation::class, $data);
}
?>
