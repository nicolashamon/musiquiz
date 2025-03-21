<html>
  <head>
    <link rel="stylesheet" type="text/css" href="/styles/musiquiz.css?t=<?php echo stat("styles/musiquiz.css")["mtime"]; ?>" />
    <script src="/scripts/jquery-3.7.1.min.js"></script>
    <script src="/scripts/gameUtils.js?t=<?php echo stat("scripts/gameUtils.js")["mtime"]; ?>"></script>
    <script src="/scripts/adminWindow.js?t=<?php echo stat("scripts/adminWindow.js")["mtime"]; ?>"></script>
  </head>
  <body>

  <div class='adminScreen'>
    <a href="javascript:startGame()" id="startGameButton" class="button">Prêt</a>
    <div id="trackList"></div>
  </div>

  </body>
</html>
