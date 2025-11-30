<script lang="ts">
	import type { PageData } from './$types';
	import SplitCard from '$lib/components/split-card.svelte';
	import { Button } from '$lib/components/ui/button';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import { goto } from '$app/navigation';
	import { DIFFICULTY_LEVELS } from '$lib/constants';

	let { data }: { data: PageData } = $props();

	function filterByDifficulty(difficulty: string | null) {
		const url = new URL(window.location.href);
		url.searchParams.set('page', '1');
		if (difficulty) {
			url.searchParams.set('difficulty', difficulty);
		} else {
			url.searchParams.delete('difficulty');
		}
		goto(url.toString(), { keepFocus: true, noScroll: true });
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
	<div class="mb-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
		<div class="flex items-center gap-4">
			<div class="flex items-center gap-2">
				<span class="text-sm font-medium">Sort by:</span>
				<DropdownMenu.Root>
					<DropdownMenu.Trigger>
						{#snippet child({ props })}
							<Button {...props} variant="outline" size="sm">
								Popular
								<svg
									xmlns="http://www.w3.org/2000/svg"
									width="16"
									height="16"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									stroke-width="2"
									stroke-linecap="round"
									stroke-linejoin="round"
									class="ml-2"
								>
									<path d="m6 9 6 6 6-6" />
								</svg>
							</Button>
						{/snippet}
					</DropdownMenu.Trigger>
					<DropdownMenu.Content>
						<DropdownMenu.Item>Popular</DropdownMenu.Item>
						<DropdownMenu.Item>Recent</DropdownMenu.Item>
					</DropdownMenu.Content>
				</DropdownMenu.Root>
			</div>
		</div>

		<!-- Difficulty Filter -->
		<div class="flex items-center gap-2">
			<span class="text-sm font-medium">Difficulty:</span>
			<DropdownMenu.Root>
				<DropdownMenu.Trigger>
					{#snippet child({ props })}
						<Button {...props} variant="outline" size="sm">
							{#if data.appliedFilter}
								{data.appliedFilter.charAt(0).toUpperCase() + data.appliedFilter.slice(1)}
							{:else}
								All
							{/if}
							<svg
								xmlns="http://www.w3.org/2000/svg"
								width="16"
								height="16"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								stroke-width="2"
								stroke-linecap="round"
								stroke-linejoin="round"
								class="ml-2"
							>
								<path d="m6 9 6 6 6-6" />
							</svg>
						</Button>
					{/snippet}
				</DropdownMenu.Trigger>
				<DropdownMenu.Content>
					<DropdownMenu.Item onclick={() => filterByDifficulty(null)}>All</DropdownMenu.Item>
					{#each DIFFICULTY_LEVELS as difficulty (difficulty)}
						<DropdownMenu.Item onclick={() => filterByDifficulty(difficulty)}>
							{difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
						</DropdownMenu.Item>
					{/each}
				</DropdownMenu.Content>
			</DropdownMenu.Root>
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
