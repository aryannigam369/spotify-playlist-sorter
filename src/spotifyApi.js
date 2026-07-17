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
    if (response.status === 403) {
      throw new Error(
        "Spotify denied access to those playlist details. In Development Mode, try a playlist you created, confirm the app owner has Spotify Premium, or use Mock demo."
      );
    }
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
    .map(({ added_at: addedAt, item, track }) => ({ addedAt, media: item || track }))
    .filter(({ media }) => media && media.type === "track" && media.id && media.uri)
    .map(({ addedAt, media }) => ({
      id: media.id,
      uri: media.uri,
      title: media.name,
      artist: (media.artists || []).map((artist) => artist.name).join(", ") || "Unknown artist",
      album: media.album?.name || "Unknown album",
      releaseDate: media.album?.release_date || "1970-01-01",
      addedAt,
      durationMs: media.duration_ms,
      popularity: media.popularity ?? 0,
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
