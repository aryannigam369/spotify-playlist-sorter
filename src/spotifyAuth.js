const AUTH_ENDPOINT = "https://accounts.spotify.com/authorize";
const TOKEN_ENDPOINT = "https://accounts.spotify.com/api/token";
const VERIFIER_KEY = "playlist-sorter-code-verifier";
const CLIENT_ID_KEY = "playlist-sorter-client-id";
const SCOPES = [
  "playlist-read-private",
  "playlist-read-collaborative",
  "playlist-modify-public",
  "playlist-modify-private"
];

function base64UrlEncode(bytes) {
  return btoa(String.fromCharCode(...new Uint8Array(bytes)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

export function getRedirectUri() {
  return `${window.location.origin}${window.location.pathname}`;
}

export function saveClientId(clientId) {
  localStorage.setItem(CLIENT_ID_KEY, clientId.trim());
}

export function getSavedClientId() {
  return localStorage.getItem(CLIENT_ID_KEY) || "";
}

export async function createCodeChallenge(verifier) {
  const encoded = new TextEncoder().encode(verifier);
  const digest = await crypto.subtle.digest("SHA-256", encoded);
  return base64UrlEncode(digest);
}

export function createCodeVerifier() {
  const bytes = new Uint8Array(64);
  crypto.getRandomValues(bytes);
  return base64UrlEncode(bytes);
}

export async function redirectToSpotifyLogin(clientId) {
  const verifier = createCodeVerifier();
  const challenge = await createCodeChallenge(verifier);
  localStorage.setItem(VERIFIER_KEY, verifier);
  saveClientId(clientId);

  const params = new URLSearchParams({
    response_type: "code",
    client_id: clientId,
    scope: SCOPES.join(" "),
    redirect_uri: getRedirectUri(),
    code_challenge_method: "S256",
    code_challenge: challenge
  });

  window.location.assign(`${AUTH_ENDPOINT}?${params.toString()}`);
}

export async function exchangeCodeForToken(code) {
  const verifier = localStorage.getItem(VERIFIER_KEY);
  const clientId = getSavedClientId();

  if (!verifier || !clientId) {
    throw new Error("Missing stored Spotify verifier or client ID.");
  }

  const response = await fetch(TOKEN_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: new URLSearchParams({
      client_id: clientId,
      grant_type: "authorization_code",
      code,
      redirect_uri: getRedirectUri(),
      code_verifier: verifier
    })
  });

  if (!response.ok) {
    throw new Error(`Spotify token exchange failed with ${response.status}.`);
  }

  return response.json();
}
