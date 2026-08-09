<script lang="ts">
	import { page } from "$app/state";
	import Seo from "$lib/components/Seo.svelte";
	import DoraMaps from "$lib/components/DoraMaps.svelte";
	import { bySlug, slug } from "$lib/data/places";

	// A ?share= link previews as the place it points at. This runs during SSR, which is the only
	// pass that matters — link crawlers never execute the map's JS.
	const shared = $derived(bySlug(page.url.searchParams.get("share")));
</script>

<Seo
	title={shared ? shared.name : "Snoopy"}
	description={shared
		? `${shared.desc || shared.type + " on the SNIoE campus."} Open it on the campus map for one-tap Google Maps directions.`
		: "Find any hostel, block, mess, court or facility on the SNIoE campus and get one-tap Google Maps directions."}
	image={shared ? `place/${slug(shared)}` : "default"}
/>

<DoraMaps />
