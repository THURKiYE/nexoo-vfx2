# NEXOO Scenepacks

A black/blue, editor-focused scenepack directory designed for GitHub Pages.

## What is different in this version?

- Premium black + electric-blue UI.
- Search, category filters, sorting, responsive cards, keyboard shortcut (`Ctrl/Cmd + K`).
- Each title links **directly** to its Visual Logoless `/scenepack/...` page.
- Includes a GitHub Actions sync that crawls the current Visual Logoless Movies, TV Shows, and Games index pages and regenerates `data/packs.json`.
- The sync repeats every 6 hours and also runs on pushes and manual dispatch.
- NEXOO does not host or mirror the media files.

## GitHub Pages setup

1. Create a GitHub repo and upload the contents of this folder.
2. Use the `main` branch (or change the workflow branch if you use another name).
3. Open **Settings → Pages** and set the source to **GitHub Actions**.
4. Open **Actions → Sync scenepacks & deploy Pages** and run it once manually if you want an immediate refresh.
5. The deployed site will automatically use the generated `data/packs.json` file.

## How the automatic index works

`scripts/sync_packs.py` reads the publicly listed cards from:

- `https://vlscenepacks.com/movies`
- `https://vlscenepacks.com/shows`
- `https://vlscenepacks.com/games`

It follows their `?page=N` pagination until a page adds no new `/scenepack/...` URLs, then writes the complete directory to `data/packs.json`.

Only directory metadata and direct page URLs are indexed. No video, ZIP, or other media files are downloaded or mirrored.

## Local preview

Opening `index.html` directly shows a tiny bootstrap set because browsers block some local `fetch()` requests. On GitHub Pages the generated JSON loads normally. For a full local preview, serve this folder with a static server such as `python -m http.server`.
