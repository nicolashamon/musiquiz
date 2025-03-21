<!--
  - bug sur buzzers en fin de temps de réponse (à tester)
  - revoir les playlists
  - liste des chansons écoutées sur la droite
  - stats de fin de partie
  - catégoriser les playlists
  - playlist de films
  - admin à améliorer
  - musique d'ambiance avant le début de la partie
  - API Spotify
  - réponses avec un micro
  - volume des chansons homogène
  - charger les extraits musicaux en avance
  - afficher les infos floutées au départ puis les révéler en fonction des réponses
  - afficher la première lettre de la chanson / artiste au bout de n secondes
-->
<?php
  function endsWith($hay, $needle) {
    return substr($hay, strlen($hay) - strlen($needle), strlen($needle)) == $needle;
  }
?>

<html>
  <head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    <title>MusiQuiz</title>
    <link rel="stylesheet" type="text/css" href="/styles/jquery-ui-1.14.1.min.css" />
    <link rel="stylesheet" type="text/css" href="/styles/animate.min.css" />
    <link rel="stylesheet" type="text/css" href="/styles/confettis.css" />
    <link rel="stylesheet" type="text/css" href="/styles/musiquiz.css?t=<?php echo stat("styles/musiquiz.css")["mtime"]; ?>" />
    <link rel="stylesheet" type="text/css" href="/fontawesome-free-6.7.2/css/fontawesome.css" rel="stylesheet" />
    <link rel="stylesheet" type="text/css" href="/fontawesome-free-6.7.2/css/brands.css" rel="stylesheet" />
    <link rel="stylesheet" type="text/css" href="/fontawesome-free-6.7.2/css/solid.css" rel="stylesheet" />
    <link rel="shortcut icon" href="./images/icon.png" />
    <script src="/scripts/jquery-3.7.1.min.js"></script>
    <script src="/scripts/jquery-ui-1.14.1.min.js"></script>
    <script src="/scripts/isotope.pkgd.js"></script>
    <script src="/scripts/gameUtils.js?t=<?php echo stat("scripts/gameUtils.js")["mtime"]; ?>"></script>
    <script src="/scripts/gameWindow.js?t=<?php echo stat("scripts/gameWindow.js")["mtime"]; ?>"></script>
  </head>

  <body>

  <div class='homeScreen'>
    <div class='homeScreenHeader'>
      <img src='./images/musiquiz.png' />
    </div>
    <div class='homeScreenContent'>
      <div id='homeScreenStep0' class='homeScreenStep current'>
        Chargement des playlists en cours...
      </div>
      <div id='homeScreenStep1' class='homeScreenStep'>
        <div>
          <a href='javascript:setNbPlayers(1)' id='playerButton1' class='button configButton playerButton'>1 joueur</a>
          <a href="javascript:setNbPlayers(2)" id="playerButton2" class="button configButton playerButton">2 joueurs</a>
          <a href="javascript:setNbPlayers(3)" id="playerButton3" class="button configButton playerButton">3 joueurs</a>
          <a href="javascript:setNbPlayers(4)" id="playerButton4" class="button configButton playerButton">4 joueurs</a>
        </div>
        <div id='homeScreenStep1Bottom'>
          <a href="javascript:switchAdvancedMode()" id='advancedModeButton' class="button">Plus d'options</a>
        </div>
      </div>
      <div id='homeScreenStep2' class='homeScreenStep'>
        <div>
          <a href="javascript:setNbScreens(1)" id="screenButton1" class="button configButton screenButton">Sans arbitre</a>
          <a href="javascript:setNbScreens(2)" id="screenButton2" class="button configButton screenButton">Avec arbitre</a>
        </div>
      </div>
      <div id='homeScreenStep3' class='homeScreenStep'>
        <div>
          <a href="javascript:setNbTracks(3)" id="trackButton3" class="button configButton trackButton">Démo</a>
          <a href="javascript:setNbTracks(10)" id="trackButton10" class="button configButton trackButton">10 chansons</a>
          <a href="javascript:setNbTracks(20)" id="trackButton20" class="button configButton trackButton">20 chansons</a>
          <a href="javascript:setNbTracks(30)" id="trackButton30" class="button configButton trackButton">30 chansons</a>
        </div>
      </div>
      <div id='homeScreenStep4' class='homeScreenStep'>
        <div style='margin: 10px'>
          <form onsubmit='return addPlayListUrl();'>
            <input type='text' id='playlistIdToAdd' name='playlistIdToAdd' placeholder='Numéro de playlist à ajouter' />
          </form>
        </div>
        <div id="playlistList"></div>
        <div style='margin: 10px; text-align: center;'>
          <a href="javascript:validatePlaylistsSelection()" class="button configButton">Suivant</a>
        </div>
      </div>
      <div id='homeScreenStep5' class='homeScreenStep'>
        <div class='homeScreenStepPlayers'>
          <?php
          $avatars = scandir('images/avatars');
          for ($i = 1; $i <= 4; $i++) {
            echo "<div class='homeScreenStepPlayer homeScreenStepPlayer".$i."'>
                    <input type='text' class='homeScreenStepPlayerNameInput' id='homeScreenStepPlayer".$i."' value='Joueur ".$i."' maxlength='15' autocomplete='off' />
                    <div class='homeScreenStepPlayerAvatars'>";
            $avatarCounter = 0;
            foreach ($avatars as $avatar) {
              if (endsWith($avatar, '.png')) {
                $avatarCounter++;
                echo "<div class='homeScreenStepPlayerAvatar " . ($avatarCounter == $i ? "selected" : "") . "' playerPosition='".$i."' avatar='./images/avatars/" . $avatar . "'>
                        <img src='./images/avatars/" . $avatar . "' />
                        <div class='homeScreenStepPlayerAvatarShadow'></div>
                      </div>\n";
              }
            }
            echo "  </div>
                    <input type='text' class='homeScreenStepPlayerAvatarInput' id='homeScreenStepPlayer".$i."Avatar' playerPosition='".$i."' autocomplete='off' />
                  </div>\n";
          }
          ?>
        </div>
        <div class='homeScreenStepStart'>
          <div id='homeScreenStepNbTracks'></div>
          <a href="javascript:prepareStartGame()" class="button animate__infinite animate__animated animate__pulse configButton">C'est parti !</a>
        </div>
      </div>
    </div>
  </div>

  <div class='gameScreen'>
    <div class='gameScreenContent'>
      <div id="trackList">&nbsp;</div>
      <div id="timer" class="animate__animated animate__infinite animate__heartBeat">&nbsp;</div>
      <div id="trackProgressBar"><div id="trackProgress" class="progressBarProgress"></div></div>
      <div id="mainContent">
        <div id="mainContentLeftPart">
          <div id="playerThumbnails"></div>
        </div>
        <div id="mainContentCenterPart">
          <div id="trackContent">
            <div class="trackContentText"></div>
            <div class="trackContentCover">
              <div class="trackContentIcons">
                <div class="trackContentIcon trackContentIconTitle animate__animated"><span class="fa-solid fa-music"></span><span>Titre</span></div>
                <div class="trackContentIcon trackContentIconArtist animate__animated"><span class="fa-solid fa-microphone"></span><span>Artiste</span></div>
              </div>
              <div id="equalizerWrapper">
                <div id="equalizer">
                  <div class="bar first"></div>
                  <div class="bar second"></div>
                  <div class="bar third"></div>
                  <div class="bar fourth"></div>
                  <div class="bar fifth"></div>
                </div>
                <div id="pauseIcon">
                  <span class="fa-solid fa-circle-pause fa-2xl fa-beat"></span>
                </div>
              </div>
            </div>
          </div>
          <div id="playerTextAnswerContent">
            <form onsubmit='return false;'>
              <input type='text' id='playerTextAnswer' name='playerTextAnswer' autocomplete='off' />
            </form>
          </div>
          <div id="playerAnswering"></div>
        </div>
        <div id="mainContentRightPart">
        </div>
      </div>
    </div>
    <div id="trackContentPreload"></div>
  </div>

  <div id="dialogWrapper">
    <div id="dialog">
      <div id='dialogContent'></div>
      <div id='dialogButtons'></div>
    </div>
    <div class="confettisWrapper">
      <div class="confettisContent">
        <?php
        for ($i = 0; $i <= 149; $i++) {
          echo "<div class='confetti-".$i."'></div>";
        }
        ?>
      </div>
    </div>
  </div>

  </body>
  <script>
    loadPlaylistThumbnails([
      { id: '13628118681', selected: false }, // Playlist Shara
      { id: '13668120261', selected: false }, // Playlist Sacha
      { id: '6554940184', selected: false }, // Made in Spain
      
      { id: '13680116321', selected: true }, // MusiQuiz
      { id: '9382099262', selected: true }, // Blind test 1970-2020
      { id: '13200756823', selected: true }, // 2024 Hits France
      { id: '7273901224', selected: true, title: "Best of 2000 > 2010" }, // Années 2000
      { id: '8979905582', selected: true }, // Hits cultes
      { id: '7273887124', selected: true, title: "Best of 1990 > 2000" }, // Années 90
//      { id: '7273969244', selected: true, title: "Best of années 2000 Français" }, // Best of années 2000 français
      { id: '3875687602', selected: true }, // Top 50 80 90 2000
      { id: '5220852384', selected: true, title: "100% hits internationaux" }, // 100% hits internationaux
      { id: '5242980142', selected: true }, // Hits internationaux
      { id: '11506591244', selected: true }, // Hits internationaux années 80
      { id: '53362031', selected: true}, // Les titres du moments
      { id: '1363560485', selected: true}, // Deezer hits
      { id: '9633748382', selected: true}, // Let's sing 2022
      
    ]);
  </script>
    <script>
      window.addEventListener('beforeunload', (event) => {
        if (currentTrack) {
          event.returnValue = 'You have unfinished changes!';
        }
      });
    </script>
</html>
