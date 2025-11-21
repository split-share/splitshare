<script lang="ts">
	import type { PageData } from './$types';
	import SplitCard from '$lib/components/split-card.svelte';
	import { Button } from '$lib/components/ui/button';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import { goto } from '$app/navigation';
	import { DIFFICULTY_LEVELS } from '$lib/constants';

	let { data }: { data: PageData } = $props();

	/**
	 * Filters splits by difficulty level
	 * @param {string | null} difficulty - Difficulty level to filter by, or null for all
	 */
	function filterByDifficulty(difficulty: string | null) {
		const url = new URL(window.location.href);
		if (difficulty) {
			url.searchParams.set('difficulty', difficulty);
		} else {
			url.searchParams.delete('difficulty');
		}
		goto(url.toString(), { keepFocus: true, noScroll: true });
	}
</script>

<div class="container mx-auto px-4 py-8">
	<!-- Hero Section -->
	<div class="mb-12 text-center">
		<h1 class="mb-4 text-3xl font-bold sm:text-4xl md:text-5xl">Welcome to SplitShare</h1>
		<p class="mb-6 text-base text-muted-foreground sm:text-lg max-w-2xl mx-auto">
			Discover and share workout splits with the fitness community
		</p>
		<div class="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4">
			{#if !data.user}
				<Button href="/login" class="w-full sm:w-auto">Sign In</Button>
				<Button href="/register" variant="outline" class="w-full sm:w-auto">Sign Up</Button>
			{:else}
				<Button href="/splits" class="w-full sm:w-auto">My Splits</Button>
			{/if}
			<Button href="/discover" variant="secondary" class="w-full sm:w-auto">
				<span class="hidden sm:inline">Explore Popular Splits</span>
				<span class="sm:hidden">Explore</span>
			</Button>
		</div>
	</div>

	<!-- Default Splits Section -->
	<div class="mb-8">
		<div class="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
			<div>
				<h2 class="text-2xl font-bold">Default Workout Splits</h2>
				<p class="text-sm text-muted-foreground">Curated workout splits to get you started</p>
			</div>

			<!-- Difficulty Filter -->
			<DropdownMenu.Root>
				<DropdownMenu.Trigger>
					{#snippet child({ props })}
						<Button {...props} variant="outline">
							{#if data.appliedFilter}
								{data.appliedFilter.charAt(0).toUpperCase() + data.appliedFilter.slice(1)}
							{:else}
								All Difficulties
							{/if}
							<span class="ml-2">▼</span>
						</Button>
					{/snippet}
				</DropdownMenu.Trigger>
				<DropdownMenu.Content>
					<DropdownMenu.Item onclick={() => filterByDifficulty(null)}>
						All Difficulties
					</DropdownMenu.Item>
					{#each DIFFICULTY_LEVELS as difficulty (difficulty)}
						<DropdownMenu.Item onclick={() => filterByDifficulty(difficulty)}>
							{difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
						</DropdownMenu.Item>
					{/each}
				</DropdownMenu.Content>
			</DropdownMenu.Root>
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
