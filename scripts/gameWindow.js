const TIMER_DELAY = 5; // 5
const FADING_TIME_INTERVAL = 100;
const TRACK_START_TIME = 0;
const PLAYER_ANSWER_TIMER_DELAY = 7;
const PLAYER_KEYBOARD_ANSWER_TIMER_DELAY = 11; // 11
const PLAYER_BLOCK_DELAY = 5; // 5
const PLAYER_MAX_ATTEMPTS = 3;
const LEVENSHTEIN_THRESHOLD = 0.25;

var adminWindow;
var playerThumbnailsIsotope;
var advancedMode = true;
var filmMode = false;
var nbPlayers = 0;
var nbTracks = 0;
var nbScreens = 1;
var playTrackInterval;
var playerAnswerInterval;
var playerBlocksInterval;
var playerAnsweringPosition = 0;
var playerAnsweringTime = 0;
var playerNames = ['', '', '', ''];
var playerAvatars = ['', '', '', ''];
var playerBlockTimes = [0, 0, 0, 0];
var playerAttempts = [0, 0, 0, 0];
var fadingOut = false;
var playlists = {};
var playlistIds = [];
var tracks = [];
var currentTrack;
var audio;

function switchAdvancedMode() {
  advancedMode = !advancedMode;
  if (advancedMode) {
    jQuery("#advancedModeButton").addClass("selected");
  } else {
    jQuery("#advancedModeButton").removeClass("selected");
  }
}

function setNbPlayers(nbPlayers) {
  loadSounds();
  // jQuery(".playerButton").removeClass("selected");
  // jQuery("#playerButton" + nbPlayers).addClass("selected");
  window.nbPlayers = nbPlayers;
  jQuery("#homeScreenStep1").hide();
  if (advancedMode) {
    jQuery("#homeScreenStep2").show();
  } else {
    jQuery("#homeScreenStep3").show();
  }
}

function setNbScreens(nbScreens) {
  // jQuery(".screenButton").removeClass("selected");
  // jQuery("#screenButton" + nbScreens).addClass("selected");
  window.nbScreens = nbScreens;
  jQuery("#homeScreenStep2").hide();
  jQuery("#homeScreenStep3").show();
}

function setNbTracks(nbTracks) {
  // jQuery(".trackButton").removeClass("selected");
  // jQuery("#trackButton" + nbTracks).addClass("selected");
  window.nbTracks = nbTracks;
  jQuery("#homeScreenStep3").hide();
  if (advancedMode) {
    jQuery("#homeScreenStep4").show();
  } else {
    validatePlaylistsSelection();
    jQuery("#homeScreenStep5").show();
  }
}

function setFilmMode(filmMode) {
  jQuery(".filmModeButton").removeClass("selected");
  jQuery("#filmModeButton" + (filmMode ? '2' : '1')).addClass("selected");
  window.filmMode = filmMode;
  jQuery(".playlistList").hide();
  if (filmMode) {
    jQuery("#playlistFilmList").show();
    jQuery("#playlistIdToAdd").hide();
  } else {
    jQuery("#playlistMusicList").show();
    jQuery("#playlistIdToAdd").show();
  }
}

function validatePlaylistsSelection() {
  if (playlistIds.length > 0) {
    loadTracks();
    jQuery(".homeScreenStepPlayer").hide();
    jQuery(".homeScreenStepPlayer1").show();
    // if (nbPlayers >= 2) {
    //   jQuery(".homeScreenStepPlayer2").show();
    // }
    // if (nbPlayers >= 3) {
    //   jQuery(".homeScreenStepPlayer3").show();
    // }
    // if (nbPlayers >= 4) {
    //   jQuery(".homeScreenStepPlayer4").show();
    // }
    jQuery("#homeScreenStep4").hide();
    jQuery("#homeScreenStep5").show();
    jQuery("#homeScreenStepPlayer1").select();
    jQuery(".homeScreenStepStart").hide();
  }
}

function selectNextAvatar(playerPosition) {
  const selector = ".homeScreenStepPlayer" + playerPosition + " .homeScreenStepPlayerAvatars .homeScreenStepPlayerAvatar";
  const selectedAvatar = jQuery(selector + ".selected");
  let nextAvatar = selectedAvatar.next(selector);
  selectedAvatar.removeClass('selected');
  if (nextAvatar.length == 0) {
    nextAvatar = jQuery(selector).first();
  }
  nextAvatar.addClass('selected');
}

