# Spotify Playlist Sorter: Non-Coder Builder Guide

This guide explains the project in plain language.

Use it if you want to understand, demo, rebuild, or explain the app without needing to already be a professional developer.

Live demo: https://aryannigam369.github.io/spotify-playlist-sorter/

Repository: https://github.com/aryannigam369/spotify-playlist-sorter

## 1. What This App Does

Spotify Playlist Sorter helps someone reorganize a playlist without manually dragging songs one by one.

The app can:

- show a playlist
- sort songs by useful information
- filter songs by track, artist, or album
- preview a new sorted playlist
- prepare to connect to a real Spotify account
- create a new sorted playlist instead of changing the original

The public demo uses fake sample songs, not real user data.

That is intentional. It lets recruiters try the product immediately without logging into Spotify.

## 2. Why This Project Exists

The original idea came from an academic/private playlist sorter project.

That private version may include school-provided code, class structure, assignment rules, or protected material.

This public version is different.

It is a clean-room rebuild, which means:

- new code
- new file structure
- mock data
- no school starter code
- no private tests
- no assignment prompt
- no teammate code
- no exposed secrets

This lets the project show real engineering skill without creating academic integrity risk.

## 3. What A Recruiter Should See

This project is meant to prove that Aryan can build product-minded software, not just write isolated code.

It shows:

- JavaScript frontend engineering
- API integration planning
- OAuth login architecture
- privacy-aware product decisions
- sorting and filtering logic
- clean UI design
- unit testing
- GitHub Actions CI
- GitHub Pages deployment
- clear documentation

The strongest signal is that the app is usable, documented, tested, and deployed.

## 4. The App In One Sentence

Playlist Sorter Lab is a public-safe web app that previews and creates better-ordered Spotify playlists using tested sorting logic and Spotify-ready API architecture.

## 5. What The User Sees

When someone opens the live demo, they see:

1. A title: Playlist Sorter Lab
2. A data source switch: Mock demo or Spotify-ready
3. Sorting controls
4. A filter box
5. Playlist stats
6. A track table
7. A preview button

The demo starts in Mock demo mode.

That means the app works immediately even if the visitor does not have Spotify connected.

## 6. What The Buttons Mean

### Mock demo

Uses fake playlist data stored inside the app.

This is best for recruiters because it works instantly.

### Spotify-ready

Shows the login setup for connecting a real Spotify app.

This path is prepared in the code, but it needs a Spotify Developer client ID to fully use real playlists.

### Sort by

Changes how the songs are ordered.

Current options:

- Smart flow score
- Popularity
- Release date
- Duration
- Artist
- Title
- Album
- Recently added

### Direction

Controls whether sorting goes high-to-low or low-to-high.

Example:

- High-to-low popularity shows popular songs first.
- Low-to-high duration shows shorter songs first.

### Filter tracks

Lets the user search inside the playlist.

Typing an artist, song, or album narrows the table.

### Preview sorted playlist

Shows what the new sorted playlist would look like before creating anything.

This is safer than instantly changing a user's real playlist.

## 7. The Important Product Decision

The app does not overwrite the original playlist.

Instead, it is designed to create a new sorted playlist.

That matters because it protects the user from accidentally losing their original playlist order.

This is a product-minded engineering choice.

## 8. How The App Works In Simple Terms

Think of the app like a small restaurant menu organizer.

The playlist is the menu.

Each song is one menu item.

Each song has facts attached to it:

- title
- artist
- album
- release date
- duration
- popularity
- date added

The app takes all the songs, compares one fact at a time, and rearranges them.

For example:

- sort by popularity
- sort by release date
- sort alphabetically by artist
- sort by a custom smart score

Then it displays the new order.

## 9. The Smart Flow Score

The smart flow score is a custom ranking number.

It combines:

- popularity
- energy-like mock value
- recency

In plain English: it tries to put songs that feel stronger, newer, or more relevant near the top.

The formula lives in:

```text
src/sorter.js
```

The function is called:

```text
smartFlowScore()
```

## 10. Main Files And What They Do

### index.html

This is the page structure.

It creates the visible parts of the app:

- header
- buttons
- dropdowns
- input box
- playlist table
- stats panel

### styles.css

This controls how the app looks.

It handles:

- colors
- spacing
- layout
- mobile responsiveness
- buttons
- table styling

