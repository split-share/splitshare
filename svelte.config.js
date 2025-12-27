import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

const isMobileBuild = process.env.MOBILE_BUILD === 'true';
const isDockerBuild = process.env.DOCKER_BUILD === 'true';

// Dynamically import adapters based on build type to avoid missing dependency errors
let adapter;
if (isMobileBuild) {
	const adapterStatic = await import('@sveltejs/adapter-static');
	adapter = adapterStatic.default({
		pages: 'build',
		assets: 'build',
		fallback: 'index.html',
		precompress: false
	});
} else if (isDockerBuild) {
	const adapterNode = await import('@sveltejs/adapter-node');
	adapter = adapterNode.default();
} else {
	// Default: Cloudflare Pages
	const adapterCloudflare = await import('@sveltejs/adapter-cloudflare');
	adapter = adapterCloudflare.default();
}

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: vitePreprocess(),

	kit: {
		alias: {
			'@/*': './src/lib/*',
			$core: './src/core',
			$adapters: './src/adapters',
			$infrastructure: './src/infrastructure',
			$presentation: './src/presentation'
		},
		adapter
	}
};

export default config;