async function loadPlaylistThumbnails(playlists) {
  const promises = [];
  const otherGroupId = getGroupId(null, false);
  const playlistGroups = [ otherGroupId ];
  jQuery('.playlistList').html('');
  playlists.forEach(playlist => {
    const group = playlist.group;
    const groupId = getGroupId(group, playlist.filmMode);
    if (!playlistGroups.includes(groupId)) {
      playlistGroups.push(groupId);
      jQuery('#playlist' + (playlist.filmMode ? 'Film' : 'Music') + 'List').
        append("<div class='playlistGroupWrapper' id='" + groupId + "'><div class='playlistGroupTitle'>" + group + "</div></div>");
    }
  });
  jQuery('#playlistMusicList').append("<div class='playlistGroupWrapper' id='" + otherGroupId + "'><div class='playlistGroupTitle'>Autres</div></div>");
  playlists.forEach(playlist => {
    promises.push(loadPlaylistThumbnail(playlist));
    jQuery('#' + getGroupId(playlist.group, playlist.filmMode)).append("<div id='playlistWrapper" + playlist.id + "'></div>");
  });
  jQuery.when.apply(jQuery, promises).then(function(data) {
    jQuery("#homeScreenStep0").fadeOut(300, function() {
      jQuery("#homeScreenStep1").fadeIn();
    });
  }, function(err) {
    console.log("[loadPlaylistThumbnails error]", err);
  });
}

function getGroupId(group, filmMode) {
  var result = group;
  if (!result) {
    result = "Autres";
  }
  result = result.replaceAll(' ', '');
  return 'playlistGroupWrapper' + result + (filmMode ? 'Film' : 'Music');
}

async function loadPlaylistThumbnail(playlist) {
  const result = await jQuery.ajax({
    type : "GET",
    data: "id=" + playlist.id,
    dataType: "json",
    url : "loadPlaylist.php",
    success : function(data) {
      if (playlist.title) {
        data.title = playlist.title;
      }
      data.filmMode = playlist.filmMode;
      playlists[playlist.id] = data;
      const nbTracks = data.tracks.data.filter((track) => !!track.preview).length;
      let playlistTitle = data.title;
      if (playlistTitle.length > 40) {
        playlistTitle = playlistTitle.substring(0, 40) + '...';
      }
      jQuery('#playlistWrapper' + data.id).html("\
        <a href='javascript:selectPlaylist(\"" + data.id + "\")'>\
          <div id='playlistListItem" + data.id + "' class='playlistListItem'>\
            <div class='playlistListItemPicture'><img src='" + data.picture_medium + "'></div>\
            <div class='playlistListItemTitleWrapper'><span class='playlistListItemTitle'>" + playlistTitle + "<br>(" + nbTracks + " titres)</span>\
            </div>\
          </div>\
        </a>");
      if (playlist.selected) {
        selectPlaylist(playlist.id);
      }
    },
    error : function(error) {
      console.log("[loadPlaylistThumbnail error]", error);
    }
  });
  return result;
}

function addPlayListUrl() {
  const playlistIdToAdd = jQuery("#playlistIdToAdd");
  jQuery('#' + getGroupId(null, false)).append("<div id='playlistWrapper" + playlistIdToAdd.val() + "'></div>");
  loadPlaylistThumbnail({ id: playlistIdToAdd.val() });
  playlistIdToAdd.val('');
  return false;
}

function selectPlaylist(playlistId) {
  const playlistItem = jQuery("#playlistListItem" + playlistId);
  if (!playlistItem.hasClass("selected")) {
    playlistItem.addClass("selected");
    playlistIds.push(playlistId);
  } else {
    playlistItem.removeClass("selected");
    playlistIds = playlistIds.filter((playlistIdTmp) => playlistIdTmp != playlistId);
  }
}