### src/app.js

This is the app controller.

It listens for user actions like:

- clicking buttons
- changing sort options
- typing in the filter box
- previewing a sorted playlist

It updates the page whenever the user changes something.

### src/sorter.js

This is the logic engine.

It contains the code for:

- sorting tracks
- filtering tracks
- calculating duration labels
- calculating playlist summary stats
- building a sorted playlist plan

This file is intentionally separate so it can be tested.

### src/mockData.js

This contains the fake demo playlist.

It lets the app work without Spotify login.

### src/spotifyAuth.js

This handles Spotify login planning.

It uses OAuth PKCE, which is the right approach for browser apps because it does not require storing a client secret in the frontend.

### src/spotifyApi.js

This contains helper functions for Spotify API calls.

It is responsible for talking to Spotify after login.

### tests/sorter.test.mjs

This tests the sorting logic.

It checks that the app sorts and summarizes playlists correctly.

### .github/workflows/ci.yml

This tells GitHub to run checks automatically.

When code changes, GitHub Actions runs:

- syntax checks
- unit tests

### .nojekyll

This tells GitHub Pages to serve the app as plain static files.

It avoids GitHub Pages trying to process the project as a Jekyll website.

## 11. APIs Used

The app is prepared to use the Spotify Web API.

An API is a way for one app to ask another app for information or actions.

In this project, our app asks Spotify things like:

- Who is the current user?
- What playlists does the user have?
- What tracks are inside this playlist?
- Can you create a new playlist?
- Can you add these tracks to the new playlist?

## 12. Spotify API Endpoints In This Project

### Login

The app uses Spotify OAuth with PKCE.

PKCE is useful for browser apps because the app does not need to store a secret key.

Official Spotify docs:

- https://developer.spotify.com/documentation/web-api/concepts/authorization
- https://developer.spotify.com/documentation/web-api/tutorials/code-pkce-flow

### Get current user

```text
GET /me
```

Used to know which Spotify user is logged in.

### Get user's playlists

```text
GET /me/playlists
```

Used to show the user's playlists.

### Get playlist items

```text
GET /playlists/{playlist_id}/items
```

Used to get the songs inside a playlist.

Official Spotify docs:

- https://developer.spotify.com/documentation/web-api/reference/get-playlists-items

### Create a new playlist

```text
POST /me/playlists
```

Used to create an empty sorted playlist for the current user.

Official Spotify docs:

- https://developer.spotify.com/documentation/web-api/reference/create-playlist

### Add items to a playlist

```text
POST /playlists/{id}/items
```

Used to add sorted songs into the new playlist.

Important: Spotify's newer docs and migration notes point developers toward `/items` instead of older `/tracks` playlist endpoints.

Official Spotify changelog:

- https://developer.spotify.com/documentation/web-api/references/changes/february-2026
- https://developer.spotify.com/documentation/web-api/tutorials/february-2026-migration-guide

## 13. Spotify Permissions Used

Spotify calls these permissions scopes.

This app prepares for:

```text
playlist-read-private
playlist-read-collaborative
playlist-modify-public
playlist-modify-private
```

Plain English:

- read private playlists
- read collaborative playlists
- create or modify public playlists
- create or modify private playlists

The app should ask only for permissions it needs.

## 14. Skills This Project Shows

### Frontend skills

- HTML
- CSS
- JavaScript
- DOM updates
- responsive layout
- accessible form controls

### Product skills

- mock demo mode for easy review
- non-destructive playlist creation
- clear user controls
- preview before action
- recruiter-friendly live demo

### API skills

- Spotify Web API planning
- OAuth PKCE flow
- access token handling
- playlist read/write endpoints
- API error handling

### Engineering skills

- sorting algorithms
- filtering logic
- pure functions
- unit testing
- CI with GitHub Actions
- deployment with GitHub Pages
- clean documentation

### Privacy and safety skills

- no secrets committed
- no private data committed
- no school code exposed
- mock data for public demo
- original clean-room rebuild

## 15. How To Rebuild This From Scratch

Follow these steps if you want to rebuild the app yourself.

### Step 1: Make a folder

Create a folder called:

```text
spotify-playlist-sorter
```

### Step 2: Create the basic files

Inside the folder, create:

```text
index.html
styles.css
package.json
README.md
.gitignore
.env.example
.nojekyll
```

