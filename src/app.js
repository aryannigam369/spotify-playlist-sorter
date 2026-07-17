import { mockPlaylist } from "./mockData.js?v=20260717-lana-score";
import {
  buildPlaylistPlan,
  durationLabel,
  filterTracks,
  smartFlowScore,
  sortTracks,
  summarizePlaylist
} from "./sorter.js?v=20260717-lana-score";
import { exchangeCodeForToken, getSavedClientId, redirectToSpotifyLogin } from "./spotifyAuth.js";
import {
  getCurrentUser,
  getMyPlaylists,
  getPlaylistItems
} from "./spotifyApi.js?v=20260717-owned-items";

const state = {
  source: "mock",
  direction: "desc",
  field: "smart",
  query: "",
  playlist: mockPlaylist,
  accessToken: sessionStorage.getItem("playlist-sorter-access-token") || "",
  spotifyUser: null,
  spotifyPlaylists: [],
  supportedSpotifyPlaylists: []
};

const elements = {
  sourceButtons: [...document.querySelectorAll("[data-source]")],
  directionButtons: [...document.querySelectorAll("[data-direction]")],
  spotifySetup: document.querySelector("#spotify-setup"),
  spotifyLibrary: document.querySelector("#spotify-library"),
  spotifyStatus: document.querySelector("#spotify-status"),
  playlistSelect: document.querySelector("#playlist-select"),
  loadPlaylist: document.querySelector("#load-playlist"),
  clientId: document.querySelector("#client-id"),
  connectSpotify: document.querySelector("#connect-spotify"),
  sortField: document.querySelector("#sort-field"),
  query: document.querySelector("#query"),
  playlistName: document.querySelector("#playlist-name"),
  trackCount: document.querySelector("#track-count"),
  avgPopularity: document.querySelector("#avg-popularity"),
  totalDuration: document.querySelector("#total-duration"),
  table: document.querySelector("#track-table"),
  createPlaylist: document.querySelector("#create-playlist"),
  planPanel: document.querySelector("#plan-panel"),
  publishCopy: document.querySelector("#publish-copy")
};

function activeTracks() {
  const filtered = filterTracks(state.playlist.tracks, state.query);
  return sortTracks(filtered, state.field, state.direction);
}

function renderStats(tracks) {
  const summary = summarizePlaylist(tracks);
  elements.trackCount.textContent = String(summary.count);
  elements.avgPopularity.textContent = String(summary.averagePopularity);
  elements.totalDuration.textContent = summary.totalDuration;
}

function renderTable(tracks) {
  elements.table.innerHTML = tracks
    .map((track, index) => {
      const releaseYear = String(track.releaseDate || "Unknown").slice(0, 4);
      return `
        <tr>
          <td>${index + 1}</td>
          <td>
            <div class="track-title">${track.title}</div>
            <div class="track-meta">Smart flow score: ${smartFlowScore(track)}</div>
          </td>
          <td>${track.artist}</td>
          <td>${track.album}</td>
          <td>${releaseYear}</td>
          <td><span class="score-pill">${track.popularity}</span></td>
          <td>${durationLabel(track.durationMs)}</td>
        </tr>
      `;
    })
    .join("");
}

function renderPlan() {
  const plan = buildPlaylistPlan(activeTracks(), state.field, state.direction);
  elements.planPanel.innerHTML = `
    <h3>Sorted playlist preview</h3>
    <ol>
      ${plan.preview
        .map((track) => `<li>${track.position}. ${track.title} - ${track.artist} | flow score ${track.score}</li>`)
        .join("")}
    </ol>
  `;
}

function render() {
  elements.playlistName.textContent = state.playlist.name;
  elements.spotifySetup.classList.toggle("hidden", state.source !== "spotify");
  elements.spotifyLibrary.classList.toggle("hidden", state.source !== "spotify" || !state.accessToken);
  elements.publishCopy.textContent =
    state.source === "spotify"
      ? "Spotify mode previews owned or collaborative playlists without changing your account."
      : "Mock mode previews the creation plan without touching any real Spotify account.";

  const tracks = activeTracks();
  renderStats(tracks);
  renderTable(tracks);
}

function setSpotifyStatus(message) {
  elements.spotifyStatus.textContent = message;
}

function isSupportedSpotifyPlaylist(playlist) {
  return playlist.owner?.id === state.spotifyUser?.id || playlist.collaborative === true;
}