async function prepareStartGame() {
  if (nbPlayers > 0 && nbScreens > 0 && nbTracks > 0 && playlistIds.length > 0) {
    editingPlayers = 0;
    playerNames = [
      jQuery("#homeScreenStepPlayer1").val(),
      jQuery("#homeScreenStepPlayer2").val(),
      jQuery("#homeScreenStepPlayer3").val(),
      jQuery("#homeScreenStepPlayer4").val()
    ];
    jQuery(".homeScreenStepPlayerAvatar.selected").each(function(index) {
      const playerPosition = Number(jQuery(this).attr('playerPosition'));
      if (playerPosition <= nbPlayers) {
        playerAvatars[playerPosition - 1] = jQuery(this).attr('avatar');
      }
    });

    jQuery(".homeScreen").hide();
    jQuery(".gameScreen").show();
    if (filmMode) {
      jQuery(".trackContentIconArtist").hide();
    } else {
      jQuery(".trackContentIconArtist").show();
    }
  
    playerBlocksInterval = setInterval(() => { refreshPlayerBlocksProgressBar(); }, 100);

    if (nbScreens == 2) {
      adminWindow = window.open('./gameAdmin.php', 'gameWindow', { popup: true });
    } else {
      startGame();
    }
  }
}

function restartGame() {
  currentTrack = null;
  jQuery("#dialogWrapper").css('display', 'none').removeClass('player1').removeClass('player2').removeClass('player3').removeClass('player4');
  jQuery(".homeScreen").show();
  jQuery(".gameScreen").hide();
  jQuery('#playlistList').show();
  jQuery("#homeScreenStep1").show();
  jQuery("#homeScreenStep5").hide();
}

function startGame() {
  currentTrack = null;
  jQuery('.trackContentText').html("&nbsp;");
  jQuery('.trackContentCover').css("background-image", "");
  jQuery('#equalizerWrapper').show();
  jQuery('.trackContentIcons').show();
  jQuery('#equalizer').removeClass('animated');
  jQuery('#playlistList').hide();
  jQuery('#trackProgress').width('0');
  jQuery("#trackProgressBar").show();
  playNextTrack();
  createPlayerThumbnails();
}

function endGame() {
  currentTrack = null;
  const playerPoints = computePlayerPoints();
  const playerTimes = computePlayerTimes();
  let winnerPosition = 0;
  for (let i = 0; i < playerPoints.length && i < nbPlayers; i++) {
    if (playerPoints[i] >= playerPoints[winnerPosition]) {
      if (playerPoints[i] > playerPoints[winnerPosition] || playerTimes[i] < playerTimes[winnerPosition]) {
        winnerPosition = i;
      }
    }
  }
  const dialogContent = "<div>Victoire de " + playerNames[winnerPosition] + "</div>" +
    "<div class='dialogContentAvatar dialogContentAvatar" + (winnerPosition + 1) + " animate__infinite animate__animated animate__pulse'><img src='" + playerAvatars[winnerPosition] + "' /></div>";
  jQuery("#dialogContent").html(dialogContent);
  jQuery("#dialogButtons").html("<a href='javascript:restartGame()' class='button'>Rejouer</a>");
  jQuery("#dialogWrapper").css('display', 'flex').addClass('player' + (winnerPosition + 1));
  jQuery("#dialogButtons .button").focus();
  playAudio(audioApplause);
}

function computePlayerPoints() {
  const playerPoints = [0, 0, 0, 0];
  tracks.forEach(track => {
    if (track.playerTitleAnsweredPosition) {
      playerPoints[track.playerTitleAnsweredPosition - 1]++;
    }
    if (track.playerArtistAnsweredPosition) {
      playerPoints[track.playerArtistAnsweredPosition - 1]++;
    }
  });
  return playerPoints;
}

function computePlayerTimes() {
  const playerTimes = [0, 0, 0, 0];
  tracks.forEach(track => {
    if (track.playerTitleAnsweredPosition) {
      playerTimes[track.playerTitleAnsweredPosition - 1] += track.playerTitleAnsweredTime;
    }
    if (track.playerArtistAnsweredPosition) {
      playerTimes[track.playerArtistAnsweredPosition - 1] += track.playerArtistAnsweredTime;
    }
  });
  return playerTimes;
}

