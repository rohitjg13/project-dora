<script lang="ts">
	import { onMount } from "svelte";
	import "leaflet/dist/leaflet.css";
	import "leaflet.markercluster/dist/MarkerCluster.css";

	// lat/lng = the REAL coordinate — used for the Google Maps directions link, never changed.
	// pin (optional) = where the marker is DRAWN on the map. Use it to separate blocks that
	// share one real coordinate onto their own buildings; directions still go to lat/lng.
	type Place = { name: string; type: string; lat: number; lng: number; desc: string; pin?: [number, number] };

	// Category → pin colour (muted, editorial palette)
	const COLORS: Record<string, string> = {
		Hostels: "#2f5fd8",
		"Academic Blocks": "#d21f4b",
		Essentials: "#0ea5c4",
		Food: "#f2960b",
		Healthcare: "#e8311c",
		"Dining Hall": "#9d2fd1",
	};

	// Category → SVG icon (inner markup, drawn as a white stroke on the pin)
	const ICONS: Record<string, string> = {
		Hostels: `<path d="M3 10.8 12 4l9 6.8"/><path d="M5.5 9.5V20h13V9.5"/><path d="M10 20v-5h4v5"/>`,
		"Academic Blocks": `<path d="M12 4 2 9l10 5 10-5-10-5Z"/><path d="M6 11.5V17c0 1.2 2.7 2.5 6 2.5s6-1.3 6-2.5v-5.5"/>`,
		Essentials: `<path d="M6.5 8h11l-1 11.5h-9L6.5 8Z"/><path d="M9 8a3 3 0 0 1 6 0"/>`,
		Food: `<path d="M4 8h12v4a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5V8Z"/><path d="M16 9h2.5a2 2 0 0 1 0 4H16"/><path d="M6 3v2M10 3v2"/>`,
		Healthcare: `<path d="M10 4h4v6h6v4h-6v6h-4v-6H4v-4h6V4Z"/>`,
		"Dining Hall": `<path d="M3.5 15a8.5 8.5 0 0 1 17 0"/><path d="M2 15h20"/><path d="M12 6.5V4"/>`,
	};
	const CAMPUS: [number, number] = [28.525, 77.5735];
	// Voyager over light_nolabels: it actually paints greenery green and built-up areas grey.
	// One layer for both themes — dark mode dims it with a filter and buries the surroundings
	// under the mask, so the campus stays in colour instead of going black with everything else.
	// Esri's imagery is the one free satellite source that needs no key; it stops at z19, so
	// maxNativeZoom lets Leaflet upscale rather than serve blanks past that.
	const BASEMAPS = {
		map: {
			url: "https://{s}.basemaps.cartocdn.com/rastertiles/voyager_nolabels/{z}/{x}/{y}{r}.png",
			options: { maxZoom: 20, subdomains: "abcd", attribution: "&copy; OpenStreetMap &copy; CARTO" },
		},
		sat: {
			url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
			options: { maxZoom: 20, maxNativeZoom: 19, attribution: "Imagery &copy; Esri, Maxar, Earthstar Geographics" },
		},
	};

	// Campus perimeter — OSM way 369248213 ("Shiv Nadar University" / Institute of Eminence).
	// ponytail: baked in rather than fetched from Overpass at runtime; re-pull if the campus expands.
	const CAMPUS_BOUNDARY: [number, number][] = [
		[28.53358, 77.576059], [28.533299, 77.575877], [28.533803, 77.575111], [28.533306, 77.574635], [28.533648, 77.574155], [28.533494, 77.574024], [28.533116, 77.574496], [28.532715, 77.573997], [28.532622, 77.574088], [28.531964, 77.573353], [28.531374, 77.573805], [28.530905, 77.573363], [28.530878, 77.573388], [28.530649, 77.57312], [28.530814, 77.572832], [28.530122, 77.57221], [28.53023, 77.572029], [28.529514, 77.571504], [28.529218, 77.571603], [28.529086, 77.571636], [28.528903, 77.571677], [28.52878, 77.571682], [28.52869, 77.571652], [28.528582, 77.571594], [28.528175, 77.571272], [28.528051, 77.571191], [28.527914, 77.571136], [28.527723, 77.571075], [28.5275, 77.570992], [28.527315, 77.570907], [28.527104, 77.570785], [28.526838, 77.570657], [28.526589, 77.570518], [28.526344, 77.570412], [28.526083, 77.570321], [28.525838, 77.570177], [28.525111, 77.569779], [28.524954, 77.569688], [28.524855, 77.569875], [28.524303, 77.569433], [28.523709, 77.569083], [28.523301, 77.5689], [28.522942, 77.568759], [28.522779, 77.568627], [28.522417, 77.568258], [28.522072, 77.567953], [28.521817, 77.568771], [28.521757, 77.568752], [28.521659, 77.568667], [28.52138, 77.568394], [28.521021, 77.568765], [28.520884, 77.568897], [28.520753, 77.569007], [28.520523, 77.569217], [28.520347, 77.569398], [28.52019, 77.569642], [28.520667, 77.570065], [28.520277, 77.570494], [28.519768, 77.571082], [28.519635, 77.571266], [28.519553, 77.571391], [28.519522, 77.571423], [28.519437, 77.571508], [28.519284, 77.5717], [28.519207, 77.571808], [28.519174, 77.572414], [28.51913, 77.572942], [28.519097, 77.57305], [28.519056, 77.573143], [28.51892, 77.573545], [28.518833, 77.573773], [28.518738, 77.573892], [28.518526, 77.574155], [28.51837, 77.574375], [28.518201, 77.574663], [28.518028, 77.574942], [28.517809, 77.575264], [28.518753, 77.575764], [28.519, 77.575894], [28.519798, 77.57632], [28.521402, 77.577125], [28.521844, 77.577323], [28.52242, 77.577529], [28.523789, 77.578035], [28.524208, 77.578203], [28.524346, 77.578053], [28.524394, 77.578015], [28.524578, 77.578144], [28.525029, 77.578486], [28.525302, 77.578755], [28.525432, 77.578932], [28.525587, 77.578755], [28.526206, 77.578986], [28.526656, 77.579178], [28.527047, 77.579465], [28.526885, 77.57998], [28.526363, 77.58114], [28.526564, 77.581312], [28.526915, 77.580974], [28.527213, 77.580585], [28.527727, 77.581045], [28.527949, 77.580761], [28.528284, 77.581024], [28.528479, 77.580764], [28.528637, 77.580523], [28.528916, 77.580125], [28.529581, 77.580748], [28.529368, 77.581008], [28.529975, 77.581553], [28.530924, 77.580127], [28.530688, 77.579903], [28.530842, 77.579718], [28.530234, 77.579055], [28.530618, 77.578599], [28.530173, 77.578044], [28.53028, 77.577933], [28.529747, 77.577226], [28.529236, 77.576654], [28.528802, 77.576141], [28.529013, 77.575838], [28.528975, 77.575809], [28.529253, 77.575468], [28.529861, 77.576026], [28.530042, 77.576189], [28.530363, 77.576669], [28.530822, 77.577298], [28.531, 77.577163], [28.531459, 77.577788], [28.531772, 77.577455], [28.531473, 77.577084], [28.531878, 77.576538], [28.532183, 77.576135], [28.532554, 77.576613], [28.533015, 77.576059], [28.533365, 77.576388],
	];

	const PLACES: Place[] = [
		// ---- Hostels ----
		{ name: "Sunderbans 1A", type: "Hostels", lat: 28.524549807654314, lng: 77.57374625428459, desc: "Residence block — Cluster 1.", pin: [28.524729348381705, 77.57302623458426] },
		{ name: "Chilika 1B", type: "Hostels", lat: 28.524549807654314, lng: 77.57374625428459, desc: "Residence block — Cluster 1.", pin: [28.524132122750338, 77.57307212395963] },
		{ name: "Kaziranga 2BX", type: "Hostels", lat: 28.52335137873625, lng: 77.5738156275415, desc: "Residence block — Cluster 2.", pin: [28.522929353748555, 77.57364986618614] },
		{ name: "Kaziranga 2B", type: "Hostels", lat: 28.52335137873625, lng: 77.5738156275415, desc: "Residence block — Cluster 2.", pin: [28.522797454001406, 77.57348584580019] },
		{ name: "Hemis 2A", type: "Hostels", lat: 28.52335137873625, lng: 77.5738156275415, desc: "Residence block — Cluster 2.", pin: [28.52329329849124, 77.57314390499559] },
		{ name: "Periyar 2C", type: "Hostels", lat: 28.52335137873625, lng: 77.5738156275415, desc: "Residence block — Cluster 2.", pin: [28.522782798463762, 77.57271856399475] },
		{ name: "Gir 3A", type: "Hostels", lat: 28.524909011469056, lng: 77.57124548826852, desc: "Residence block — Cluster 3.", pin: [28.525263572670706, 77.57102717856306] },
		{ name: "Dibang 3B", type: "Hostels", lat: 28.524909011469056, lng: 77.57124548826852, desc: "Residence block — Cluster 3.", pin: [28.52472682845833, 77.57080059977213] },
		{ name: "Kanha 3C", type: "Hostels", lat: 28.524909011469056, lng: 77.57124548826852, desc: "Residence block — Cluster 3.", pin: [28.524812506121567, 77.57142584251164] },
		{ name: "Manas 4A", type: "Hostels", lat: 28.523813554362306, lng: 77.56957343378393, desc: "Residence block — Cluster 4.", pin: [28.523849969219675, 77.57045146895423] },
		{ name: "Marine 4B", type: "Hostels", lat: 28.523813554362306, lng: 77.56957343378393, desc: "Residence block — Cluster 4.", pin: [28.523305099980835, 77.57017534750625] },
		{ name: "Mudumalai 4C", type: "Hostels", lat: 28.523813554362306, lng: 77.56957343378393, desc: "Residence block — Cluster 4.", pin: [28.523416460346212, 77.57088602074118] },
		{ name: "Betla", type: "Hostels", lat: 28.52314712848714, lng: 77.56926724298219, desc: "Residence block — Cluster 5.", pin: [28.522821828507006, 77.57010772512353] },
		{ name: "Bandhavgarh", type: "Hostels", lat: 28.52314712848714, lng: 77.56926724298219, desc: "Residence block — Cluster 5.", pin: [28.52240024698285, 77.57059206930278] },
		{ name: "Bandipur", type: "Hostels", lat: 28.52314712848714, lng: 77.56926724298219, desc: "Residence block — Cluster 5.", pin: [28.522316725914767, 77.56986328974337] },
		{ name: "Sariksa", type: "Hostels", lat: 28.522301236907072, lng: 77.57208801138445, desc: "Residence block — Cluster 6." },
		{ name: "Satpura", type: "Hostels", lat: 28.522301236907072, lng: 77.57208801138445, desc: "Residence block — Cluster 6." },

		// ---- Academic Blocks ----
		{ name: "A Block", type: "Academic Blocks", lat: 28.52708891065959, lng: 77.57693041797647, desc: "Lecture halls, labs and faculty offices." },
		{ name: "B Block", type: "Academic Blocks", lat: 28.52675007233592, lng: 77.57607144744297, desc: "Lecture halls, labs and faculty offices." },
		{ name: "C Block", type: "Academic Blocks", lat: 28.526292036291554, lng: 77.57549031781652, desc: "Lecture halls, labs and faculty offices." },
		{ name: "D Block", type: "Academic Blocks", lat: 28.525540623117408, lng: 77.57510651447218, desc: "Lecture halls, labs and faculty offices." },
		{ name: "G Block", type: "Academic Blocks", lat: 28.52759808242438, lng: 77.57490189974872, desc: "Management block and auditorium." },

		// ---- Essentials ----
		{ name: "Shopping Arcade", type: "Essentials", lat: 28.527623306472037, lng: 77.57252178901619, desc: "Campus shopping complex with a stationery store, Grabbo supermarket and pharmacy." },
		{ name: "24/7 Minimart", type: "Essentials", lat: 28.524801058058845, lng: 77.57167585663186, desc: "24/7 convenience store for groceries, snacks, beverages and daily necessities." },
		{ name: "Fruits Shop", type: "Essentials", lat: 28.52875678841009, lng: 77.57750232344694, desc: "Fresh fruits, fruit juice and snacks outlet." },

		// ---- Food ----
		{ name: "CnD", type: "Food", lat: 28.525532569695205, lng: 77.57606053056581, desc: "Food area by the academic blocks — Naveen's Tea Stall, A1 Rama, Surya Food & Beverages and Kathi Roll." },
		{ name: "AnB", type: "Food", lat: 28.52684760999203, lng: 77.57661486088946, desc: "Food area by the academic blocks — Anna's Cafe and Quench Cafe." },
		{ name: "SARC", type: "Food", lat: 28.523940597071064, lng: 77.57442274811383, desc: "Student Activity and Recreation Center food court." },

		// ---- Healthcare ----
		{ name: "Pharmacy", type: "Healthcare", lat: 28.527623306472037, lng: 77.57252178901619, desc: "On-campus medical store." },
		{ name: "Health and Wellness Center", type: "Healthcare", lat: 28.527176815176635, lng: 77.57241908711707, desc: "On-campus medical facility with doctors, consultation and basic emergency care." },

		// ---- Dining Hall ----
		{ name: "DH 1", type: "Dining Hall", lat: 28.523743009456627, lng: 77.57351714174683, desc: "Dining hall — breakfast, lunch, dinner (à la carte) and evening snacks." },
		{ name: "DH 2", type: "Dining Hall", lat: 28.52443195826298, lng: 77.57045969354294, desc: "Dining hall — breakfast, lunch and dinner." },
		{ name: "DH 3", type: "Dining Hall", lat: 28.52325058063192, lng: 77.56961081535562, desc: "Dining hall — breakfast, lunch and dinner." },
	];

	const types = ["All", ...Object.keys(COLORS).filter((t) => PLACES.some((p) => p.type === t))];

	// Words laid over the map. `type` is only used to hide a word when its category is filtered
	// out; `minZoom` keeps the two tiers apart — the cluster names sit ~120px from HOSTELS at
	// z17 and would collide with it, so they wait until z18, where that gap doubles.
	// Positions are the mean of the pins named in the comment; the districts are hand-placed
	// because an average drifts off into the fields west of the blocks.
	const ZONES: { text: string; type: string; at: [number, number]; minZoom: number; tier?: "sub" }[] = [
		{ text: "Hostels", type: "Hostels", at: [28.524024, 77.571873], minZoom: 17 }, // Gir 3A ↔ Periyar 2C
		{ text: "Academic Blocks", type: "Academic Blocks", at: [28.525966, 77.576309], minZoom: 17 }, // over A-D
		// Sunderbans 1A + Chilika 1B
		{ text: "Cluster 1", type: "Hostels", at: [28.524431, 77.573049], minZoom: 18, tier: "sub" },
		// Kaziranga 2BX + 2B, Hemis 2A, Periyar 2C
		{ text: "Cluster 2", type: "Hostels", at: [28.522951, 77.57325], minZoom: 18, tier: "sub" },
		// Gir 3A, Dibang 3B, Kanha 3C
		{ text: "Cluster 3", type: "Hostels", at: [28.524934, 77.571085], minZoom: 18, tier: "sub" },
		// Manas 4A, Marine 4B, Mudumalai 4C
		{ text: "Cluster 4", type: "Hostels", at: [28.523524, 77.570504], minZoom: 18, tier: "sub" },
		// Betla, Bandhavgarh, Bandipur
		{ text: "Cluster 5", type: "Hostels", at: [28.522513, 77.570188], minZoom: 18, tier: "sub" },
		// Cluster 6 is the last one whose blocks all sit on a single shared coordinate, so its
		// word is dropped 9m south of it to clear the marker parked on that point.
		{ text: "Cluster 6", type: "Hostels", at: [28.52222, 77.572088], minZoom: 18, tier: "sub" },
	];

	let active = $state("All");
	let term = $state("");
	let theme = $state<"light" | "dark">("light");
	let basemap = $state<"map" | "sat">("map");

	// Mobile bottom sheet: `sheet` is the body's live height in px (0 = peek).
	let mobile = $state(false);
	let sheet = $state(0);
	let dragging = $state(false);
	let kb = $state(0);
	let vvh = $state(0);
	const openHeight = () => Math.min(window.innerHeight * 0.5, window.innerHeight - 110);
	const openSheet = () => { if (mobile) { sheet = openHeight(); frameCampus(); } };
	const closeSheet = () => { sheet = 0; };

	const shown = $derived(
		PLACES.filter(
			(p) =>
				(active === "All" || p.type === active) &&
				(p.name.toLowerCase().includes(term.trim().toLowerCase()) ||
					p.type.toLowerCase().includes(term.trim().toLowerCase())),
		),
	);

	const col = (p: Place) => COLORS[p.type] || "#141414";
	const dirUrl = (p: Place) => `https://www.google.com/maps/dir/?api=1&destination=${p.lat},${p.lng}`;
	const esc = (s: string) =>
		(s || "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c] as string);

	let L: any;
	let map: any;
	let tiles: any;
	let cluster: any;
	let allBounds: any;
	let mapEl: HTMLElement;
	let ro: ResizeObserver | undefined;
	let panelEl: HTMLElement;
	const PANEL_W = 360;
	const markers = new Map<Place, any>();
	const zones = new Map<string, any>();

	function renderMarkers() {
		if (!cluster) return;
		cluster.clearLayers();
		cluster.addLayers(shown.map((p) => markers.get(p)).filter(Boolean));
	}

	// Swapped rather than setUrl'd: the two sources need different attribution and zoom limits.
	function applyBasemap() {
		if (!map) return;
		tiles?.remove();
		const b = BASEMAPS[basemap];
		tiles = L.tileLayer(b.url, b.options).addTo(map);
	}

	// A word shows only while some of its category's pins are on screen and the map is zoomed
	// past its own threshold. Zoomed out the text keeps its pixel size while the campus shrinks,
	// so it ends up straddling the map and colliding with the cluster bubbles; shrinking it with
	// the zoom instead just made unreadable specks under those same bubbles.
	function renderZones() {
		if (!map) return;
		const z = map.getZoom();
		for (const zone of ZONES) {
			const label = zones.get(zone.text);
			if (z >= zone.minZoom && shown.some((p) => p.type === zone.type)) label.addTo(map);
			else label.remove();
		}
	}

	function animatePanelHeight() {
		if (!panelEl || mobile) return;
		const start = panelEl.offsetHeight;
		panelEl.style.height = "auto";
		const target = panelEl.offsetHeight;
		panelEl.style.height = `${start}px`;
		void panelEl.offsetHeight;
		panelEl.style.height = `${target}px`;
	}

	function frameCampus(animate = true) {
		if (!map || !allBounds || !L) return;
		const size = map.getSize();
		const cx = mobile ? size.x / 2 : Math.min((PANEL_W + size.x) / 2, size.x - 40);
		const cy = mobile ? (size.y - sheet) / 2 : size.y / 2;
		const cur = map.latLngToContainerPoint(allBounds.getCenter());
		map.panBy(cur.subtract(L.point(cx, cy)), { animate, duration: 0.4 });
	}

	function focus(p: Place) {
		closeSheet();
		const m = markers.get(p);
		if (cluster && m) cluster.zoomToShowLayer(m, () => m.openPopup());
	}

	function toggleTheme() {
		theme = theme === "dark" ? "light" : "dark";
		try { localStorage.setItem("dora-map-theme", theme); } catch {}
	}

	function toggleBasemap() {
		basemap = basemap === "sat" ? "map" : "sat";
		try { localStorage.setItem("dora-map-basemap", basemap); } catch {}
		applyBasemap();
	}

	let startY = 0;
	let startSheet = 0;
	let lastY = 0;
	let lastT = 0;
	let vel = 0;
	function grabDown(e: PointerEvent) {
		if (!mobile) return;
		dragging = true;
		startY = lastY = e.clientY;
		startSheet = sheet;
		lastT = performance.now();
		vel = 0;
		(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
	}
	function grabMove(e: PointerEvent) {
		if (!dragging) return;
		const now = performance.now();
		vel = (e.clientY - lastY) / Math.max(1, now - lastT);
		lastY = e.clientY;
		lastT = now;
		sheet = Math.max(0, Math.min(openHeight(), startSheet + (startY - e.clientY)));
	}
	function grabUp(e: PointerEvent) {
		if (!dragging) return;
		dragging = false;
		const moved = Math.abs(e.clientY - startY);
		let open: boolean;
		if (moved < 6) open = sheet === 0;
		else if (vel < -0.35) open = true;
		else if (vel > 0.35) open = false;
		else open = sheet > openHeight() * 0.4;
		sheet = open ? openHeight() : 0;
		frameCampus();
	}

	const pinSvg = (type: string) =>
		`<svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${ICONS[type] || ""}</svg>`;

	onMount(() => {
		const prev = document.body.style.overflow;
		document.body.style.overflow = "hidden";

		try {
			const saved = localStorage.getItem("dora-map-theme");
			if (saved === "dark" || saved === "light") theme = saved;
			const savedBase = localStorage.getItem("dora-map-basemap");
			if (savedBase === "sat" || savedBase === "map") basemap = savedBase;
		} catch {}

		const mq = window.matchMedia("(max-width:640px)");
		mobile = mq.matches;
		const onMq = (e: MediaQueryListEvent) => {
			mobile = e.matches;
			sheet = 0;
		};
		mq.addEventListener("change", onMq);

		const vv = window.visualViewport;
		const onVV = () => {
			vvh = vv ? vv.height : window.innerHeight;
			kb = vv ? Math.max(0, window.innerHeight - vv.height - vv.offsetTop) : 0;
		};
		onVV();
		vv?.addEventListener("resize", onVV);
		vv?.addEventListener("scroll", onVV);

		(async () => {
			const leaflet = await import("leaflet");
			L = (leaflet as any).default ?? leaflet;
			await import("leaflet.markercluster");

			map = L.map(mapEl, { zoomControl: false, attributionControl: true }).setView(CAMPUS, 16);
			L.control.zoom({ position: "bottomright" }).addTo(map);
			map.on("zoomend", renderZones);

			// Leaflet measures the container once at init; if fonts/layout settle
			// afterwards it keeps a stale size and only renders tiles in a corner.
			map.invalidateSize();
			ro = new ResizeObserver(() => map?.invalidateSize());
			ro.observe(mapEl);
			requestAnimationFrame(() => map?.invalidateSize());
			setTimeout(() => map?.invalidateSize(), 300);
			applyBasemap();

			// Campus as a hole in a world-sized rectangle: dims everything off-campus so the
			// perimeter reads as a shape instead of a dashed line floating over blank farmland.
			L.polygon([[[-89, -179], [-89, 179], [89, 179], [89, -179]], CAMPUS_BOUNDARY], {
				className: "campus-mask", stroke: false, fillOpacity: 0.62, interactive: false,
			}).addTo(map);
			L.polygon(CAMPUS_BOUNDARY, {
				className: "campus-edge", weight: 2.5, dashArray: "7 5", fill: false, interactive: false,
			}).addTo(map);

			cluster = L.markerClusterGroup({
				showCoverageOnHover: false, maxClusterRadius: 45, spiderfyDistanceMultiplier: 1.6,
				iconCreateFunction: (c: any) => {
					const n = c.getChildCount();
					return L.divIcon({
						html:
							`<div class="cluster"><svg class="cl-ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3 4 7l8 4 8-4-8-4Z"/><path d="M4 11l8 4 8-4"/><path d="M4 15l8 4 8-4"/></svg>` +
							`<span>${n}</span>` +
							`<svg class="cl-chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg></div>`,
						className: "",
						iconSize: [0, 0],
					});
				},
			}).addTo(map);

			for (const p of PLACES) {
				const icon = L.divIcon({
					className: "", html: `<div class="pin" style="background:${col(p)}">${pinSvg(p.type)}</div>`,
					iconSize: [28, 28], iconAnchor: [14, 14], popupAnchor: [0, -15],
				});
				const m = L.marker(p.pin ?? [p.lat, p.lng], { icon }).bindPopup(
					`<div class="pop"><div class="pop-type" style="color:${col(p)}">${esc(p.type)}</div>` +
						`<h4>${esc(p.name)}</h4><p>${esc(p.desc)}</p>` +
						`<a class="dirbtn" href="${dirUrl(p)}" target="_blank" rel="noopener">Get directions` +
						`<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><path d="M7 17 17 7M9 7h8v8"/></svg></a></div>`,
				);
				markers.set(p, m);
			}

			// District and cluster labels: one faded word per zone — see ZONES for the positions.
			for (const zone of ZONES) {
				zones.set(
					zone.text,
					L.marker(zone.at, {
						interactive: false,
						zIndexOffset: -1000,
						icon: L.divIcon({
							className: "",
							html: `<div class="zone${zone.tier ? ` ${zone.tier}` : ""}">${esc(zone.text)}</div>`,
							iconSize: [0, 0],
						}),
					}),
				);
			}
			renderZones();

			allBounds = L.featureGroup([...markers.values()]).getBounds();
			map.fitBounds(
				allBounds,
				mobile
					? { paddingTopLeft: [24, 24], paddingBottomRight: [24, 24] }
					: { paddingTopLeft: [PANEL_W, 24], paddingBottomRight: [24, 24] },
			);
			renderMarkers();
		})();

		return () => {
			document.body.style.overflow = prev;
			mq.removeEventListener("change", onMq);
			vv?.removeEventListener("resize", onVV);
			vv?.removeEventListener("scroll", onVV);
			ro?.disconnect();
			map?.remove();
		};
	});

	$effect(() => {
		shown;
		renderMarkers();
		renderZones();
	});

	$effect(() => {
		shown;
		mobile;
		if (!panelEl) return;
		if (mobile) panelEl.style.height = "";
		else panelEl.style.height = "";
	});
</script>

<div class="dora" class:dark={theme === "dark"} class:sat={basemap === "sat"}>
	<div id="dora-map" class="map" bind:this={mapEl}></div>

	<div class="plaque">
		<b>Shiv Nadar</b>
		<span>Institute of Eminence</span>
	</div>

	<button class="toggle base" onclick={toggleBasemap} aria-label={basemap === "sat" ? "Switch to map view" : "Switch to satellite view"}>
		{#if basemap === "sat"}
			<svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6.5 9 4l6 2.5L21 4v13.5L15 20l-6-2.5L3 20V6.5Z" /><path d="M9 4v13.5M15 6.5V20" /></svg>
		{:else}
			<svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" /></svg>
		{/if}
	</button>

	<button class="toggle" onclick={toggleTheme} aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}>
		{#if theme === "dark"}
			<svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></svg>
		{:else}
			<svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z" /></svg>
		{/if}
	</button>

	<aside
		class="panel"
		bind:this={panelEl}
		style:bottom={mobile && kb > 0 ? `${kb}px` : null}
		style:max-height={mobile && kb > 0 ? `${vvh - 12}px` : null}
	>
		<div class="drag-head" role="presentation" onpointerdown={grabDown} onpointermove={grabMove} onpointerup={grabUp}>
			<div class="grab"><span></span></div>
			<h1>Sno<em>opy</em></h1>
		</div>
		<div class="phead">
			<label class="search">
				<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke-width="2"><circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" /></svg>
				<input type="text" placeholder="Search" autocomplete="off" bind:value={term} onfocus={openSheet} />
			</label>
			<div class="chips">
				{#each types as t}
					<button class="chip" class:active={active === t} onclick={() => { active = t; openSheet(); }}>{t}</button>
				{/each}
			</div>
		</div>
		<div
			class="body"
			style={mobile
				? `max-height:${sheet}px;transition:${dragging ? "none" : "max-height .42s cubic-bezier(.32,.72,0,1)"}`
				: ""}
		>
			<div class="list">
				{#each shown as p (p.name)}
					<div class="item" role="button" tabindex="0" onclick={() => focus(p)} onkeydown={(e) => (e.key === "Enter" || e.key === " ") && focus(p)}>
						<div class="ic" style="background:{col(p)}">
							<svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">{@html ICONS[p.type] || ""}</svg>
						</div>
						<div class="m"><h3>{p.name}</h3><div class="t">{p.type}</div></div>
						<svg class="arw" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m9 18 6-6-6-6" /></svg>
					</div>
				{:else}
					<div class="empty">Nothing matches "{term}".</div>
				{/each}
			</div>
			<div class="foot">{shown.length} place{shown.length === 1 ? "" : "s"}</div>
		</div>
	</aside>
</div>

<style>
	.dora {
		--paper: #efe7d6;
		--card: #f7f2e7;
		--ink: #191712;
		--muted: #6b6353;
		--accent: #ff4d1c;
		--shadow: #191712;
		--line: #ddd3bf;
		--mapbg: #e7ded0;
		position: fixed;
		inset: 0;
		z-index: 100;
		font-family: Arial, Helvetica, sans-serif;
		color: var(--ink);
	}
	.dora.dark {
		--paper: #211d17;
		--card: #2b261d;
		--ink: #ece3d2;
		--muted: #9c9079;
		--accent: #ff7a45;
		--shadow: #0b0906;
		--line: #3b362c;
		--mapbg: #16130d;
	}
	.map {
		position: absolute;
		inset: 0;
		z-index: 0;
		background: var(--mapbg);
	}
	/* Carto's base tiles are washed out — push saturation so greenery reads green and
	   built-up areas read grey instead of near-white. Tune here, nothing else depends on it. */
	/* saturate() leaves neutrals alone: greenery gets richer, greys just get darker via brightness. */
	:global(.leaflet-tile-pane) { filter: saturate(2) contrast(1.08) brightness(0.93); }
	.dark :global(.leaflet-tile-pane) { filter: saturate(2.6) contrast(1.02) brightness(0.8); }
	:global(.campus-edge) { stroke: var(--accent); }
	:global(.campus-mask) { fill: var(--paper); }
	/* Dark mode: drown everything off-campus so only Shiv Nadar keeps its colour. */
	.dark :global(.campus-mask) { fill-opacity: 0.48; }

	/* Satellite: the tiles are already photographic, so no colour push, and the veil goes dark
	   in both themes — a paper-coloured one over aerial imagery just looks like fog. */
	.sat :global(.leaflet-tile-pane) { filter: none; }
	.sat :global(.campus-mask) { fill: #0b0906; fill-opacity: 0.5; }
	.sat :global(.zone) { color: #fff; opacity: 0.9; text-shadow: 0 0 5px #000, 0 0 9px #000; }

	.toggle {
		position: absolute;
		z-index: 20;
		top: 20px;
		right: 20px;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 40px;
		height: 40px;
		padding: 0;
		background: var(--card);
		color: var(--ink);
		border: 2px solid var(--ink);
		border-radius: 4px;
		box-shadow: 4px 4px 0 var(--shadow);
		cursor: pointer;
		transition: transform 0.15s, box-shadow 0.15s;
	}
	.toggle:hover { transform: translate(-1px, -1px); box-shadow: 5px 5px 0 var(--shadow); }
	.toggle:active { transform: translate(2px, 2px); box-shadow: 2px 2px 0 var(--shadow); }
	.toggle.base { top: 70px; }

	/* Sits clear of the panel on desktop; pointer-events off so it never eats a map drag. */
	.plaque {
		position: absolute;
		z-index: 20;
		top: 20px;
		left: 370px;
		pointer-events: none;
		display: grid;
		gap: 3px;
		padding: 9px 14px 10px;
		background: var(--card);
		color: var(--ink);
		border: 2px solid var(--ink);
		border-radius: 4px;
		box-shadow: 4px 4px 0 var(--shadow);
	}
	.plaque b { font-weight: 800; font-size: 15px; line-height: 1; letter-spacing: 0.01em; text-transform: uppercase; }
	.plaque span {
		font-size: 9px; font-weight: 700; line-height: 1;
		letter-spacing: 0.17em; text-transform: uppercase; color: var(--muted);
	}
	.sat .toggle.base { background: var(--ink); color: var(--card); }

	.panel {
		position: absolute;
		z-index: 10;
		top: 20px;
		left: 20px;
		bottom: 20px;
		width: 330px;
		max-width: calc(100vw - 40px);
		display: flex;
		flex-direction: column;
		background: var(--card);
		border: 2px solid var(--ink);
		border-radius: 6px;
		box-shadow: 8px 8px 0 var(--shadow);
		overflow: hidden;
		transition: height 0.34s cubic-bezier(0.32, 0.72, 0, 1);
	}
	.grab { display: none; }
	.drag-head { padding: 20px 20px 0; }
	.phead { padding: 0 20px 16px; border-bottom: 1px solid var(--line); }
	.drag-head h1 { font-family: inherit; font-weight: 800; font-size: 30px; line-height: 0.95; letter-spacing: -0.01em; text-transform: uppercase; margin: 0; }
	.drag-head h1 em { font-style: normal; color: var(--accent); }
	.search { display: flex; align-items: center; gap: 10px; margin-top: 16px; padding: 10px 13px; border: 1.5px solid var(--ink); border-radius: 4px; background: var(--paper); }
	.search:focus-within { border-color: var(--accent); }
	.search svg { flex: none; stroke: var(--muted); }
	.search input { flex: 1; background: none; border: none; outline: none; color: var(--ink); font-family: inherit; font-size: 14.5px; }
	.search input::placeholder { color: var(--muted); }
	.chips { display: flex; gap: 7px; flex-wrap: wrap; margin-top: 12px; }
	.chip { font-family: inherit; font-size: 11.5px; font-weight: 700; letter-spacing: 0.03em; text-transform: uppercase; color: var(--ink); cursor: pointer; padding: 5px 11px; border-radius: 3px; border: 1.5px solid var(--ink); background: transparent; transition: 0.12s; }
	.chip:hover { background: var(--paper); }
	.chip.active { color: var(--card); background: var(--ink); border-color: var(--ink); }

	.body { display: flex; flex-direction: column; flex: 1; min-height: 0; }
	.list { flex: 1; min-height: 0; overflow-y: auto; padding: 7px; }
	.list::-webkit-scrollbar { width: 9px; }
	.list::-webkit-scrollbar-thumb { background: var(--ink); border: 3px solid var(--card); }
	.item { display: flex; align-items: center; gap: 12px; padding: 9px 10px; border-radius: 4px; cursor: pointer; border: 1.5px solid transparent; transition: 0.12s; }
	.item:hover { border-color: var(--ink); background: var(--paper); }
	.item .ic { flex: none; width: 36px; height: 36px; display: grid; place-items: center; border-radius: 50%; border: 2px solid var(--ink); }
	.item .ic svg { width: 18px; height: 18px; }
	.item .m { min-width: 0; }
	.item h3 { font-family: inherit; font-weight: 700; font-size: 15px; letter-spacing: -0.01em; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin: 0; }
	.item .t { font-size: 10.5px; letter-spacing: 0.08em; text-transform: uppercase; font-weight: 700; color: var(--muted); margin-top: 2px; }
	.item .arw { margin-left: auto; flex: none; color: var(--muted); transition: 0.15s; }
	.item:hover .arw { transform: translateX(3px); }
	.foot { padding: 10px 15px; border-top: 1px solid var(--line); font-size: 11px; letter-spacing: 0.03em; color: var(--muted); }
	.empty { text-align: center; color: var(--muted); padding: 34px 12px; font-size: 14px; }

	@media (max-width: 640px) {
		.panel {
			top: auto; bottom: 0; left: 0; right: 0; width: 100%; max-width: 100%; max-height: none;
			border: none; border-top: 1px solid var(--line); border-radius: 16px 16px 0 0;
			box-shadow: 0 -8px 30px rgba(0, 0, 0, 0.18);
		}
		.plaque { left: 20px; }
		.drag-head { padding: 2px 18px 0; touch-action: none; cursor: grab; }
		.grab { display: flex; justify-content: center; padding: 9px 0 3px; }
		.grab span { width: 38px; height: 5px; border-radius: 100px; background: var(--ink); opacity: 0.25; }
		.phead { padding: 0 18px 12px; }
		.drag-head h1 { font-size: 26px; margin-top: 2px; }
		.search { margin-top: 12px; }
		.chips { flex-wrap: nowrap; overflow-x: auto; scrollbar-width: none; padding-bottom: 2px; margin-top: 12px; }
		.chips::-webkit-scrollbar { display: none; }
		.chip { flex: none; }
		.body { max-height: 0; overflow: hidden; border-top: 1px solid var(--line); }
		:global(.leaflet-control-zoom) { display: none; }
	}

	:global {
		.leaflet-container { background: var(--mapbg); font-family: Arial, Helvetica, sans-serif; }
		.leaflet-control-zoom { border: 2px solid var(--ink) !important; border-radius: 4px; overflow: hidden; box-shadow: 3px 3px 0 var(--shadow); }
		.leaflet-control-zoom a { background: var(--card); color: var(--ink); border: none; border-bottom: 2px solid var(--ink); font-weight: 700; }
		.leaflet-control-zoom a:last-child { border-bottom: none; }
		.leaflet-control-zoom a:hover { background: var(--ink); color: var(--card); }
		.leaflet-control-attribution { background: color-mix(in srgb, var(--card) 85%, transparent); color: var(--muted); border: none; font-size: 10px; }
		.leaflet-control-attribution a { color: var(--muted); }

		.pin { width: 28px; height: 28px; border-radius: 50%; display: grid; place-items: center; border: 2px solid var(--ink); box-shadow: 2px 2px 0 var(--shadow); transition: transform 0.12s; }
		.pin svg { width: 14px; height: 14px; }
		.pin:hover { transform: translate(-1px, -1px); }
		.zone {
			position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%);
			white-space: nowrap; pointer-events: none;
			font-family: Arial, Helvetica, sans-serif; font-weight: 800; font-size: 13px;
			letter-spacing: 0.34em; text-transform: uppercase;
			/* Not themed: these always sit on the campus tiles, which stay light in dark mode too. */
			color: #191712; opacity: 0.42;
			text-shadow: 0 0 6px #efe7d6, 0 0 6px #efe7d6;
		}
		/* Cluster names sit a tier below the district names. */
		.zone.sub { font-size: 10.5px; letter-spacing: 0.26em; opacity: 0.32; }
		.cluster {
			position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%);
			display: flex; align-items: center; gap: 3px; white-space: nowrap;
			padding: 5px 8px 5px 6px; border-radius: 999px;
			background: var(--card); border: 2px solid var(--ink); box-shadow: 2px 2px 0 var(--shadow);
			font-family: Arial, Helvetica, sans-serif; font-weight: 700; font-size: 12px; color: var(--ink);
			transition: transform 0.12s, box-shadow 0.12s;
		}
		.cluster:hover { transform: translate(-50%, -50%) translate(-1px, -1px); box-shadow: 3px 3px 0 var(--shadow); }
		.cluster .cl-ic { flex: none; width: 12px; height: 12px; }
		.cluster .cl-chev { flex: none; width: 9px; height: 9px; color: var(--muted); }
		.marker-cluster-small, .marker-cluster-medium, .marker-cluster-large { background: none; }

		.leaflet-popup-content-wrapper { background: var(--card); color: var(--ink); border-radius: 4px; border: 2px solid var(--ink); box-shadow: 6px 6px 0 var(--shadow); }
		.leaflet-popup-tip { background: var(--card); border: 2px solid var(--ink); }
		.leaflet-popup-content { margin: 14px 16px; }
		.pop-type { font-size: 10.5px; letter-spacing: 0.1em; text-transform: uppercase; font-weight: 700; }
		.pop h4 { font-family: Arial, Helvetica, sans-serif; font-weight: 800; font-size: 18px; margin: 3px 0 5px; line-height: 1.12; color: var(--ink); }
		.pop p { color: var(--muted); font-size: 12.5px; line-height: 1.5; margin-bottom: 12px; }
		.dirbtn { display: inline-flex; align-items: center; gap: 6px; background: var(--paper); color: var(--ink); font-weight: 700; font-size: 12px; letter-spacing: 0.02em; text-transform: uppercase; text-decoration: none; padding: 8px 13px; border: 2px solid var(--ink); border-radius: 3px; }
		.dirbtn:hover { background: var(--accent); color: #fff; }
	}
</style>
