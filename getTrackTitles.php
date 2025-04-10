<?php
require_once __DIR__ . "/classes/Utils.php";

musiquizSessionStart();

$track_ids_value = $_GET['ids'];
$track_ids = explode(',', $track_ids_value);
$result = array();

foreach ($track_ids as $track_id) {
  $track_translation = getObjectFromDB(Track_translation::class, "TRACK_ID=" . $track_id);
  if ($track_translation) {
    array_push($result, array(
      'track_id' => $track_id,
      'title_fr' => $track_translation->title_fr,
      'title_es' => $track_translation->title_es,
      'title_en' => $track_translation->title_en));
  }
}

$track_titles = json_encode($result);

echo $track_titles;

?>
