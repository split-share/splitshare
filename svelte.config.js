import adapterAuto from '@sveltejs/adapter-auto';
import adapterNode from '@sveltejs/adapter-node';
import adapterStatic from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

const isMobileBuild = process.env.MOBILE_BUILD === 'true';
const isDockerBuild = process.env.DOCKER_BUILD === 'true';

function getAdapter() {
	if (isMobileBuild) {
		return adapterStatic({
			pages: 'build',
			assets: 'build',
			fallback: 'index.html',
			precompress: false
		});
	}
	if (isDockerBuild) {
		return adapterNode();
	}
	// Default: adapter-auto for Vercel/Cloudflare/Netlify
	return adapterAuto();
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
		adapter: getAdapter()
	}
};

export default config;
