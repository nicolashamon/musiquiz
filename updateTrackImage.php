<?php
require_once __DIR__ . "/classes/Utils.php";

musiquizSessionStart();

$track_id = $_POST['id'];
$image = $_FILES["image"]["tmp_name"];

$filePath = __DIR__ . "/images/tracks/" . $track_id . ".jpg";
move_uploaded_file($image, $filePath);

echo "images/tracks/" . $track_id . ".jpg";
?>
