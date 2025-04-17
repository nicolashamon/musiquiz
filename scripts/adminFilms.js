const trackTranslations = {};
const trackImages = {};
var playedTrackId;
var audio;

async function loadPlaylists(playlists) {
  const promises = [];
  playlists.forEach(playlist => {
    if (playlist.filmMode) {
      promises.push(loadPlaylist(playlist));
    }
  });
  jQuery.when.apply(jQuery, promises).then(function(data) {
    const tracksTable = jQuery("#tracks-table");
    for (let i = 0; i < arguments.length; i++) {
      const playlist = arguments[i];
      tracksTable.append("<tr><td colspan='7'><div class='playlist-title'>" + playlist.title + " (" + playlist.tracks.data.length + " extraits)</div></td></tr>\n");
      playlist.tracks.data.forEach(track => {
        const trackTranslation = trackTranslations[track.id];
        const trackImage = trackImages[track.id];
        const addClass = (trackTranslation && trackTranslation.done == '1' ? "" : "untouched");
        tracksTable.append("\
          <tr>\
            <td><a href='javascript:playTrackPreview(" + track.id + ")'><span class='fa-solid fa-circle-play fa-xl track-play' id='track-play" + track.id + "'></span></a></td>\
            <td>\
              <div style=\"background-image:url('" + (trackImage ? trackImage.image : track.album.cover_small) + "')\" class='track-cover' id='image" + track.id + "'\
                onclick='openImageSelector(" + track.id + ")'></div>\
              <form action='updateTrackImage.php' method='post' enctype='multipart/form-data' class='imageForm'>\
                <input type='file' id='imageInput" + track.id + "' name='image" + track.id + "' onchange=\"updateTrackImage(" + track.id + ")\" />\
              </form>\
            </td>\
            <td>" + getTrackTitle(track).replace(/ *\([^)]*\) */g, "").replace(/ *\[[^\]]*\] */g, "") + "</td>\
            <td><input id='titleFr" + track.id + "' class='titleTranslation titleTranslationFr " + addClass + "' value=\"" + (trackTranslation ? trackTranslation.title_fr : "") + "\" onchange=\"updateTrackTranslation(" + track.id + ")\"/></td>\
            <td><input id='titleEs" + track.id + "' class='titleTranslation titleTranslationEs " + addClass + "' value=\"" + (trackTranslation ? trackTranslation.title_es : "") + "\" onchange=\"updateTrackTranslation(" + track.id + ")\"/></td>\
            <td><input id='titleEn" + track.id + "' class='titleTranslation titleTranslationEn " + addClass + "' value=\"" + (trackTranslation ? trackTranslation.title_en : "") + "\" onchange=\"updateTrackTranslation(" + track.id + ")\"/></td>\
            <td><div class='fa-solid fa-circle-check fa-xl track-updated' id='track-updated" + track.id + "'></div></td>\
          </tr>");
      });
    }
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
    data: "id=" + trackId + "&title_fr=" + jQuery('#titleFr' + trackId).val() + "&title_es=" + jQuery('#titleEs' + trackId).val() + "&title_en=" + jQuery('#titleEn' + trackId).val(),
    url : "updateTrackTranslation.php",
    success : function(data) {
      jQuery("#track-updated" + trackId).fadeIn(400, function() { setTimeout(() => { jQuery("#track-updated" + trackId).fadeOut(); }, 2000) });
      jQuery("#titleFr" + trackId).removeClass('untouched');
      jQuery("#titleEs" + trackId).removeClass('untouched');
      jQuery("#titleEn" + trackId).removeClass('untouched');
    },
    error : function(error) {
      console.log("[updateTrackTranslation error]", error);
    }
  });
}

function startsWith(str, suffix) {
  return str.indexOf(suffix) === 0;
}

function endsWith(str, suffix) {
  return str.indexOf(suffix, str.length - suffix.length) !== -1;
}

function openImageSelector(trackId) {
  jQuery('#imageInput' + trackId).click();
}

function updateTrackImage(trackId) {
  const image = jQuery('#imageInput' + trackId)[0].files[0];

  if (!endsWith(image.name.toLowerCase(), ".jpg")) {
    alert('Seuls les fichiers jpg sont autorisés !');
    jQuery('#imageInput').val(null);
    return false;
  }

  var formData = new FormData();
  formData.append('id', trackId);
  formData.append('image', image);
  jQuery.ajax({
    url : 'updateTrackImage.php',
    type : 'POST',
    data : formData,
    processData: false,  // tell jQuery not to process the data
    contentType: false,  // tell jQuery not to set contentType
    success : function(data) {
        jQuery('#image' + trackId).css("background-image", "url('" + data + "')");
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