async function loadTracks() {
  var allTracks = [];
  var totalNbTracks = 0;
  const useSameNumber = !filmMode;
  playlistIds.forEach(playlistId => {
    const playlist = playlists[playlistId];
    if (!!playlist.filmMode == !!filmMode) {
      const playlistTracks = playlist.tracks.data.filter((track) => !!track.preview);
      totalNbTracks += playlistTracks.length;
      // Use the same number of tracks in each selected playlist
      const randomTracks = [];
      if (useSameNumber) {
        const playlistTracksLength = playlistTracks.length;
        for (i = 0; i < nbTracks && i < playlistTracksLength; i++) {
          const j = Math.floor(Math.random() * playlistTracks.length);
          randomTracks.push(playlistTracks[j]);
          playlistTracks.splice(j, 1);
        }  
      } else {
        playlistTracks.forEach(playlistTrack => {
          randomTracks.push(playlistTrack);
        });
      }
      randomTracks.forEach(track => {
        const existingTrack = allTracks.find(trackTmp => trackTmp.title_short == track.title_short && trackTmp.artist.id == track.artist.id);
        const generationArtistName = track.artist.name.startsWith("Generation");
        const addTrack = !existingTrack && !generationArtistName;
        if (addTrack) {
          track.played = false;
          track.playing = false;
          track.playerTitleAnsweredPosition = 0;
          track.playerArtistAnsweredPosition = 0;
          track.playerTitleAnsweredTime = 0;
          track.playerArtistAnsweredTime = 0;
          track.playlistTitle = playlist.title;
          track.cover = track.album.cover_medium;
          allTracks.push(track);
        }
      });  
    }
  });

  const divider = totalNbTracks < 1000 ? 10 : 100;
  jQuery('#homeScreenStepNbTracks').html("Prêts à jouer avec plus de " + (Math.floor(totalNbTracks / divider) * divider) + " chansons ?!?");

  tracks = [];
  for (i = 0; i < nbTracks; i++) {
    const j = Math.floor(Math.random() * allTracks.length);
    tracks.push(allTracks[j]);
    allTracks.splice(j, 1);
  }

  if (filmMode) {
    const trackTitles = await jQuery.ajax({
      type : "GET",
      data: "ids=" + tracks.map((track) => track.id).join(","),
      dataType: "json",
      url : "getTrackTitles.php"
    });
  
    trackTitles.forEach(trackTitle => {
      const track = tracks.find((trackTmp) => trackTmp.id == trackTitle.track_id);
      if (trackTitle.cover) {
        track.cover = trackTitle.cover;
      }
      track.title_fr = trackTitle.title_fr;
      track.title_es = trackTitle.title_es;
      track.title_en = trackTitle.title_en;
    });
  }

  console.log(tracks);

  createTrackList();
}

function playNextTrack() {
  const notPlayedTrack = tracks.find(track => !track.played );
  startTimerAndPlayTrack(notPlayedTrack.id);
}

async function startTimerAndPlayTrack(trackId) {
  const promises = [];
  promises.push(displayTimer());
  promises.push(loadTrack(trackId));
  jQuery.when.apply(jQuery, promises).then(function(data) {
    currentTrack = arguments[1];
    jQuery("#trackContentPreload").html("<img src='" + currentTrack.cover + "' />");
    playCurrentTrack();
  }, function(err) {
    console.log("[startTimerAndPlayTrack error]", err);
    startTimerAndPlayTrack(trackId);
  });
}

async function playCurrentTrack() {
  try {
    jQuery('.trackContentText').html("&nbsp;");
    jQuery('.trackContentCover').css("background-image", "");
    jQuery('#equalizerWrapper').show();
    jQuery('.trackContentIcons').show();
    jQuery('#equalizer').addClass('animated');
    audio = new Audio(currentTrack.preview);
    currentTrack.playing = true;
    audio.volume = 0;
    audio.currentTime = TRACK_START_TIME;
    if (playTrackInterval) {
      clearInterval(playTrackInterval);
    }
    playTrackInterval = setInterval(() => { refreshTrackProgressBar(); }, 100);
    audioPlay();
    audioFadeIn(audio);
    refreshTrackList();
  } catch (err) {
    console.log("[playCurrentTrack error]", err);
  }
}

async function displayTimer() {
  const timer = jQuery("#timer");
  for (let i = TIMER_DELAY; i > 0; i--) {
    playAudio(audioTimer);
    timer.html(i);
    await sleep(1000);  
  }
  timer.html("&nbsp;");
}

