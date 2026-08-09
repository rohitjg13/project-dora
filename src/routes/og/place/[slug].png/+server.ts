import { ImageResponse, GoogleFont } from "@ethercorps/sveltekit-og/takumi";
import { error } from "@sveltejs/kit";
import { COLORS, bySlug } from "$lib/data/places";
import type { RequestHandler } from "./$types";

// Social card for a ?share= link. Generated per request rather than prebuilt so a new entry in
// places.ts is shareable the moment it ships — nothing to regenerate, nothing to commit.
// Lives under /og/place/ to stay clear of the static /og/default.png the homepage still uses.

const esc = (s: string) =>
	(s || "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c] as string);

export const GET: RequestHandler = async ({ params }) => {
	const place = bySlug(params.slug);
	if (!place) throw error(404, "No such place");

	const accent = COLORS[place.type] ?? "#141414";
	// Inline styles only — the renderer parses no stylesheets. Flex everywhere: it supports no
	// other display mode, and a block-level element silently drops out of the image.
	const html = `
<div style="display:flex;flex-direction:column;width:100%;height:100%;padding:72px;background:#f7f5ef;font-family:'Inter';">
  <div style="display:flex;align-items:center;">
    <div style="display:flex;width:22px;height:22px;border-radius:11px;background:${accent};border:3px solid #141414;"></div>
    <div style="display:flex;margin-left:14px;font-size:26px;font-weight:700;letter-spacing:3px;color:${accent};">${esc(place.type.toUpperCase())}</div>
  </div>
  <div style="display:flex;flex:1;flex-direction:column;justify-content:center;">
    <div style="display:flex;font-size:${place.name.length > 18 ? 84 : 104}px;font-weight:800;color:#141414;line-height:1.05;">${esc(place.name)}</div>
    ${place.desc ? `<div style="display:flex;margin-top:24px;font-size:34px;color:#57534e;line-height:1.35;">${esc(place.desc)}</div>` : ""}
  </div>
  <div style="display:flex;align-items:center;justify-content:space-between;border-top:4px solid #141414;padding-top:26px;">
    <div style="display:flex;font-size:30px;font-weight:800;letter-spacing:2px;color:#141414;">SNOOPY</div>
    <div style="display:flex;font-size:26px;color:#57534e;">SNIoE campus map</div>
  </div>
</div>`;

	const res = new ImageResponse(html, {
		width: 1200,
		height: 630,
		fonts: [new GoogleFont("Inter", { weight: 400 }), new GoogleFont("Inter", { weight: 800 })],
	});
	// set(), not the constructor's `headers` option — that appends to the library's own
	// cache-control instead of replacing it, leaving two max-ages in one header. Its default is a
	// year immutable, which would keep serving an old card after a place's description changes.
	// A day at the CDN: crawlers hit it once, and an edit shows up by tomorrow.
	res.headers.set("cache-control", "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800");
	return res;
};
