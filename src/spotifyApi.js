const SPOTIFY_API_BASE = "https://api.spotify.com/v1";

async function fetchJson(path, token, options = {}) {
  const response = await fetch(`${SPOTIFY_API_BASE}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...(options.headers || {})
    }
  });

  if (!response.ok) {
    throw new Error(`Spotify API request failed: ${response.status}`);
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

export async function getCurrentUser(token) {
  return fetchJson("/me", token);
}

export async function getMyPlaylists(token) {
  return fetchJson("/me/playlists?limit=50", token);
}

export async function getPlaylistItems(token, playlistId) {
  const items = [];
  let nextPath = `/playlists/${playlistId}/items?limit=50`;

  while (nextPath) {
    const page = await fetchJson(nextPath, token);
    items.push(...page.items);
    nextPath = page.next ? page.next.replace(SPOTIFY_API_BASE, "") : "";
  }

  return items
    .filter(({ track }) => track && track.id && track.uri)
    .map(({ added_at: addedAt, track }) => ({
      id: track.id,
      uri: track.uri,
      title: track.name,
      artist: (track.artists || []).map((artist) => artist.name).join(", ") || "Unknown artist",
      album: track.album?.name || "Unknown album",
      releaseDate: track.album?.release_date || "1970-01-01",
      addedAt,
      durationMs: track.duration_ms,
      popularity: track.popularity ?? 0,
      energy: 0
    }));
}

export async function createSortedPlaylist(token, name, description) {
  const payload = {
    name,
    description,
    public: false
  };

  return fetchJson("/me/playlists", token, {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export async function addItemsToPlaylist(token, playlistId, uris) {
  const chunks = [];
  for (let index = 0; index < uris.length; index += 100) {
    chunks.push(uris.slice(index, index + 100));
  }

  for (const chunk of chunks) {
    await fetchJson(`/playlists/${playlistId}/items`, token, {
      method: "POST",
      body: JSON.stringify({ uris: chunk })
    });
  }
}
