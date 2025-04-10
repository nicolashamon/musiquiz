const trackTranslations = [];
var playedTrackId;
var audio;

async function loadPlaylists(playlists) {
  const promises = [];
  playlists.forEach(playlist => {
    if (playlist.titleOnly) {
      promises.push(loadPlaylist(playlist));
    }
  });
  jQuery.when.apply(jQuery, promises).then(function(data) {
    const tracksTable = jQuery("#tracks-table");
    data.tracks.data.forEach(track => {
      const trackTranslation = trackTranslations.find((trackTranslationTmp) => trackTranslationTmp.track_id == track.id);
      const addClass = (trackTranslation && trackTranslation.done == '1' ? "" : "untouched");
      tracksTable.append("\
        <tr>\
          <td><a href='javascript:playTrackPreview(" + track.id + ")'><span class='fa-solid fa-circle-play fa-xl track-play' id='track-play" + track.id + "'></span></a></td>\
          <td><img src='" + track.album.cover_small + "' class='track-cover' /></td>\
          <td>" + getTrackTitle(track) + "</td>\
          <td>\
            <select id='type" + track.id + "' class='" + addClass + "' onchange=\"updateTrackTranslation(" + track.id + ")\">\
              <option value='FILM' " + (!trackTranslation || trackTranslation.type == 'FILM' ? "selected" : "")  + ">film</option>\
              <option value='SERIE' " + (trackTranslation && trackTranslation.type == 'SERIE' ? "selected" : "")  + ">série</option>\
              <option value='DESSIN_ANIME' " + (trackTranslation && trackTranslation.type == 'DESSIN_ANIME' ? "selected" : "")  + ">dessin animé</option>\
              <option value='DESSIN_ANIME_TV' " + (trackTranslation && trackTranslation.type == 'DESSIN_ANIME_TV' ? "selected" : "")  + ">dessin animé télé</option>\
              <option value='EMISSION' " + (trackTranslation && trackTranslation.type == 'EMISSION' ? "selected" : "")  + ">émission</option>\
            </select>\
          </td>\
          <td><input id='titleFr" + track.id + "' class='titleTranslation titleTranslationFr " + addClass + "' value=\"" + (trackTranslation ? trackTranslation.title_fr : "") + "\" onchange=\"updateTrackTranslation(" + track.id + ")\"/></td>\
          <td><input id='titleEs" + track.id + "' class='titleTranslation titleTranslationEs " + addClass + "' value=\"" + (trackTranslation ? trackTranslation.title_es : "") + "\" onchange=\"updateTrackTranslation(" + track.id + ")\"/></td>\
          <td><input id='titleEn" + track.id + "' class='titleTranslation titleTranslationEn " + addClass + "' value=\"" + (trackTranslation ? trackTranslation.title_en : "") + "\" onchange=\"updateTrackTranslation(" + track.id + ")\"/></td>\
          <td><div class='fa-solid fa-circle-check fa-xl track-updated' id='track-updated" + track.id + "'></div></td>\
        </tr>");
    });
  }, function(err) {
    console.log("[loadPlaylists error]", err);
  });
}

async function loadPlaylist(playlist) {
  const result = await jQuery.ajax({
    type : "GET",
    data: "id=" + playlist.id,
    dataType: "json",
    url : "loadPlaylist.php",
    success : function(data) {
    },
    error : function(error) {
      console.log("[loadPlaylist error]", error);
    }
  });
  return result;
}

async function updateTrackTranslation(trackId) {
  await jQuery.ajax({
    type : "GET",
    data: "id=" + trackId + "&type=" + jQuery('#type' + trackId).val() + "&title_fr=" + jQuery('#titleFr' + trackId).val() + "&title_es=" + jQuery('#titleEs' + trackId).val() + "&title_en=" + jQuery('#titleEn' + trackId).val(),
    url : "updateTrackTranslation.php",
    success : function(data) {
      jQuery("#track-updated" + trackId).fadeIn(400, function() { setTimeout(() => { jQuery("#track-updated" + trackId).fadeOut(); }, 2000) });
      jQuery("#type" + trackId).removeClass('untouched');
      jQuery("#titleFr" + trackId).removeClass('untouched');
      jQuery("#titleEs" + trackId).removeClass('untouched');
      jQuery("#titleEn" + trackId).removeClass('untouched');
    },
    error : function(error) {
      console.log("[updateTrackTranslation error]", error);
    }
  });
}

async function playTrackPreview(trackId) {
  if (audio && jQuery("#track-play" + trackId).hasClass("fa-circle-pause")) {
    jQuery("#track-play" + trackId).addClass("fa-circle-play").removeClass("fa-circle-pause");
    audio.pause();
    return;
  }
  const track = await jQuery.ajax({
    type : "GET",
    data: "id=" + trackId,
    dataType: "json",
    url : "loadTrack.php"
  });

  if (audio) {
    audio.pause();
  }
  jQuery(".track-play").addClass("fa-circle-play").removeClass("fa-circle-pause");
  jQuery("#track-play" + trackId).addClass("fa-circle-pause").removeClass("fa-circle-play");
  playedTrackId = trackId;
  audio = new Audio(track.preview);
  audio.addEventListener("ended", (event) => {
    jQuery("#track-play" + trackId).addClass("fa-circle-play").removeClass("fa-circle-pause");
  });
  audio.play();
}
