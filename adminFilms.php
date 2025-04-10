<html>
  <head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    <title>MusiQuiz</title>
    <link rel="stylesheet" type="text/css" href="/styles/jquery-ui-1.14.1.min.css" />
    <link rel="stylesheet" type="text/css" href="/styles/musiquiz.css?t=<?php echo stat("styles/musiquiz.css")["mtime"]; ?>" />
    <link rel="stylesheet" type="text/css" href="/fontawesome-free-6.7.2/css/fontawesome.css" rel="stylesheet" />
    <link rel="stylesheet" type="text/css" href="/fontawesome-free-6.7.2/css/brands.css" rel="stylesheet" />
    <link rel="stylesheet" type="text/css" href="/fontawesome-free-6.7.2/css/solid.css" rel="stylesheet" />
    <link rel="stylesheet" type="text/css" href="/fontawesome-free-6.7.2/css/regular.css" rel="stylesheet" />
    <link rel="shortcut icon" href="./images/icon.png" />
    <script src="/scripts/jquery-3.7.1.min.js"></script>
    <script src="/scripts/jquery-ui-1.14.1.min.js"></script>
    <script src="/scripts/adminFilms.js?t=<?php echo stat("scripts/adminFilms.js")["mtime"]; ?>"></script>
    <script src="/scripts/gameUtils.js?t=<?php echo stat("scripts/gameUtils.js")["mtime"]; ?>"></script>
    <script>
    <?php
    require_once __DIR__ . "/classes/Utils.php";
    musiquizSessionStart();

    $track_translations = getObjectsFromDB(Track_translation::class);
    foreach ($track_translations as $track_translation) {
      echo "trackTranslations.push({ track_id: " . $track_translation->track_id .
           ", type: \"" . $track_translation->type .
           "\", title_fr: \"" . $track_translation->title_fr .
           "\", title_es: \"" . $track_translation->title_es .
           "\", title_en: \"" . $track_translation->title_en .
           "\", done: " . $track_translation->done . "});\n";
    }
    ?>
    </script>
  </head>

  <body>

  <div>
    <table id="tracks-table">
    </table>
  </div>

  </body>
  <script>
    loadPlaylists(defaultPlaylists);
  </script>
</html>
