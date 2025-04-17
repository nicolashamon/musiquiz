<html>
  <head>
    <link rel="stylesheet" type="text/css" href="/fontawesome-free-6.7.2/css/fontawesome.css" rel="stylesheet" />
    <link rel="stylesheet" type="text/css" href="/fontawesome-free-6.7.2/css/brands.css" rel="stylesheet" />
    <link rel="stylesheet" type="text/css" href="/fontawesome-free-6.7.2/css/solid.css" rel="stylesheet" />
    <link rel="stylesheet" type="text/css" href="/fontawesome-free-6.7.2/css/regular.css" rel="stylesheet" />
    <link rel="stylesheet" type="text/css" href="/styles/musiquiz.css?t=<?php echo stat("styles/musiquiz.css")["mtime"]; ?>" />
    <script src="/scripts/jquery-3.7.1.min.js"></script>
    <script src="/scripts/gameUtils.js?t=<?php echo stat("scripts/gameUtils.js")["mtime"]; ?>"></script>
    <script src="/scripts/gameAdmin.js?t=<?php echo stat("scripts/gameAdmin.js")["mtime"]; ?>"></script>
  </head>
  <body>

  <div class='adminScreen'>
    <a href="javascript:startGame()" id="startGameButton" class="button">Prêt</a>
    <div id="trackList"></div>
    <div id="keyboardHelp">
      <div class="keyboardHelpTop">
        <div class="keyboardHelpLegend keyboardHelpLegendUp">Titre + artiste</div>
        <div class="keyboardHelpKey fa-solid fa-arrow-up fa-xl"></div>
      </div>
      <div class="keyboardHelpCenter">
        <div class="keyboardHelpLegend keyboardHelpWithArtist">Titre</div>
        <div class="keyboardHelpKey fa-solid fa-arrow-left fa-xl keyboardHelpWithArtist"></div>
        <div class="keyboardHelpKey fa-solid fa-arrow-down fa-xl"></div>
        <div class="keyboardHelpKey fa-solid fa-arrow-right fa-xl keyboardHelpWithArtist"></div>
        <div class="keyboardHelpLegend keyboardHelpWithArtist">Artiste</div>
      </div>
      <div class="keyboardHelpBottom">
        <div class="keyboardHelpLegend">Faux</div>
      </div>
    </div>
  </div>

  </body>
  <script>
    if (gameWindow.filmMode) {
      jQuery('.keyboardHelpWithArtist').hide();
      jQuery('.keyboardHelpLegendUp').html('Titre');
    }
  </script>
</html>
