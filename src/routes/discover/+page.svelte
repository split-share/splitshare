<script lang="ts">
	import type { PageData } from './$types';
	import SplitCard from '$lib/components/split-card.svelte';
	import { Button } from '$lib/components/ui/button';
	import { goto } from '$app/navigation';
	import { DIFFICULTY_LEVELS } from '$lib/constants';
	import { TrendingUp, Clock } from 'lucide-svelte';

	let { data }: { data: PageData } = $props();

	let sortBy = $state<'popular' | 'recent'>('popular');

	function setSortBy(sort: 'popular' | 'recent') {
		sortBy = sort;
		// TODO: Implement actual sorting in the backend
	}

	function filterByDifficulty(difficulty: string | null) {
		const url = new URL(window.location.href);
		url.searchParams.set('page', '1');
		if (difficulty) {
			url.searchParams.set('difficulty', difficulty);
		} else {
			url.searchParams.delete('difficulty');
		}
		goto(url.toString(), { invalidateAll: true });
	}

	function loadMore() {
		const url = new URL(window.location.href);
		url.searchParams.set('page', (data.currentPage + 1).toString());
		if (data.appliedFilter) {
			url.searchParams.set('difficulty', data.appliedFilter);
		}
		goto(url.toString(), { keepFocus: true });
	}
</script>

<div class="container mx-auto px-4 py-8">
	<!-- Header Section -->
	<div class="mb-8">
		<h1 class="text-4xl font-bold">Discover Splits</h1>
		<p class="mt-2 text-muted-foreground">Explore workout routines shared by the community</p>
	</div>

	<!-- Filter Section -->
	<div class="mb-6 flex flex-wrap items-center gap-3">
		<span class="text-sm font-medium text-muted-foreground">Sort by:</span>
		<div class="flex gap-2">
			<Button
				variant={sortBy === 'popular' ? 'default' : 'ghost'}
				size="sm"
				onclick={() => setSortBy('popular')}
				class="gap-2"
			>
				<TrendingUp class="h-4 w-4" />
				Popular
			</Button>
			<Button
				variant={sortBy === 'recent' ? 'default' : 'ghost'}
				size="sm"
				onclick={() => setSortBy('recent')}
				class="gap-2"
			>
				<Clock class="h-4 w-4" />
				Recent
			</Button>
		</div>

		<div class="h-6 w-px bg-border"></div>

		<span class="text-sm font-medium text-muted-foreground">Difficulty:</span>
		<div class="flex gap-2 flex-wrap">
			<Button
				variant={!data.appliedFilter ? 'default' : 'ghost'}
				size="sm"
				onclick={() => filterByDifficulty(null)}
			>
				All
			</Button>
			{#each DIFFICULTY_LEVELS as difficulty (difficulty)}
				<Button
					variant={data.appliedFilter === difficulty ? 'default' : 'ghost'}
					size="sm"
					onclick={() => filterByDifficulty(difficulty)}
				>
					{difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
				</Button>
			{/each}
		</div>
	</div>

	<!-- Splits Grid -->
	{#if data.popularSplits.length > 0}
		<div class="mb-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
			{#each data.popularSplits as item (item.split.id)}
				<SplitCard
					split={item.split}
					author={item.author}
					likesCount={item.likesCount}
					commentsCount={item.commentsCount}
					isLiked={item.isLiked}
					showPlayButton={!!data.user}
				/>
			{/each}
		</div>

		<!-- Pagination -->
		<div class="flex flex-col items-center gap-4">
			{#if data.hasMore}
				<Button onclick={loadMore} variant="outline" size="lg">Load More Splits</Button>
			{/if}
			<p class="text-sm text-muted-foreground">
				Page {data.currentPage} of {data.totalPages}
			</p>
		</div>
	{:else}
		<div class="rounded-lg border p-12 text-center">
			<p class="text-muted-foreground">
				{#if data.appliedFilter}
					No splits found for {data.appliedFilter} difficulty.
				{:else}
					No public splits available yet. Be the first to create one!
				{/if}
			</p>
			{#if !data.user}
				<Button href="/register" class="mt-4">Sign Up to Create Splits</Button>
			{:else}
				<Button href="/splits/new" class="mt-4">Create Your First Split</Button>
			{/if}
		</div>
	{/if}
</div>