function populatePlaylistSelect(playlists) {
  elements.playlistSelect.innerHTML = playlists
    .map((playlist) => {
      const trackCount = playlist.items?.total ?? playlist.tracks?.total;
      const countLabel = Number.isFinite(trackCount) ? `${trackCount} tracks` : "track count unavailable";
      return `<option value="${playlist.id}">${playlist.name} (${countLabel})</option>`;
    })
    .join("");
}

async function loadSpotifyAccount() {
  if (!state.accessToken) {
    return;
  }

  setSpotifyStatus("Loading Spotify playlists...");
  const [user, playlistsPage] = await Promise.all([
    getCurrentUser(state.accessToken),
    getMyPlaylists(state.accessToken)
  ]);

  state.spotifyUser = user;
  state.spotifyPlaylists = playlistsPage.items || [];
  state.supportedSpotifyPlaylists = state.spotifyPlaylists.filter(isSupportedSpotifyPlaylist);
  populatePlaylistSelect(state.supportedSpotifyPlaylists);

  if (state.supportedSpotifyPlaylists.length === 0) {
    setSpotifyStatus(
      `Connected as ${user.display_name || user.id}. Spotify only exposes track details for playlists you own or collaborate on.`
    );
  } else {
    setSpotifyStatus(
      `Connected as ${user.display_name || user.id}. Showing ${state.supportedSpotifyPlaylists.length} playlists Spotify allows this app to read.`
    );
  }
  render();
}

async function loadSelectedSpotifyPlaylist() {
  const playlistId = elements.playlistSelect.value;
  const playlist = state.supportedSpotifyPlaylists.find((item) => item.id === playlistId);

  if (!playlist) {
    setSpotifyStatus("Choose a Spotify playlist first.");
    return;
  }

  setSpotifyStatus(`Loading ${playlist.name}...`);
  const tracks = await getPlaylistItems(state.accessToken, playlist.id);
  state.playlist = {
    id: playlist.id,
    name: playlist.name,
    owner: playlist.owner?.display_name || "Spotify user",
    tracks
  };
  setSpotifyStatus(`Loaded ${tracks.length} tracks from ${playlist.name}.`);
  render();
}

function setActiveButton(buttons, activeValue, dataKey) {
  buttons.forEach((button) => {
    button.classList.toggle("active", button.dataset[dataKey] === activeValue);
  });
}

elements.clientId.value = getSavedClientId();

elements.sourceButtons.forEach((button) => {
  button.addEventListener("click", () => {
    state.source = button.dataset.source;
    setActiveButton(elements.sourceButtons, state.source, "source");
    render();
  });
});

elements.directionButtons.forEach((button) => {
  button.addEventListener("click", () => {
    state.direction = button.dataset.direction;
    setActiveButton(elements.directionButtons, state.direction, "direction");
    render();
  });
});

elements.sortField.addEventListener("change", () => {
  state.field = elements.sortField.value;
  render();
});

elements.query.addEventListener("input", () => {
  state.query = elements.query.value;
  render();
});

elements.connectSpotify.addEventListener("click", async () => {
  const clientId = elements.clientId.value.trim();
  if (!clientId) {
    elements.planPanel.innerHTML = "<h3>Spotify setup needed</h3><p>Add a Spotify client ID before starting OAuth.</p>";
    return;
  }

  await redirectToSpotifyLogin(clientId);
});

elements.loadPlaylist.addEventListener("click", async () => {
  try {
    await loadSelectedSpotifyPlaylist();
  } catch (error) {
    setSpotifyStatus(error.message);
  }
});

elements.createPlaylist.addEventListener("click", async () => {
  renderPlan();
  if (state.source === "spotify" && state.accessToken) {
    setSpotifyStatus("Preview ready. Playlist creation is intentionally disabled until an explicit create flow is added.");
  }
});

async function handleSpotifyCallback() {
  const params = new URLSearchParams(window.location.search);
  const code = params.get("code");

  if (!code) {
    return;
  }

  state.source = "spotify";
  setActiveButton(elements.sourceButtons, state.source, "source");

  try {
    setSpotifyStatus("Completing Spotify login...");
    const tokenPayload = await exchangeCodeForToken(code);
    state.accessToken = tokenPayload.access_token;
    sessionStorage.setItem("playlist-sorter-access-token", state.accessToken);
    window.history.replaceState({}, document.title, window.location.pathname);
    await loadSpotifyAccount();
  } catch (error) {
    setSpotifyStatus(error.message);
  }
}

render();
handleSpotifyCallback();
if (state.accessToken) {
  loadSpotifyAccount().catch((error) => setSpotifyStatus(error.message));
}
