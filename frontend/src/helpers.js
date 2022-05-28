export function sortEventsByDate(events) {
  return events.sort((a, b) => {
    let startA = new Date(a.start);
    let startB = new Date(b.start);

    return startA - startB;
  });
}

export function sortEventsByArtistName(events) {
  return events.sort((a, b) => {
    let artistA = a.title.toLowerCase();
    let artistB = b.title.toLowerCase();

    if (artistA < artistB) {
      return -1;
    }
    if (artistA > artistB) {
      return 1;
    }
    return 0;
  });
}

export function sortEventsByGenre(events) {
  return events.sort((a, b) => {
    let genreA = a.genre.toLowerCase();
    let genreB = b.genre.toLowerCase();

    if (genreA < genreB) {
      return -1;
    }
    if (genreA > genreB) {
      return 1;
    }
    return 0;
  });
}

export function sortEventsByStage(events) {
  return events.sort((a, b) => {
    let stageA = a.location.toLowerCase();
    let stageB = b.location.toLowerCase();

    if (stageA < stageB) {
      return -1;
    }
    if (stageA > stageB) {
      return 1;
    }
    return 0;
  });
}
