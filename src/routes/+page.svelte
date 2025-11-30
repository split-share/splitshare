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

		<!-- Features Section -->
		<div class="mb-16">
			<h2 class="text-3xl font-bold text-center mb-4">Everything you need to level up</h2>
			<p class="text-center text-muted-foreground mb-12">
				Built by gym enthusiasts, for gym enthusiasts
			</p>

			<div class="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
				<!-- Custom Splits -->
				<div class="flex flex-col items-center text-center p-6">
					<div
						class="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary"
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="32"
							height="32"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
							stroke-linecap="round"
							stroke-linejoin="round"
						>
							<path d="m6.5 6.5 11 11" />
							<path d="m21 21-1-1" />
							<path d="m3 3 1 1" />
							<path d="m18 22 4-4" />
							<path d="m2 6 4-4" />
							<path d="m3 10 7-7" />
							<path d="m14 21 7-7" />
						</svg>
					</div>
					<h3 class="text-xl font-semibold mb-2">Custom Splits</h3>
					<p class="text-muted-foreground text-sm">
						Build your perfect routine with our intuitive split builder
					</p>
				</div>

				<!-- Community -->
				<div class="flex flex-col items-center text-center p-6">
					<div
						class="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary"
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="32"
							height="32"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
							stroke-linecap="round"
							stroke-linejoin="round"
						>
							<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
							<circle cx="9" cy="7" r="4" />
							<path d="M22 21v-2a4 4 0 0 0-3-3.87" />
							<path d="M16 3.13a4 4 0 0 1 0 7.75" />
						</svg>
					</div>
					<h3 class="text-xl font-semibold mb-2">Community</h3>
					<p class="text-muted-foreground text-sm">
						Connect with fellow lifters and share your progress
					</p>
				</div>

				<!-- Easy Sharing -->
				<div class="flex flex-col items-center text-center p-6">
					<div
						class="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary"
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="32"
							height="32"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
							stroke-linecap="round"
							stroke-linejoin="round"
						>
							<path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
							<polyline points="16 6 12 2 8 6" />
							<line x1="12" x2="12" y1="2" y2="15" />
						</svg>
					</div>
					<h3 class="text-xl font-semibold mb-2">Easy Sharing</h3>
					<p class="text-muted-foreground text-sm">
						Share your splits via link with friends or social media
					</p>
				</div>

				<!-- Trending Routines -->
				<div class="flex flex-col items-center text-center p-6">
					<div
						class="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary"
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="32"
							height="32"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
							stroke-linecap="round"
							stroke-linejoin="round"
						>
							<polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
						</svg>
					</div>
					<h3 class="text-xl font-semibold mb-2">Trending Routines</h3>
					<p class="text-muted-foreground text-sm">Discover what's working for the community</p>
				</div>
			</div>
		</div>

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
