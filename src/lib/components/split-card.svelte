<script lang="ts">
	import Card from './ui/card.svelte';
	import Badge from './ui/badge.svelte';
	import type { Split, User } from '$lib/server/db/schema';

	let {
		split,
		author,
		likesCount = 0,
		commentsCount = 0,
		isLiked = false
	}: {
		split: Split & { userId: string };
		author: Pick<User, 'name' | 'image'>;
		likesCount?: number;
		commentsCount?: number;
		isLiked?: boolean;
	} = $props();

	const difficultyColors = {
		beginner: 'bg-green-500',
		intermediate: 'bg-yellow-500',
		advanced: 'bg-red-500'
	};
</script>

<Card class="overflow-hidden transition-shadow hover:shadow-md">
	{#if split.imageUrl}
		<img src={split.imageUrl} alt={split.title} class="h-48 w-full object-cover" />
	{:else}
		<div class="flex h-48 w-full items-center justify-center bg-muted">
			<span class="text-4xl">💪</span>
		</div>
	{/if}

	<div class="p-4">
		<div class="mb-2 flex items-start justify-between">
			<h3 class="text-lg font-semibold">{split.title}</h3>
			<Badge variant="outline">
				<span
					class={`mr-1.5 inline-block h-2 w-2 rounded-full ${difficultyColors[split.difficulty as keyof typeof difficultyColors]}`}
				></span>
				{split.difficulty}
			</Badge>
		</div>

		{#if split.description}
			<p class="mb-3 line-clamp-2 text-sm text-muted-foreground">
				{split.description}
			</p>
		{/if}

		<div class="mb-3 flex flex-wrap gap-2">
			{#if split.tags}
				{#each split.tags as tag}
					<Badge variant="secondary" class="text-xs">{tag}</Badge>
				{/each}
			{/if}
		</div>

		<div class="flex items-center justify-between border-t pt-3">
			<div class="flex items-center gap-2">
				{#if author.image}
					<img src={author.image} alt={author.name} class="h-6 w-6 rounded-full" />
				{:else}
					<div
						class="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground"
					>
						{author.name.charAt(0).toUpperCase()}
					</div>
				{/if}
				<span class="text-sm text-muted-foreground">{author.name}</span>
			</div>

			<div class="flex items-center gap-4 text-sm text-muted-foreground">
				<button class="flex items-center gap-1 hover:text-foreground" class:text-red-500={isLiked}>
					<span>{isLiked ? '❤️' : '🤍'}</span>
					<span>{likesCount}</span>
				</button>
				<div class="flex items-center gap-1">
					<span>💬</span>
					<span>{commentsCount}</span>
				</div>
				{#if split.duration}
					<div class="flex items-center gap-1">
						<span>⏱️</span>
						<span>{split.duration}min</span>
					</div>
				{/if}
			</div>
		</div>
	</div>
</Card>
