const TEXT_FIELDS = new Set(["title", "artist", "album"]);
const CURRENT_YEAR = 2026;

export function normalizeText(value) {
  return String(value ?? "")
    .trim()
    .toLocaleLowerCase("en-US");
}

function clamp(value, min = 0, max = 100) {
  return Math.max(min, Math.min(max, value));
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
  const popularity = clamp(Number(track.popularity || 0));
  const rawEnergy = Number(track.energy);
  const energy = rawEnergy > 0 ? clamp(rawEnergy * 100) : inferEnergyScore(track);
  const releaseYear = Number(String(track.releaseDate || "").slice(0, 4)) || 2000;
  const recency = clamp(100 - Math.max(0, CURRENT_YEAR - releaseYear) * 5);
  const durationMinutes = Number(track.durationMs || 0) / 60000;
  const durationFit = clamp(100 - Math.abs(durationMinutes - 3.75) * 22);
  const addedAtMs = Date.parse(track.addedAt || "");
  const monthsSinceAdded = Number.isFinite(addedAtMs)
    ? Math.max(0, (Date.UTC(CURRENT_YEAR, 6, 1) - addedAtMs) / (1000 * 60 * 60 * 24 * 30))
    : 12;
  const momentum = clamp(100 - monthsSinceAdded * 8);
  const discoverySweetSpot = clamp(100 - Math.abs(popularity - 78) * 2.2);

  return Math.round(
    popularity * 0.3 +
      energy * 0.24 +
      recency * 0.16 +
      durationFit * 0.14 +
      momentum * 0.1 +
      discoverySweetSpot * 0.06
  );
}

function inferEnergyScore(track) {
  const text = normalizeText(`${track.title} ${track.artist} ${track.album}`);
  const highEnergyHints = ["race", "anthem", "dance", "party", "summer", "mustang", "mountain", "west coast"];
  const lowEnergyHints = ["blue", "sad", "honeymoon", "woman", "die", "white", "slow", "dream"];
  const highBoost = highEnergyHints.reduce((score, hint) => score + (text.includes(hint) ? 8 : 0), 0);
  const lowPenalty = lowEnergyHints.reduce((score, hint) => score + (text.includes(hint) ? 6 : 0), 0);

  return clamp(50 + highBoost - lowPenalty);
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