Create these folders:

```text
src
tests
docs
.github/workflows
```

### Step 3: Build the visible page

In `index.html`, create:

- a header
- data source buttons
- a sorting dropdown
- direction buttons
- a filter input
- a table for tracks
- a preview panel

### Step 4: Add styling

In `styles.css`, make the app:

- readable
- responsive
- high contrast
- organized
- clean enough for a recruiter to scan

### Step 5: Add mock data

In `src/mockData.js`, create a fake playlist.

Each track should have:

```text
id
title
artist
album
releaseDate
addedAt
durationMs
popularity
energy
```

### Step 6: Write sorting logic

In `src/sorter.js`, write functions that:

- sort tracks
- filter tracks
- calculate smart score
- summarize playlist stats
- build preview plan

### Step 7: Connect the UI

In `src/app.js`, make the page respond when the user:

- changes sort type
- changes direction
- types in the filter box
- clicks preview
- switches between mock mode and Spotify-ready mode

### Step 8: Add Spotify login planning

In `src/spotifyAuth.js`, prepare OAuth PKCE.

Do not use a client secret in browser code.

### Step 9: Add Spotify API helpers

In `src/spotifyApi.js`, create helper functions for:

- current user
- playlists
- playlist items
- create playlist
- add playlist items

### Step 10: Add tests

In `tests/sorter.test.mjs`, test the sorting logic.

This proves the core logic works without needing the browser.

### Step 11: Add GitHub Actions

In `.github/workflows/ci.yml`, tell GitHub to run:

```text
npm run check
npm test
```

### Step 12: Deploy on GitHub Pages

In GitHub:

1. Go to the repo settings.
2. Open Pages.
3. Choose source: Deploy from a branch.
4. Choose branch: main.
5. Choose folder: / (root).
6. Save.

Because this repo has `.nojekyll`, GitHub Pages serves the static app directly.

## 16. How To Run It Locally

If you have Python installed:

```bash
python3 -m http.server 5173
```

Then open:

```text
http://127.0.0.1:5173/
```

If you have Node installed, run checks:

```bash
npm run check
npm test
```

## 17. How To Demo It To A Recruiter

Use this script:

1. Open the live demo.
2. Say: This is a public-safe rebuild of a private academic playlist sorting idea.
3. Point out mock demo mode.
4. Change Sort by from Smart flow score to Popularity.
5. Switch direction from High to low to Low to high.
6. Type an artist or word into the filter box.
7. Click Preview sorted playlist.
8. Explain that the real Spotify path is designed to create a new playlist instead of overwriting the original.
9. Open the GitHub repo.
10. Show `src/sorter.js`, `tests/sorter.test.mjs`, and `.github/workflows/ci.yml`.

The recruiter should understand:

- the app works
- the logic is tested
- the code is organized
- the project is public-safe
- the developer understands product risk

## 18. Where This Could Be Used

This project could be used for:

- personal playlist organization
- workout playlist ordering
- party playlist planning
- DJ set preparation
- study playlist cleanup
- road trip playlists
- podcast or episode ordering
- music library exploration
- product demos for API integration
- portfolio proof for software engineering roles

## 19. Future Improvements

Good next versions would include:

- full Spotify playlist picker after login
- save custom sort recipes
- compare original order versus sorted order
- drag-and-drop manual adjustments
- export a sort report
- mobile-first playlist cards
- better accessibility testing
- loading and error states for every Spotify API call
- screenshots in the README
- a short Loom demo linked from LinkedIn

## 20. What To Say In Interviews

Use this explanation:

I built a public-safe Spotify playlist sorting app as a clean-room rebuild of an academic project idea. The public version uses mock data for instant review, tested sorting functions for correctness, OAuth PKCE architecture for real Spotify login, and a non-destructive workflow that creates a new sorted playlist instead of overwriting the original. I deployed it with GitHub Pages and added CI so the project is usable, testable, and recruiter-friendly.

## 21. Quick Demo Checklist

Open:

```text
https://aryannigam369.github.io/spotify-playlist-sorter/
```

Then try:

- Sort by Popularity
- Sort by Release date
- Switch High to low / Low to high
- Filter by "Agent"
- Click Preview sorted playlist

Expected result:

The table updates immediately and the preview panel shows the first few tracks in the new order.
