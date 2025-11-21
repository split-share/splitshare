<script lang="ts">
	import type { PageData } from './$types';
	import SplitCard from '$lib/components/split-card.svelte';
	import HeroSection from '$lib/components/hero-section.svelte';
	import DifficultyFilter from '$lib/components/difficulty-filter.svelte';
	import SeoHead from '$lib/components/seo-head.svelte';
	import PageTransition from '$lib/components/page-transition.svelte';

	let { data }: { data: PageData } = $props();
</script>

<SeoHead
	title="SplitShare - Share & Discover Workout Splits"
	description="Discover and share workout splits with the fitness community. Create custom training programs and connect with fitness enthusiasts."
	url="/"
/>

<PageTransition>
	<div class="container mx-auto px-4 py-8">
		<HeroSection user={data.user} />

		<!-- Default Splits Section -->
		<div class="mb-8">
			<div class="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
				<div>
					<h2 class="text-2xl font-bold">Default Workout Splits</h2>
					<p class="text-sm text-muted-foreground">Curated workout splits to get you started</p>
				</div>

				<DifficultyFilter currentFilter={data.appliedFilter} />
			</div>

			{#if data.defaultSplits.length > 0}
				<div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
					{#each data.defaultSplits as item (item.split.id)}
						<SplitCard
							split={item.split}
							author={item.author}
							likesCount={item.likesCount}
							commentsCount={item.commentsCount}
							isLiked={item.isLiked}
						/>
					{/each}
				</div>
			{:else}
				<div class="rounded-lg border p-12 text-center">
					<p class="text-muted-foreground">
						{#if data.appliedFilter}
							No default splits found for {data.appliedFilter} difficulty.
						{:else}
							No default splits available yet. Check back soon!
						{/if}
					</p>
				</div>
			{/if}
		</div>
	</div>
</PageTransition>
