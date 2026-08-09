import { sveltekit } from '@sveltejs/kit/vite';
import { sveltekitOG } from '@ethercorps/sveltekit-og/plugin';
import { defineConfig } from 'vite';

export default defineConfig({
	// esmImport:false inlines the renderer's Wasm as base64 — the Node bundlers Vercel and
	// adapter-node use have no loader for a standalone .wasm chunk and fail the build without it.
	plugins: [sveltekit(), sveltekitOG({ esmImport: false })]
});
