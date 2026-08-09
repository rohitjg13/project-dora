import { redirect } from "@sveltejs/kit";
import { bySlug } from "$lib/data/places";
import type { PageLoad } from "./$types";

// Pretty share links: /place/satpura is the same thing as /?share=satpura. Both forms stay
// supported — the map reads either. Deleting this folder removes the pretty form and nothing else.
export const load: PageLoad = ({ params }) => {
	const place = bySlug(params.slug);
	// A name that isn't on the map just lands on the plain map. 307, not 308: a place that doesn't
	// exist today may exist next week, and a permanent redirect would be cached in browsers long
	// after that.
	if (!place) redirect(307, "/");
	return { place };
};
