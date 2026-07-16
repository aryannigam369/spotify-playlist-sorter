import assert from "node:assert/strict";
import {
  buildPlaylistPlan,
  durationLabel,
  filterTracks,
  smartFlowScore,
  sortTracks,
  summarizePlaylist
} from "../src/sorter.js";

const tracks = [
  {
    id: "a",
    title: "Gamma",
    artist: "The APIs",
    album: "One",
    releaseDate: "2021-01-01",
    addedAt: "2026-01-01T00:00:00Z",
    durationMs: 120000,
    popularity: 50,
    energy: 0.7
  },
  {
    id: "b",
    title: "Alpha",
    artist: "Build System",
    album: "Two",
    releaseDate: "2024-01-01",
    addedAt: "2026-02-01T00:00:00Z",
    durationMs: 180000,
    popularity: 95,
    energy: 0.8
  },
  {
    id: "c",
    title: "Beta",
    artist: "Cache Layer",
    album: "Three",
    releaseDate: "2020-01-01",
    addedAt: "2026-03-01T00:00:00Z",
    durationMs: 90000,
    popularity: 20,
    energy: 0.5
  }
];

assert.equal(durationLabel(181000), "3:01");
assert.equal(filterTracks(tracks, "cache").length, 1);
assert.equal(sortTracks(tracks, "popularity", "desc")[0].title, "Alpha");
assert.equal(sortTracks(tracks, "title", "asc")[0].title, "Alpha");
assert.equal(sortTracks(tracks, "addedAt", "desc")[0].title, "Beta");
assert.equal(smartFlowScore(tracks[1]) > smartFlowScore(tracks[2]), true);

const summary = summarizePlaylist(tracks);
assert.deepEqual(summary, {
  count: 3,
  averagePopularity: 55,
  totalDuration: "7m"
});

const plan = buildPlaylistPlan(tracks, "popularity", "desc");
assert.equal(plan.preview[0].title, "Alpha");
assert.equal(plan.trackUris[0], "mock:b");

console.log("sorter tests passed");
