# Dora Maps

Campus map for SNIoE — find any hostel, block, mess, court or facility and get one-tap Google Maps directions.

## Features

- Interactive campus map with 33+ places across 6 categories: Hostels, Academic Blocks, Essentials, Food, Healthcare and Dining Hall
- Search and category filters with a live-updating list
- Marker clustering with category-colored pins and icons
- Place popups with descriptions and a "Get directions" link to Google Maps
- Light/dark theme toggle (persisted to localStorage), using CARTO basemap tiles
- Mobile bottom-sheet UI with drag gestures and keyboard avoidance
- SSR-safe: Leaflet is dynamically imported client-side only

## Tech stack

- [SvelteKit](https://svelte.dev/docs/kit) + Svelte 5 (runes) + TypeScript
- [Leaflet](https://leafletjs.com/) + [leaflet.markercluster](https://github.com/Leaflet/Leaflet.markercluster)
- CARTO basemap tiles (OpenStreetMap data)
- Vite 7

## Dev

```bash
npm install
npm run dev
```

## Build & check

```bash
npm run build     # production build
npm run preview   # preview the production build
npm run check     # svelte-check typechecking
```

## Project structure

```
src/
  routes/+page.svelte          # entry — renders <DoraMaps />
  lib/components/DoraMaps.svelte  # the entire app: map, panel, places data, styles
  app.css                      # global styles
```

## Adding or editing places

All places live in the `PLACES` array at the top of `DoraMaps.svelte`:

```ts
{ name: "A Block", type: "Academic Blocks", lat: 28.5270, lng: 77.5769, desc: "..." }
```

- `type` must be one of the keys in `COLORS` (add a new key there plus an entry in `ICONS` to introduce a new category — filters are generated automatically).
- `lat`/`lng` is the **real** coordinate, used for the Google Maps directions link.
- `pin` (optional `[lat, lng]`) overrides where the marker is drawn — used to spread blocks that share one real coordinate across their own buildings, while directions still go to `lat`/`lng`.