async function loadTrack(trackId) {
  const detailedTrack = await jQuery.ajax({
    type : "GET",
    data: "id=" + trackId,
    dataType: "json",
    url : "loadTrack.php"
  });
  const track = tracks.find(track => trackId == track.id);
  const title_short = track.title_short;
  const title_fr = track.title_fr;
  const title_es = track.title_es;
  const title_en = track.title_en;
  Object.assign(track, detailedTrack);
  track.title_short = title_short;
  track.title_fr = title_fr;
  track.title_es = title_es;
  track.title_en = title_en;
  return track;
}

function refreshTrackProgressBar() {
  var ratio = 0;
  var green = 255;
  if (audio) {
    ratio = audio.currentTime / audio.duration * 100;
    green = 255 * (100 - ratio) / 100;
  }
  jQuery('#trackProgress').width(ratio + '%');
  jQuery('#trackProgress').css('background-color', 'rgb(' + green + ', ' + green + ', 255)');
  if (!fadingOut && audio.volume > 0 && audio && (audio.duration - audio.currentTime) * 1000 < FADING_TIME_INTERVAL * 15) {
    audioFadeOut(false);
  }
  if (ratio >= 100 && !fadingOut) {
    displayCurrentTrackContent();
    nextTrack();
  }
}

function nextTrack() {
  const found = currentTrackFound();
  playerAnsweringPosition = 0;
  playerBlockTimes = [0, 0, 0, 0];
  playerAttempts = [0, 0, 0, 0];
  refreshPlayerThumbnails();
  currentTrack.played = true;
  currentTrack.playing = false;
  clearInterval(playTrackInterval);
  refreshTrackList();
  const playedTracks = tracks.filter(track => track.played );
  if (playedTracks.length < nbTracks) {
    playNextTrack();
  } else {
    setTimeout("endGame()", found ? 0 : 2000);
  }
}

function createTrackList() {
  let trackListContent = "";
  tracks.forEach(track => {
    trackListContent += "<div class='trackListBullet trackListTitleBullet' id='trackListTitleBullet" + track.id + "'></div>";
    trackListContent += "<div class='trackListBullet trackListArtistBullet' id='trackListArtistBullet" + track.id + "'></div>";
  });
  jQuery("#trackList").html(trackListContent);
  if (adminWindow) {
    adminWindow.refreshAdminTrackList();
  }
}

function refreshTrackList() {
  tracks.forEach(track => {
    if (track.playerTitleAnsweredPosition) {
      jQuery('#trackListTitleBullet' + track.id).addClass("playerAnswer" + track.playerTitleAnsweredPosition);
    }
    if (track.playerArtistAnsweredPosition || (filmMode && track.playerTitleAnsweredPosition)) {
      jQuery('#trackListArtistBullet' + track.id).addClass("playerAnswer" +
        (track.playerArtistAnsweredPosition ? track.playerArtistAnsweredPosition : track.playerTitleAnsweredPosition));
    }
    if (track.playing) {
      jQuery('#trackListTitleBullet' + track.id).addClass("animate__infinite").addClass("animate__animated").addClass("animate__heartBeat").addClass("playing");
      jQuery('#trackListArtistBullet' + track.id).addClass("animate__infinite").addClass("animate__animated").addClass("animate__heartBeat").addClass("playing");
    } else {
      jQuery('#trackListTitleBullet' + track.id).removeClass("animate__infinite").removeClass("animate__animated").removeClass("animate__heartBeat").removeClass("playing");
      jQuery('#trackListArtistBullet' + track.id).removeClass("animate__infinite").removeClass("animate__animated").removeClass("animate__heartBeat").removeClass("playing");
    }
  });
  if (adminWindow) {
    adminWindow.refreshAdminTrackList();
  }
}

function displayCurrentTrackContent() {
  playerAnsweringPosition = 0;
  playerBlockTimes = [0, 0, 0, 0];
  playerAttempts = [0, 0, 0, 0];
  currentTrack.played = true;
  const trackTitle = getTrackTitle(currentTrack);
  const trackArtists = getTrackArtists(currentTrack);
  jQuery('.trackContentText').html(trackTitle + (filmMode ? "" : " (" + trackArtists.join(' / ') + ")") + "<br/>" +
    (playlistIds.length > 1 && advancedMode ? "<span style='font-size: 0.5em'>Playlist " + currentTrack.playlistTitle + "</span>" : ""));
  jQuery('.trackContentCover').css("background-image", "url('" + currentTrack.cover + "')");
  jQuery('#equalizerWrapper').hide();
  jQuery("#pauseIcon").css('visibility', 'hidden');
  jQuery('.trackContentIcon').removeClass('found').removeClass('animate__shakeY');
  jQuery('.trackContentIcons').hide();
}

