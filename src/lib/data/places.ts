// lat/lng = the REAL coordinate — used for the Google Maps directions link, never changed.
// pin (optional) = where the marker is DRAWN on the map. Use it to separate blocks that
// share one real coordinate onto their own buildings; directions still go to lat/lng.
export type Place = { name: string; type: string; lat: number; lng: number; desc: string; pin?: [number, number] };

export const PLACES: Place[] = [
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
	{ name: "Tower 6", type: "Hostels", lat: 28.52940433181576, lng: 77.57917039022865, desc: "Residence tower." },
	{ name: "Tower 9", type: "Hostels", lat: 28.528214700714408, lng: 77.57789070602227, desc: "Residence tower." },

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
	{ name: "Food Court", type: "Food", lat: 28.523940597071064, lng: 77.57442274811383, desc: "SARC food court.", pin: [28.5235029457023, 77.57431365881327] },
	{ name: "Grub Square", type: "Food", lat: 28.5280414, lng: 77.5741518, desc: "Campus food outlet." },

	// ---- Healthcare ----
	{ name: "Pharmacy", type: "Healthcare", lat: 28.527623306472037, lng: 77.57252178901619, desc: "On-campus medical store." },
	{ name: "Health and Wellness Center", type: "Healthcare", lat: 28.52941333181576, lng: 77.57917039022865, desc: "On-campus medical facility with doctors, consultation and basic emergency care." },

	// ---- Dining Hall ----
	{ name: "DH 1", type: "Dining Hall", lat: 28.523743009456627, lng: 77.57351714174683, desc: "Dining hall — breakfast, lunch, dinner (à la carte) and evening snacks." },
	{ name: "DH 2", type: "Dining Hall", lat: 28.52443195826298, lng: 77.57045969354294, desc: "Dining hall — breakfast, lunch and dinner." },
	{ name: "DH 3", type: "Dining Hall", lat: 28.52325058063192, lng: 77.56961081535562, desc: "Dining hall — breakfast, lunch and dinner." },

	// ---- Sports ----
	{ name: "Football Ground", type: "Sports", lat: 28.52316643388451, lng: 77.57187680123806, desc: "Campus football ground." },
	{ name: "Cricket Ground", type: "Sports", lat: 28.52607450417634, lng: 77.57299260015508, desc: "Campus cricket ground." },
	{ name: "Basketball Court", type: "Sports", lat: 28.5242481413347, lng: 77.57107397227831, desc: "Outdoor basketball court." },
	{ name: "Tennis Courts", type: "Sports", lat: 28.52404271923589, lng: 77.57154594853493, desc: "Outdoor tennis courts." },
	{ name: "Volleyball Court", type: "Sports", lat: 28.524465087703316, lng: 77.57175103646816, desc: "Outdoor volleyball court." },
	{ name: "Squash Courts", type: "Sports", lat: 28.521531763065504, lng: 77.57101883869687, desc: "Indoor squash courts.", pin: [28.52121928280334, 77.57107082497329] },
	{ name: "Golf Course", type: "Sports", lat: 28.528645003163167, lng: 77.57248045888485, desc: "Campus golf course." },
	{ name: "Amphitheatre", type: "Sports", lat: 28.524011527748257, lng: 77.57419125589189, desc: "Open-air amphitheatre for events." },
	{ name: "ISC", type: "Sports", lat: 28.521531763065504, lng: 77.57101883869687, desc: "Indoor Sports Complex." },

	// ---- Landmarks ----
	{ name: "Central Library", type: "Landmarks", lat: 28.52499331991966, lng: 77.5750053021127, desc: "Campus library.", pin: [28.525002335830255, 77.57432485701858] },
	{ name: "Main Gate", type: "Landmarks", lat: 28.53338591783809, lng: 77.57636217724819, desc: "Gate 1." },
	{ name: "India Post", type: "Landmarks", lat: 28.532668950331285, lng: 77.57617351175107, desc: "Post office." },
	{ name: "SARC/UAC", type: "Landmarks", lat: 28.523940597071064, lng: 77.57442274811383, desc: "Students Activity and Recreational Center", pin: [28.52359967722649, 77.5747850553129] },

	// ---- Green Places ----
	{ name: "SNU Biodiversity Park", type: "Green Places", lat: 28.521264875431715, lng: 77.5756026064942, desc: "Campus biodiversity park.", pin: [28.52114856955627, 77.57588802988606] },
	{ name: "Lake SNU", type: "Green Places", lat: 28.525509504060498, lng: 77.57686470924014, desc: "Campus lake.", pin: [28.525092276417517, 77.5778472079545] },
	{ name: "19th Hole", type: "Green Places", lat: 28.529893126665147, lng: 77.57461048873282, desc: "Green space by the golf course.", pin: [28.529893126665147, 77.57461048873282] },
];

// Words laid over the map. `type` is only used to hide a word when its category is filtered
// out; `minZoom` keeps the two tiers apart — the cluster names sit ~120px from HOSTELS at
// z17 and would collide with it, so they wait until z18, where that gap doubles.
// Positions are the mean of the pins named in the comment; the districts are hand-placed
// because an average drifts off into the fields west of the blocks.
export const ZONES: { text: string; type: string; at: [number, number]; minZoom: number; tier?: "sub" }[] = [
	{ text: "Residential", type: "Hostels", at: [28.524024, 77.571873], minZoom: 17 }, // Gir 3A ↔ Periyar 2C
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
