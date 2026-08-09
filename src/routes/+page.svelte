<script lang="ts">
	import { page } from "$app/state";
	import Seo from "$lib/components/Seo.svelte";
	import DoraMaps from "$lib/components/DoraMaps.svelte";
	import { bySlug, shareMeta } from "$lib/data/places";

	// A ?share= link previews as the place it points at. This runs during SSR, which is the only
	// pass that matters — link crawlers never execute the map's JS.
	// The prettier /[slug] form of the same link lives in src/routes/[slug]/.
	const shared = $derived(bySlug(page.url.searchParams.get("share")));
	const meta = $derived(shared ? shareMeta(shared) : undefined);
</script>

<Seo
	title={meta?.title ?? "Snoopy"}
	description={meta?.description ??
		"Find any hostel, block, mess, court or facility on the SNIoE campus and get one-tap Google Maps directions."}
	image={meta?.image ?? "default"}
/>

<DoraMaps />
