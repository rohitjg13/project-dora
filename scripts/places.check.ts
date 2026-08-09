// Share links are derived from place names, so renaming a place silently changes or breaks its
// URL. Run `npm run check:places` after editing places.ts.
import assert from "node:assert/strict";
import { PLACES, slug, bySlug } from "../src/lib/data/places.ts";

// Every place is reachable by its own slug, and no two places claim the same one — a collision
// would make one of them unshareable.
const seen = new Map<string, string>();
for (const p of PLACES) {
	const s = slug(p);
	assert.ok(s, `${p.name} slugs to an empty string`);
	assert.ok(!seen.has(s), `slug "${s}" claimed by both ${seen.get(s)} and ${p.name}`);
	seen.set(s, p.name);
	assert.equal(bySlug(s)?.name, p.name, `bySlug("${s}") should find ${p.name}`);
}

// Hostels answer to their bare name too.
assert.equal(bySlug("satpura")?.name, "Satpura 6B");
assert.equal(bySlug("sunderbans")?.name, "Sunderbans 1A");
// Two blocks share this base; the shorter name wins rather than PLACES order.
assert.equal(bySlug("kaziranga")?.name, "Kaziranga 2B");
// Digits-only trailing tokens are not block codes — "tower" must stay ambiguous, not pick one.
assert.equal(bySlug("tower"), undefined);
assert.equal(bySlug("notaplace"), undefined);
assert.equal(bySlug(null), undefined);
// Links get typed by hand: punctuation and case are normalised away.
assert.equal(bySlug("Satpura-6B")?.name, "Satpura 6B");

console.log(`ok — ${PLACES.length} places, ${seen.size} unique slugs`);
