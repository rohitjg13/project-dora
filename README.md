# Snoopy

Campus map for SNIoE — find any hostel, block, mess, court or facility and get one-tap Google Maps directions.

## Features

- Interactive campus map with 33+ places across 6 categories: Hostels, Academic Blocks, Essentials, Food, Healthcare and Dining Hall
- Search and category filters with a live-updating list
- Marker clustering with category-colored pins and icons
- Place popups with descriptions and a "Get directions" link to Google Maps
- Campus perimeter drawn from OpenStreetMap, with everything outside it dimmed so the grounds read as a shape
- District and hostel-cluster labels that fade in as you zoom
- Map / satellite toggle and light / dark theme toggle, both persisted to localStorage
- Mobile bottom-sheet UI with drag gestures and keyboard avoidance
- SSR-safe: Leaflet is dynamically imported client-side only

## Tech stack

- [SvelteKit](https://svelte.dev/docs/kit) + Svelte 5 (runes) + TypeScript
- [Leaflet](https://leafletjs.com/) + [leaflet.markercluster](https://github.com/Leaflet/Leaflet.markercluster)
- CARTO Voyager basemap tiles (OpenStreetMap data) and Esri World Imagery for satellite
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
  lib/components/Seo.svelte    # meta tags and Open Graph
  app.css                      # global styles
static/og/default.png          # Open Graph preview image
```

## Adding or editing places

All places live in the `PLACES` array at the top of `DoraMaps.svelte`:

```ts
{ name: "A Block", type: "Academic Blocks", lat: 28.5270, lng: 77.5769, desc: "..." }
```

- `type` must be one of the keys in `COLORS` (add a new key there plus an entry in `ICONS` to introduce a new category — filters are generated automatically).
- `lat`/`lng` is the **real** coordinate, used for the Google Maps directions link.
- `pin` (optional `[lat, lng]`) overrides where the marker is drawn — used to spread blocks that share one real coordinate across their own buildings, while directions still go to `lat`/`lng`.

## Map labels

`ZONES` holds the faded words drawn over the map — the districts and the six hostel clusters:

```ts
{ text: "Cluster 1", type: "Hostels", at: [28.524431, 77.573049], minZoom: 18, sub: true }
```

- `at` is set by hand rather than averaged from the pins, because a category average drifts into the fields. For the clusters it is the mean of their pins; recompute it if those pins move.
- `type` only decides visibility — a word hides when its category is filtered out or searched past.
- `minZoom` keeps the two tiers apart. Districts show from 17, clusters from 18: at 17 the cluster words land roughly their own width away from `HOSTELS` and collide with it. Below 17 the words keep their pixel size while the campus shrinks, so nothing shows at all.
- `sub: true` styles it as a cluster name — a size down and fainter than a district.

Cluster 6's blocks still share one coordinate, so its word is offset ~9m south to clear the marker parked on that point. Clusters whose blocks have their own `pin` need no offset.

## Basemaps and the campus outline

- `BASEMAPS` holds the two tile sources and their options. They are swapped as whole layers, not by URL, because attribution and zoom ceilings differ — Esri's imagery stops at z19, where `maxNativeZoom` upscales instead of serving blank tiles.
- `CAMPUS_BOUNDARY` is OSM way [369248213](https://www.openstreetmap.org/way/369248213), baked in rather than fetched at runtime. Re-pull it from Overpass if the campus grows.
- The boundary is drawn twice: once as the dashed outline, once as a world-sized rectangle with the campus punched out of it, which is what dims the surroundings. Its `fill-opacity` is tuned per theme in the `.campus-mask` rules.
- Vector tiles get a `saturate`/`contrast`/`brightness` filter so greenery reads green and built-up areas grey; dark mode dims the same tiles rather than loading a monochrome set, which is how the campus keeps its colour at night. Satellite drops the filter entirely.
