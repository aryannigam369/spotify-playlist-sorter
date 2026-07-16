# Spotify Playlist Sorter

Public-safe Spotify playlist sorting app with mock demo mode, OAuth-ready architecture, tested sorting logic, and clean recruiter-facing documentation.

This project is a clean-room public rebuild of a playlist sorting concept. It does not contain school starter code, assignment materials, private tests, private data, or code from academic repositories.

Live demo: https://aryannigam369.github.io/spotify-playlist-sorter/

## What It Demonstrates

- Frontend product engineering with a usable playlist sorting interface
- Spotify Web API architecture using OAuth PKCE
- Privacy-aware design with mock demo mode and no committed secrets
- Sorting/filtering logic separated into testable pure functions
- Non-destructive product behavior: preview first, create a new sorted playlist second
- CI-ready repo hygiene with unit tests and syntax checks

## Features

- Mock playlist demo that works immediately
- Sort by smart flow score, popularity, release date, duration, artist, title, album, or added date
- Filter tracks by artist, title, or album
- Playlist summary metrics
- Sorted playlist preview plan
- Spotify-ready modules for OAuth, playlist fetching, playlist creation, and playlist item insertion

## Run Locally

This app is intentionally dependency-light.

```bash
python3 -m http.server 5173
```

Then open:

```text
http://127.0.0.1:5173/
```

Run checks with Node:

```bash
npm run check
npm test
```

## Spotify Setup

Create a Spotify Developer app and add this redirect URI for local testing:

```text
http://127.0.0.1:5173/
```

Use OAuth PKCE. Do not create or commit a client secret for this browser-only app.

## Public-Safe Boundary

Most academic repositories should stay private when they contain course code, starter files, grading tests, or teammate work. This repo exists so the product idea can be shown publicly without exposing protected material.

See [docs/clean-room.md](docs/clean-room.md).

## Status

First public version:

- mock demo complete
- sorting engine complete
- tests complete
- Spotify OAuth/API scaffolding ready
- real playlist picker next

## Ownership

Copyright Aryan Nigam. No license is granted at this time.
