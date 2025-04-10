var gameWindow = window.opener;

function startGame() {
  gameWindow.startGame();
  jQuery('#startGameButton').hide();
}

function refreshAdminTrackList() {
  if (gameWindow.nbScreens >= 2) {
    let html = "";
    let index = 0;
    gameWindow.tracks.forEach(track => {
      index++;
      const trackTitle = getTrackTitle(track);
      const trackArtists = getTrackArtists(track);
      html += "\
        <div class='trackListItem " + (track.played ? 'played' : '') + " " + (track.playing ? 'playing' : '') + "'>" +
          index + ". " + trackTitle + " (" + trackArtists.join(' / ') + ")\
        </div>";
    });
    jQuery('#trackList').html(html);
  }
}
