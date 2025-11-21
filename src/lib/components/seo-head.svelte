<script lang="ts">
	/**
	 * SEO metadata component for consistent meta tags across pages
	 */
	let {
		title = 'SplitShare - Share & Discover Workout Splits',
		description = 'Discover and share workout splits with the fitness community. Create custom training programs, track your progress, and connect with other fitness enthusiasts.',
		image = '/splitshare.png',
		url = '',
		type = 'website',
		keywords = 'workout splits, fitness, training programs, gym routines, exercise plans'
	}: {
		title?: string;
		description?: string;
		image?: string;
		url?: string;
		type?: string;
		keywords?: string;
	} = $props();

	const fullTitle = title.includes('SplitShare') ? title : `${title} | SplitShare`;
	const fullUrl = url ? `https://splitshare.app${url}` : 'https://splitshare.app';
	const fullImage = image.startsWith('http') ? image : `https://splitshare.app${image}`;
</script>

<svelte:head>
	<!-- Primary Meta Tags -->
	<title>{fullTitle}</title>
	<meta name="title" content={fullTitle} />
	<meta name="description" content={description} />
	<meta name="keywords" content={keywords} />

	<!-- Open Graph / Facebook -->
	<meta property="og:type" content={type} />
	<meta property="og:url" content={fullUrl} />
	<meta property="og:title" content={fullTitle} />
	<meta property="og:description" content={description} />
	<meta property="og:image" content={fullImage} />

	<!-- Twitter -->
	<meta property="twitter:card" content="summary_large_image" />
	<meta property="twitter:url" content={fullUrl} />
	<meta property="twitter:title" content={fullTitle} />
	<meta property="twitter:description" content={description} />
	<meta property="twitter:image" content={fullImage} />

	<!-- Additional SEO -->
	<meta name="robots" content="index, follow" />
	<meta name="language" content="English" />
	<meta name="author" content="SplitShare" />
</svelte:head>
