# Product Spec

## Problem

Spotify playlists get messy over time. Users often want a safer way to reorganize tracks by metadata, release date, popularity, duration, or custom flow without manually dragging hundreds of songs.

## Solution

Playlist Sorter Lab lets a user preview a sorted version of a playlist and create a new playlist from that ordering.

The app never edits the original playlist by default.

## Current Features

- Mock demo mode for public portfolio review
- Sort by smart flow score, popularity, release date, duration, artist, title, album, and added date
- Filter by artist, track, or album
- Playlist stats for count, average popularity, and runtime
- OAuth PKCE-ready Spotify login
- Spotify API wrapper for current user, playlists, playlist items, playlist creation, and item insertion
- Unit-tested sorting engine
- GitHub Actions CI workflow

## Future Features

- Full playlist picker after OAuth
- Create sorted playlist from a selected source playlist
- Save named sort recipes
- Compare original order versus sorted order
- Export a shareable sort report
- Add GitHub Pages deployment

## Non-Goals

- No school code
- No audio analysis endpoint dependency
- No recommendation endpoint dependency
- No client secret in browser code
- No destructive overwrite of the original playlist
