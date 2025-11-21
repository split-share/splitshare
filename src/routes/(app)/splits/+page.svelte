<script lang="ts">
	import {
		Card,
		CardContent,
		CardDescription,
		CardHeader,
		CardTitle
	} from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import Badge from '$lib/components/ui/badge.svelte';
	import SeoHead from '$lib/components/seo-head.svelte';
	import PageTransition from '$lib/components/page-transition.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const { splits } = data;
</script>

<SeoHead
	title="My Splits"
	description="Manage your workout splits and training programs"
	url="/splits"
/>

<PageTransition>
	<div class="container mx-auto px-4 py-8">
		<div class="mb-8 flex items-center justify-between">
			<div>
				<h1 class="text-3xl font-bold">My Splits</h1>
				<p class="mt-2 text-muted-foreground">Manage your workout splits</p>
			</div>
			<Button href="/splits/new">Create Split</Button>
		</div>

		{#if splits.length === 0}
			<div class="rounded-lg border p-8 text-center">
				<p class="text-muted-foreground">No splits yet. Create your first workout split!</p>
				<Button href="/splits/new" class="mt-4">Create First Split</Button>
			</div>
		{:else}
			<div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
				{#each splits as split (split.id)}
					<a href="/splits/{split.id}" class="block transition-transform hover:scale-105">
						<Card class="h-full hover:shadow-lg transition-shadow cursor-pointer">
							{#if split.imageUrl}
								<div class="aspect-video overflow-hidden rounded-t-lg">
									<img src={split.imageUrl} alt={split.title} class="w-full h-full object-cover" />
								</div>
							{/if}
							<CardHeader>
								<div class="flex items-start justify-between gap-2">
									<CardTitle class="text-xl">{split.title}</CardTitle>
									<Badge variant={split.isPublic ? 'default' : 'secondary'} class="shrink-0">
										{split.isPublic ? 'Public' : 'Private'}
									</Badge>
								</div>
								{#if split.description}
									<CardDescription class="line-clamp-2">{split.description}</CardDescription>
								{/if}
							</CardHeader>
							<CardContent>
								<div class="flex flex-wrap gap-2">
									<Badge variant="outline">{split.difficulty}</Badge>
									{#if split.duration}
										<Badge variant="outline">{split.duration} min</Badge>
									{/if}
								</div>
								{#if split.tags && split.tags.length > 0}
									<div class="mt-3 flex flex-wrap gap-1">
										{#each split.tags.slice(0, 3) as tag (tag)}
											<Badge variant="secondary" class="text-xs">{tag}</Badge>
										{/each}
										{#if split.tags.length > 3}
											<Badge variant="secondary" class="text-xs">+{split.tags.length - 3}</Badge>
										{/if}
									</div>
								{/if}
							</CardContent>
						</Card>
					</a>
				{/each}
			</div>
		{/if}
	</div>
</PageTransition>
