<script lang="ts">
	import { page } from "$app/state";

	interface Props {
		title: string;
		description: string;
		image?: string;
	}

	let { title, description, image = "default" }: Props = $props();

	const siteName = "Snoopy";
	const fullTitle = $derived(`${title} · ${siteName}`);
	const url = $derived(page.url.href);
	const imageUrl = $derived(new URL(`/og/${image}.png`, page.url.origin).href);
</script>

<svelte:head>
	<title>{fullTitle}</title>
	<meta name="description" content={description} />
	<link rel="canonical" href={url} />

	<meta property="og:site_name" content={siteName} />
	<meta property="og:type" content="website" />
	<meta property="og:title" content={fullTitle} />
	<meta property="og:description" content={description} />
	<meta property="og:url" content={url} />
	<meta property="og:image" content={imageUrl} />
	<meta property="og:image:type" content="image/png" />
	<meta property="og:image:width" content="1200" />
	<meta property="og:image:height" content="630" />
	<meta property="og:image:alt" content={fullTitle} />

	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content={fullTitle} />
	<meta name="twitter:description" content={description} />
	<meta name="twitter:image" content={imageUrl} />
</svelte:head>
