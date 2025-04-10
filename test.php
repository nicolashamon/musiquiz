<html>
  <head>
    <link rel="stylesheet" type="text/css" href="/styles/musiquiz.css?t=<?php echo stat("styles/musiquiz.css")["mtime"]; ?>" />
    <style>
      .trackResult {
        display: flex;
        flex-direction: row;
        align-items: center;
      }
      .testResult {
        width: 30px;
        height: 15px;
        border-radius: 4px;
        background-color: gray;
        margin-left: 10px;
        &.ko {
          background-color: red;
        }
        &.ok {
          background-color: green;
        }
      }
    </style>
    <script src="/scripts/jquery-3.7.1.min.js"></script>
    <script src="/scripts/gameUtils.js?t=<?php echo stat("scripts/gameUtils.js")["mtime"]; ?>"></script>
  </head>
  <body>

  <div id="trackList"></div>

  </body>
  <script>
    let result = "";
    const t1 = new Date().getTime();
    result += dumpLevenshteinDistance("texi", "y", ["texit"], false, true);
    result += dumpLevenshteinDistance("inxs", "Devil inside", ["INXS"], false, true);
    result += dumpLevenshteinDistance("ntm", "La fièvre", ["N.T.M."], false, true);
    result += dumpLevenshteinDistance("Big flo et oli", "Dommage", ["bigflo & oli"], false, true);
    result += dumpLevenshteinDistance("under presure", "Under pressure", ["Queen", "David Bowie"], true, false);
    result += dumpLevenshteinDistance("queen", "Under pressure", ["Queen", "David Bowie"], false, true);
    result += dumpLevenshteinDistance("david bowi", "Under pressure", ["Queen", "David Bowie"], false, true);
    result += dumpLevenshteinDistance("les champs elysees", "Les Champs-Elysées", ["Joe Dassin"], true, false);
    result += dumpLevenshteinDistance("les champs elysees joe dassin", "Les Champs-Elysées", ["Joe Dassin"], true, true);
    result += dumpLevenshteinDistance("paint it black rolling stones", "Paint it black", ["The Rolling Stones"], true, true);
    result += dumpLevenshteinDistance("avant      !!! toi vitaa     ", "[intro] avant toi (feat slimane)", ["Vitaa"], true, true);
    result += dumpLevenshteinDistance("aha", "Take on me", ["A-ha"], false, true);
    result += dumpLevenshteinDistance("fifty cent", "xxx", ["Yeah! (feat. Lil Jon & Ludacris)"], false, false);
    result += dumpLevenshteinDistance("no lo dudes mas", "No Me Ames", ["xxx"], false, false);
    result += dumpLevenshteinDistance("enfer", "L\u2019enfer", ["Stromae"], true, false);
    result += dumpLevenshteinDistance("me myself and i", "Me, Myself & I", ["G-Eazy"], true, false);
    result += dumpLevenshteinDistance("Vitaa", "Ca ira", ["Vitaa featuring Slimane"], false, true);
    result += dumpLevenshteinDistance("Slimane", "Beaux", ["Vitaa feat Slimane"], false, true);
    result += dumpLevenshteinDistance("Vitaa", "Beaux", ["Vitaa feat. Slimane"], false, true);
    result += dumpLevenshteinDistance("Simon and garfunkel", "The sound of silence", ["Simon & garfunkel"], false, true);
    result += dumpLevenshteinDistance("Pink", "Family portrait", ["P!nk"], false, true);
    const t2 = new Date().getTime();
    result += "<div>Temps total : " + (t2 - t1) + " ms</div>";
    jQuery("#trackList").html(result);

    function dumpLevenshteinDistance(answer, title, artistNames, titleOk, artistOk) {
      const levenshteinThreshold = 0.25;
      const track = { title_short: title, contributors: artistNames.map(artistName => { return { type: 'artist', name: artistName }; } ) };
      const titleDistance = computeTitleScore(answer, track);
      const artistDistance = computeArtistScore(answer, track);
      const resultOk = (titleOk == (titleDistance <= levenshteinThreshold)) && (artistOk == (artistDistance <= levenshteinThreshold));
      return "<div class='trackResult'>" + answer + " | " + title + " : " + titleDistance + " / " + artistNames + " : " + artistDistance +
              "<div class='testResult " + (resultOk ? "ok" : "ko") + "'></div></div>";
    }
  </script>
</html>
