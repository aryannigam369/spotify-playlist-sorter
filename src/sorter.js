const TEXT_FIELDS = new Set(["title", "artist", "album"]);

export function normalizeText(value) {
  return String(value ?? "")
    .trim()
    .toLocaleLowerCase("en-US");
}

export function durationLabel(durationMs) {
  const totalSeconds = Math.max(0, Math.round(Number(durationMs || 0) / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = String(totalSeconds % 60).padStart(2, "0");
  return `${minutes}:${seconds}`;
}

export function totalDurationLabel(tracks) {
  const totalMs = tracks.reduce((sum, track) => sum + Number(track.durationMs || 0), 0);
  const minutes = Math.round(totalMs / 60000);
  if (minutes < 60) {
    return `${minutes}m`;
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return `${hours}h ${remainingMinutes}m`;
}

export function smartFlowScore(track) {
  const popularity = Number(track.popularity || 0);
  const energy = Number(track.energy || 0) * 100;
  const releaseYear = Number(String(track.releaseDate || "").slice(0, 4)) || 2000;
  const recency = Math.max(0, Math.min(100, (releaseYear - 2015) * 8));

  return Math.round(popularity * 0.5 + energy * 0.28 + recency * 0.22);
}

export function getComparableValue(track, field) {
  if (field === "smart") {
    return smartFlowScore(track);
  }

  if (TEXT_FIELDS.has(field)) {
    return normalizeText(track[field]);
  }

  if (field === "releaseDate" || field === "addedAt") {
    return Date.parse(track[field] || "1970-01-01") || 0;
  }

  return Number(track[field] || 0);
}

export function sortTracks(tracks, field = "smart", direction = "desc") {
  const multiplier = direction === "asc" ? 1 : -1;

  return [...tracks].sort((left, right) => {
    const leftValue = getComparableValue(left, field);
    const rightValue = getComparableValue(right, field);

    if (leftValue < rightValue) {
      return -1 * multiplier;
    }

    if (leftValue > rightValue) {
      return 1 * multiplier;
    }

    return normalizeText(left.title).localeCompare(normalizeText(right.title));
  });
}

export function filterTracks(tracks, query) {
  const normalizedQuery = normalizeText(query);
  if (!normalizedQuery) {
    return [...tracks];
  }

  return tracks.filter((track) => {
    const searchable = [track.title, track.artist, track.album].map(normalizeText).join(" ");
    return searchable.includes(normalizedQuery);
  });
}

export function summarizePlaylist(tracks) {
  const safeTracks = [...tracks];
  const popularityTotal = safeTracks.reduce((sum, track) => sum + Number(track.popularity || 0), 0);
  const averagePopularity = safeTracks.length ? Math.round(popularityTotal / safeTracks.length) : 0;

  return {
    count: safeTracks.length,
    averagePopularity,
    totalDuration: totalDurationLabel(safeTracks)
  };
}

export function buildPlaylistPlan(tracks, field, direction) {
  const sorted = sortTracks(tracks, field, direction);
  return {
    name: `Sorted by ${field} (${direction})`,
    trackUris: sorted.map((track) => track.uri || `mock:${track.id}`),
    preview: sorted.slice(0, 5).map((track, index) => ({
      position: index + 1,
      title: track.title,
      artist: track.artist,
      score: smartFlowScore(track)
    }))
  };
}
