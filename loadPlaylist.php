<?php

$trackId = $_GET['id'];
$url = 'https://api.deezer.com/playlist/' . $trackId;
$curl = curl_init();
curl_setopt($curl, CURLOPT_URL, $url);
curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);

$resp = curl_exec($curl);
curl_close($curl);

echo $resp;

?>