async function audioFadeIn() {
  audio.volume = 0;
  for (let i = 0; i <= 10 && audio.volume < 1; i++) {
    audio.volume = Math.min(1, i * 0.1);
    await sleep(FADING_TIME_INTERVAL);
  }
}

async function audioFadeOut(playNext) {
  if (fadingOut) {
    return;
  }
  fadingOut = true;
  for (let i = 0; i <= 10 && audio.volume > 0; i++) {
    audio.volume = 1 - i * 0.1;
    await sleep(FADING_TIME_INTERVAL);
  }
  audio.volume = 0;
  fadingOut = false;
  if (playNext) {
    nextTrack();
  }
}

function togglePause() {
  if (audio.paused) {
    jQuery("#pauseIcon").css('visibility', 'hidden');
    audio.play();
  } else if (!currentTrackFound() && !currentTrack.played) {
    jQuery("#pauseIcon").css('visibility', 'visible');
    audio.pause();
  }
}

function playerAnswer(playerPosition) {
  const now = new Date().getTime();
  const audioRatio = (audio.currentTime / audio.duration);

  if (!currentTrackFound() &&
      audioRatio < 0.99 &&
      playerAnsweringPosition <= 0 &&
      playerAttempts[playerPosition - 1] < PLAYER_MAX_ATTEMPTS &&
      (now - playerBlockTimes[playerPosition - 1] > PLAYER_BLOCK_DELAY * 1000)) {
    playerAnsweringPosition = playerPosition;
    playerAnsweringTime = now;
    playerAttempts[playerPosition - 1]++;
    refreshPlayerThumbnails();
    if (playerAnswerInterval) {
      clearInterval(playerAnswerInterval);
    }
    playerAnswerInterval = setInterval(() => { refreshPlayerAnsweringProgressBar(); }, 100);
    jQuery('body').addClass('backgroundAnimatedPlayer' + playerPosition);
    jQuery('#equalizer').removeClass('animated');
    jQuery("#playerAnswering").html("\
      <div class='playerAnswering playerAnswering" + playerPosition + "'>\
        <div>" + playerNames[playerPosition - 1] + "</div>\
        <div class='playerAnsweringAvatar playerAnsweringAvatar" + playerPosition + "'><img src='" + playerAvatars[playerPosition - 1] + "' /></div>\
        <div class='playerAnsweringTime'>" + formatTime(audio.currentTime) + "</div>\
        <div id='playerAnsweringProgressBar'><div id='playerAnsweringProgress' class='progressBarProgress'></div></div>\
      </div>");
    playAudio(audioBuzzers[playerPosition - 1]);
    audio.pause();
    displayPlayerAnswerTimer();
    if (nbScreens == 1) {
      jQuery("#playerTextAnswer").val('');
      jQuery("#playerTextAnswerContent").css('visibility', 'visible');
      jQuery("#playerTextAnswer").focus();
    }
  }
}

async function checkPlayerTextAnswer() {
  // Not allowed to validate during the first 2 seconds (to avoid validation issues when buzzing)
  if (playerAnsweringTime && (new Date().getTime() - playerAnsweringTime < 1500)) {
    return false;
  }

  keydownAnswerBlocked = true;
  try {
    const playerTextAnswer = jQuery("#playerTextAnswer");
    const answer = playerTextAnswer.val();
  
    const titleDistance = computeTitleScore(answer, currentTrack);
    const artistDistance = filmMode ? 10 : computeArtistScore(answer, currentTrack);
  
    const titleFound = (titleDistance <= LEVENSHTEIN_THRESHOLD);
    const artistFound = (artistDistance <= LEVENSHTEIN_THRESHOLD);
  
    if (titleFound || artistFound) {
      await goodAnswer(titleFound, artistFound);
    } else {
      await playerAnswerKo(window);
    }
  } catch (err) {
    console.log("[checkPlayerTextAnswer error]", err);
  } finally {
    keydownAnswerBlocked = false;
  }

  return false;  
}

