const playerBuzzerKeyCodes = ['&', '"', '(', '_'];
const playerKeyboardKeyCodes = []; // ['w', 'v', 'j', 'p']
const playerPadKeyCodes = []; // ['1', '2', '3', '4']

const defaultPlaylists = [
  { id: '13680116321', selected: true, group: "Sélection MusiQuiz" }, // MusiQuiz
  { id: '13691114761', selected: true, group: "Sélection MusiQuiz", filmMode: true }, // MusiQuiz films
  { id: '13750363061', selected: true, group: "Sélection MusiQuiz", filmMode: true }, // MusiQuiz dessins animés
  { id: '13750382341', selected: true, group: "Sélection MusiQuiz", filmMode: true }, // MusiQuiz dessins animés TV
  { id: '13750382761', selected: true, group: "Sélection MusiQuiz", filmMode: true }, // MusiQuiz séries TV
  { id: '13750383261', selected: true, group: "Sélection MusiQuiz", filmMode: true }, // MusiQuiz émissions TV
  
  { id: '7273872044', selected: false, group: "Best of par décennie", title: "Best of 1980 > 1990" }, // Années 80
  { id: '7273887124', selected: false, group: "Best of par décennie", title: "Best of 1990 > 2000" }, // Années 90
  { id: '7273901224', selected: false, group: "Best of par décennie", title: "Best of 2000 > 2010" }, // Années 2000
  { id: '7273914324', selected: false, group: "Best of par décennie", title: "Best of 2010 > 2020" }, // Années 2010
  { id: '13200756823', selected: false, group: "Récents", title: "Hits 2024" }, // 2024 Hits France
  { id: '53362031', selected: false, group: "Récents"}, // Les titres du moments
  { id: '1109890291', selected: false, group: "Récents"}, // Top 100 France
  
  { id: '13628118681', selected: false, group: "Perso", title: "Playlist Sara" }, // Playlist Shara
  { id: '13668120261', selected: false, group: "Perso", title: "Playlist Sacha" }, // Playlist Sacha
  { id: '1106933581', selected: false, group: "Perso", title: "Playlist Nico" }, // Playlist Nico
  // { id: '6554940184', selected: false }, // Made in Spain
  // { id: '8979905582', selected: false }, // Hits cultes
  // { id: '5220852384', selected: false, title: "100% hits internationaux" }, // 100% hits internationaux
  // { id: '5242980142', selected: false }, // Hits internationaux
  // { id: '11506591244', selected: false }, // Hits internationaux années 80
  // { id: '1363560485', selected: false}, // Deezer hits
  // { id: '9633748382', selected: false}, // Let's sing 2022
];

var audioTimer, audioWrong, audioCorrect, audioEnd, audioBuzzers, audioApplause;
var keydownAnswerBlocked = false;

function loadSounds() {
  audioTimer = new Audio("sounds/timer.wav");
  audioWrong = new Audio("sounds/wrong.wav");
  audioCorrect = new Audio("sounds/correct.wav");
  audioEnd = new Audio("sounds/end3.mp3");
  audioApplause = new Audio("sounds/applause2.wav");
  audioBuzzers = [
    new Audio("sounds/buzzer2.wav"),
    new Audio("sounds/buzzer7.mp3"),
    new Audio("sounds/buzzer4.wav"),
    new Audio("sounds/buzzer6.wav"),
  ];

  loadAudio(audioTimer);
  loadAudio(audioWrong);
  loadAudio(audioCorrect);
  loadAudio(audioEnd);
  loadAudio(audioApplause);
  audioBuzzers.forEach(audioBuzzer => {
    loadAudio(audioBuzzer);
  });
}

