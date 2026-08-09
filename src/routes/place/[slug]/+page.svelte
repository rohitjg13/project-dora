<script lang="ts">
	import Seo from "$lib/components/Seo.svelte";
	import DoraMaps from "$lib/components/DoraMaps.svelte";
	import { shareMeta } from "$lib/data/places";
	import type { PageData } from "./$types";

	let { data }: { data: PageData } = $props();
	const meta = $derived(shareMeta(data.place));
</script>

<Seo title={meta.title} description={meta.description} image={meta.image} />

<DoraMaps />