function currentTrackFound() {
  return currentTrack && currentTrack.playerTitleAnsweredPosition > 0 && (filmMode || currentTrack.playerArtistAnsweredPosition > 0);
}

async function refreshPlayerAnsweringProgressBar() {
  var ratio = 0;
  var green = 255;
  ratio = (new Date().getTime() - playerAnsweringTime) / (getPlayerAnswerTimerDelay() * 1000) * 100;
  green = 255 * (100 - ratio) / 100;
  jQuery('#playerAnsweringProgress').width(ratio + '%');
  jQuery('#playerAnsweringProgress').css('background-color', 'rgb(' + green + ', ' + green + ', 255)');
  if (ratio >= 100) {
    clearInterval(playerAnswerInterval);
    if (playerAnsweringTime > 0) {
      if (nbScreens == 1) {
        checkPlayerTextAnswer();
      } else {
        await playAudio(audioEnd);
      }
    }
  }
}

function getPlayerAnswerTimerDelay() {
  if (nbScreens == 1) {
    return PLAYER_KEYBOARD_ANSWER_TIMER_DELAY;
  }
  return PLAYER_ANSWER_TIMER_DELAY;
}

function refreshPlayerBlocksProgressBar() {
  for (let i = 0; i < nbPlayers; i++) {
    var ratio = 0;
    var green = 255;
    ratio = playerBlockTimes[i] == 0 ? 0 : (new Date().getTime() - playerBlockTimes[i]) / (PLAYER_BLOCK_DELAY * 1000) * 100;
    green = 255 * (100 - ratio) / 100;
    if ((ratio <= 0 || ratio >= 100) && (playerAttempts[i] < PLAYER_MAX_ATTEMPTS)) {
      jQuery('.playerThumbnail' + (i + 1) + ' .playerBlockWrapper').css('visibility', 'hidden');
      jQuery('.playerThumbnail' + (i + 1) + ' .playerBlockProgress').width('0');
      jQuery('.playerThumbnail' + (i + 1) + ' .playerBlockProgressBar').css('visibility', 'hidden');
    } else {
      jQuery('.playerThumbnail' + (i + 1) + ' .playerBlockWrapper').css('visibility', 'visible');
      jQuery('.playerThumbnail' + (i + 1) + ' .playerBlockProgress').width(ratio + '%');
      jQuery('.playerThumbnail' + (i + 1) + ' .playerBlockProgress').css('background-color', 'rgb(' + green + ', ' + green + ', 255)');
      if (playerAttempts[i] >= PLAYER_MAX_ATTEMPTS) {
        jQuery('.playerThumbnail' + (i + 1) + ' .playerBlockProgressBar').css('visibility', 'hidden');
      } else {
        jQuery('.playerThumbnail' + (i + 1) + ' .playerBlockProgressBar').css('visibility', 'visible');
      }
    }
    if (ratio >= 100) {
      playerBlockTimes[i] = 0;
    }
  }
}

async function displayPlayerAnswerTimer() {
  const playerAnswerTimer = jQuery(".playerAnswerTimer");
  for (let i = getPlayerAnswerTimerDelay(); i > 0; i--) {
    playerAnswerTimer.html(i);
    await sleep(1000);  
  }
  playerAnswerTimer.html("&nbsp;");
}

function audioPlay() {
  if (playerAnsweringPosition > 0 && playerAttempts[playerAnsweringPosition - 1] < PLAYER_MAX_ATTEMPTS) {
    playerBlockTimes[playerAnsweringPosition - 1] = new Date().getTime();
  }
  jQuery("#playerTextAnswerContent").css('visibility', 'hidden');
  jQuery("#playerAnswering").html('');
  jQuery('#equalizer').addClass('animated');
  jQuery('body').removeClass('backgroundAnimatedPlayer1').
    removeClass('backgroundAnimatedPlayer2').
    removeClass('backgroundAnimatedPlayer3').
    removeClass('backgroundAnimatedPlayer4');
  audio.play();
  playerAnsweringTime = 0;
  playerAnsweringPosition = 0;
}