async function loadAudio(audio) {
  audio.volume = 0;
  await audio.play();
  await sleep((audio.duration * 1000) + 1000);
  audio.volume = 1;
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function formatTime(time) {
  const roundedTime = Math.round(time * 100) / 100;
  return String(roundedTime).replace('.', ',') + " s";
}

function getTrackTitle(track) {
  if (track.title_fr && track.title_fr != '') {
    return track.title_fr;
  } else if (track.title_en && track.title_en != '') {
    return track.title_en;
  }
  return track.title_short;
}

function getTrackTitles(track) {
  const titles = [track.title_short];
  if (track.title_fr && track.title_fr != '') {
    titles.push(track.title_fr);
  }
  if (track.title_es && track.title_es != '') {
    titles.push(track.title_es);
  }
  if (track.title_en && track.title_en != '') {
    titles.push(track.title_en);
  }
  return titles;
}

function getTrackArtists(track) {
  if (track.contributors) {
    const artists = track.contributors.filter(contributor => contributor.type == 'artist');
    const result = [];
    artists.forEach(artist => {
      const names = getArtistNames(artist.name);
      result.push(...names);
    });
    return result;
  }
  return [track.artist.name];
}

function getArtistNames(artistName) {
  if (artistName.includes(" featuring ")) {
    return artistName.split(" featuring ");
  } else if (artistName.includes(" feat. ")) {
    return artistName.split(" feat. ");
  } else if (artistName.includes(" feat ")) {
    return artistName.split(" feat ");
  }
  return [artistName];
}

function computeTitleScore(answer, track) {
  const titles = getTrackTitles(track);
  let bestScore = 1;
  titles.forEach(title => {
    const score = computeScore(answer, title);

    console.log(answer + " / " + title + " : " + score);

    bestScore = Math.min(bestScore, score);
  });

  return bestScore;
}

function computeArtistScore(answer, track) {
  const artists = getTrackArtists(track);
  let bestScore = 1;
  artists.forEach(artist => {
    const score = computeScore(answer, artist);

    console.log(answer + " / " + artist + " : " + score);

    bestScore = Math.min(bestScore, score);
  });

  return bestScore;
}

function computeScore(answer, response) {
  let bestScore = 100;
  const length = answer.length;
  for (let i = 1; i <= length; i++) {
    const answerSubstring = answer.substring(0, i);
    const score = levenshteinDistance(answerSubstring, response);
    bestScore = Math.min(bestScore, score);
  }
  for (let i = 0; i <= length; i++) {
    const answerSubstring = answer.substring(i, length + 1);
    const score = levenshteinDistance(answerSubstring, response);
    bestScore = Math.min(bestScore, score);
  }
  return bestScore / cleanString(response).length;
}

function levenshteinDistance(s, t) {
  if (!s.length) return t.length;
  if (!t.length) return s.length;
  s = cleanString(s);
  t = cleanString(t);
  const arr = [];
  for (let i = 0; i <= t.length; i++) {
    arr[i] = [i];
    for (let j = 1; j <= s.length; j++) {
      arr[i][j] =
        i === 0
          ? j
          : Math.min(
              arr[i - 1][j] + 1,
              arr[i][j - 1] + 1,
              arr[i - 1][j - 1] + (s[j - 1] === t[i - 1] ? 0 : 1)
            );
    }
  }
  return arr[t.length][s.length];
}

function cleanString(str) {
  return str.toLowerCase().trim().normalize("NFD")
    .replace(/[\u0300-\u036f\u2019]/g, "")
    .replaceAll("p!nk", "pink")
    .replaceAll("&", "et")
    .replaceAll(" et ", "")
    .replaceAll(" and ", "")
    .replace(/[\.\,\!\;\:\'\"\?\!\ \-\_]/g, "")
    .replace(/[\&]/g, "")
    .replace(/ *\([^)]*\) */g, "")
    .replace(/ *\[[^\]]*\] */g, "");
}

async function playerAnswerKo(gameWindow) {
  await gameWindow.playAudio(gameWindow.audioWrong);
  gameWindow.audioPlay();
  refreshPlayerThumbnails();
}

async function playAudio(audio) {
  audio.volume = 1;
  audio.play();
  await sleep(audio.duration * 1000);
}

function getKeyPlayerPosition(key, nbPlayers) {
  if (key === playerBuzzerKeyCodes[0] ||
      (playerKeyboardKeyCodes.length >= 1 && key === playerKeyboardKeyCodes[0]) ||
      (playerPadKeyCodes.length >= 1 && key === playerPadKeyCodes[0])) {
    return 1;
  } else if ((key === playerBuzzerKeyCodes[1] ||
                (playerKeyboardKeyCodes.length >= 2 && key === playerKeyboardKeyCodes[1]) ||
                (playerPadKeyCodes.length >= 2 && key === playerPadKeyCodes[1])) &&
              nbPlayers >= 2) {
    return 2;
  } else if ((key === playerBuzzerKeyCodes[2] ||
                (playerKeyboardKeyCodes.length >= 3 && key === playerKeyboardKeyCodes[2]) ||
                (playerPadKeyCodes.length >= 3 && key === playerPadKeyCodes[2])) &&
              nbPlayers >= 3) {
    return 3;
  } else if ((key === playerBuzzerKeyCodes[3] ||
                (playerKeyboardKeyCodes.length >= 4 && key === playerKeyboardKeyCodes[3]) ||
                (playerPadKeyCodes.length >= 4 && key === playerPadKeyCodes[3])) &&
              nbPlayers >= 4) {
    return 4;
  }
  return 0;
}

window.addEventListener('keydown', async function(e) {
  const isPlayerTextAnswer = e.target.id == 'playerTextAnswer';
  const isPlayerNameInput = e.target.classList.contains('homeScreenStepPlayerNameInput');
  const isPlayerAvatarInput = e.target.classList.contains('homeScreenStepPlayerAvatarInput');
  const gw = typeof gameWindow == 'undefined' ? this.window : gameWindow;

  if (isPlayerTextAnswer) {
    if (e.key === 'Enter' && !gw.keydownAnswerBlocked) {
      gw.checkPlayerTextAnswer();
    } else if (playerBuzzerKeyCodes.includes(e.key) || gw.keydownAnswerBlocked) {
      // These keys should only be used by buzzers
      e.preventDefault();
    }
  } else if (gw.currentTrack && gw.currentTrack.playing) {
    const keyPlayerPosition = getKeyPlayerPosition(e.key, gw.nbPlayers);
    if (keyPlayerPosition > 0 && !gw.currentTrack.played && !gw.keydownAnswerBlocked) {
      gw.playerAnswer(keyPlayerPosition, gw);
      e.preventDefault();
    } else if (e.key === 'ArrowDown') {
      playerAnswerKo(gw);
      e.preventDefault();
    } else if (e.key === 'ArrowUp') {
      gw.goodAnswer(true, true);
      e.preventDefault();
    } else if (e.key === 'ArrowLeft') {
      gw.goodAnswer(true, false);
      e.preventDefault();
    } else if (e.key === 'ArrowRight') {
      gw.goodAnswer(false, true);
      e.preventDefault();
    } else if (e.key === 'Escape') {
      if (gw.playerAnsweringPosition == 0) {
        gw.displayCurrentTrackContent();
        gw.audioFadeOut(true);  
      }
    } else if (e.key === 'Pause') {
      if (gw.playerAnsweringPosition == 0) {
        gw.togglePause();
      }
    }
  } else if (isPlayerNameInput) {
    if (e.key === 'Enter') {
      jQuery('#' + e.target.id + 'Avatar').select();
    }
  } else if (isPlayerAvatarInput) {
    const keyPlayerPosition = getKeyPlayerPosition(e.key, gw.nbPlayers);
    if (e.target.id == 'homeScreenStepPlayer' + keyPlayerPosition + 'Avatar') {
      gw.selectNextAvatar(keyPlayerPosition);
      // Création d'une copie de l'audio sans quoi l'audio n'est pas toujours joué
      const audioModel = gw.audioBuzzers[keyPlayerPosition - 1];
      gw.playAudio(new Audio(audioModel.src));
      e.preventDefault();
    } else if (e.key === 'Enter') {
      const playerPosition = Number(jQuery(e.target).attr('playerPosition'));
      const nextPosition = playerPosition + 1;
      jQuery(".homeScreenStepPlayer" + playerPosition).hide();
      if (nextPosition > nbPlayers) {
        jQuery(".homeScreenStepStart").show();
        jQuery(".homeScreenStepStart .button").focus();
      } else {
        jQuery(".homeScreenStepPlayer" + nextPosition).show();
        jQuery("#homeScreenStepPlayer" + nextPosition).select();  
      }
    }
  }
});