async function goodAnswer(title, artist) {
  if (playerAnsweringPosition > 0 && !currentTrackFound()) {
    const goodAnswer = (title && currentTrack.playerTitleAnsweredPosition <= 0) || (artist && currentTrack.playerArtistAnsweredPosition <= 0);
    if (goodAnswer) {
      await playAudio(audioCorrect);
      if (title && currentTrack.playerTitleAnsweredPosition <= 0) {
        currentTrack.playerTitleAnsweredPosition = playerAnsweringPosition;
        currentTrack.playerTitleAnsweredTime = audio.currentTime;
        jQuery('.trackContentIconTitle').addClass('found').addClass('animate__shakeY');
      }
      if (!filmMode && artist && currentTrack.playerArtistAnsweredPosition <= 0) {
        currentTrack.playerArtistAnsweredPosition = playerAnsweringPosition;
        currentTrack.playerArtistAnsweredTime = audio.currentTime;
        jQuery('.trackContentIconArtist').addClass('found').addClass('animate__shakeY');
      }
      refreshPlayerThumbnails();
      refreshTrackList();
      audioPlay();
      if (currentTrackFound()) {
        setTimeout("displayCurrentTrackContent()", 2000); // Wait to display trackContentIcons a few seconds
      }
      refreshPlayerThumbnails();
    } else {
      playerAnswerKo(window);
    }
  }
}

function createPlayerThumbnails() {
  if (playerThumbnailsIsotope) {
    playerThumbnailsIsotope.isotope('destroy')
  }

  let playerThumbnailsContent = "";
  for (var i = 1; i <= nbPlayers; i++) {
    playerThumbnailsContent += "\
      <div class='playerThumbnail playerThumbnail" + i + "'>\
        <div class='playerThumbnailContent'>\
          <div class='playerThumbnailNumber'>" + playerNames[i - 1] + "</div>\
          <div class='playerThumbnailAvatar playerThumbnailAvatar" + i + "'><img src='" + playerAvatars[i - 1] + "' /></div>\
          <div class='playerThumbnailAttempts playerThumbnailAttempts" + i + "'>";
          for (var j = 1; j <= PLAYER_MAX_ATTEMPTS; j++) {
            playerThumbnailsContent += "<div class='playerThumbnailAttempt playerThumbnailAttempt" + j + "'></div>";
          }
    playerThumbnailsContent += "\
          </div>\
          <div class='playerThumbnailScore'>0 pts</div>\
          <div class='playerThumbnailTime'>0 s</div>\
          <div class='playerBlockWrapper'>\
            <i class='fa-solid fa-user-lock fa-xl fa-beat playerBlockIcon'></i>\
            <div class='playerBlockProgressBar'>\
              <div class='playerBlockProgress progressBarProgress'></div>\
            </div>\
          </div>\
        </div>\
      </div>";
  }
  jQuery("#playerThumbnails").html(playerThumbnailsContent);

  playerThumbnailsIsotope = jQuery('#playerThumbnails').isotope({
    itemSelector: '.playerThumbnail',
    layoutMode: 'vertical',
    sortBy : [ 'score', 'time', 'name' ],
    sortAscending: {
      score: false,
      time: true,
      name: true
    },
    getSortData: {
      name: '.playerThumbnailNumber',
      score: '.playerThumbnailScore parseInt',
      time: '.playerThumbnailTime parseFloat'
    }
  });
}

function refreshPlayerThumbnails() {
  const playerPoints = computePlayerPoints();
  const playerTimes = computePlayerTimes();
  for (var i = 1; i <= nbPlayers; i++) {
    jQuery(".playerThumbnail" + i + " .playerThumbnailScore").html(playerPoints[i - 1] + " pts");
    jQuery(".playerThumbnail" + i + " .playerThumbnailTime").html(formatTime(playerTimes[i - 1]));
    for (var j = 1; j <= PLAYER_MAX_ATTEMPTS; j++) {
      const attemptsDiv = jQuery(".playerThumbnailAttempts" + i + " .playerThumbnailAttempt" + j);
      if (playerAttempts[i - 1] >= j) {
        attemptsDiv.addClass("checked");
      } else {
        attemptsDiv.removeClass("checked");
      }
    }
  }
  playerThumbnailsIsotope.isotope('updateSortData').isotope();
  playerThumbnailsIsotope.isotope('layout');
}
