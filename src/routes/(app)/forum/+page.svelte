<script lang="ts">
	import { Card, CardContent } from '$lib/components/ui/card';
	import { MessageSquare, Dumbbell, Apple, TrendingUp, Target, ChevronRight } from 'lucide-svelte';
	import type { ComponentType } from 'svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const iconMap: Record<string, ComponentType> = {
		MessageSquare,
		Dumbbell,
		Apple,
		TrendingUp,
		Target
	};

	function getIcon(iconName: string) {
		return iconMap[iconName] || MessageSquare;
	}
</script>

<div class="container mx-auto px-4 py-8 max-w-6xl">
	<!-- Header -->
	<div class="mb-8">
		<div class="flex items-center gap-3 mb-2">
			<MessageSquare class="h-10 w-10 text-primary" />
			<h1 class="text-4xl font-bold">Community Forum</h1>
		</div>
		<p class="text-lg text-muted-foreground">
			Discuss workouts, share tips, and connect with fellow fitness enthusiasts
		</p>
	</div>

	<!-- Categories -->
	<div class="space-y-4">
		{#each data.categories as category (category.id)}
			<a href="/forum/{category.slug}" class="block">
				<Card class="hover:bg-muted/50 transition-colors cursor-pointer">
					<CardContent class="pt-6">
						{@const Icon = getIcon(category.icon)}
						<div class="flex items-center gap-4">
							<!-- Icon -->
							<div
								class="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary flex-shrink-0"
							>
								<Icon class="h-6 w-6" />
							</div>

							<!-- Content -->
							<div class="flex-1 min-w-0">
								<h3 class="text-lg font-semibold mb-1">{category.name}</h3>
								<p class="text-sm text-muted-foreground">{category.description}</p>
							</div>

							<!-- Stats -->
							<div class="flex items-center gap-6 text-center">
								<div class="min-w-[80px]">
									<div class="text-2xl font-bold">{category.topicCount}</div>
									<div class="text-xs text-muted-foreground">Topics</div>
								</div>
								<div class="flex items-center text-muted-foreground">
									{#if category.lastActivity}
										<div class="text-sm text-right mr-2">
											<div class="font-medium">
												{category.lastActivity.topicTitle.length > 30
													? category.lastActivity.topicTitle.substring(0, 30) + '...'
													: category.lastActivity.topicTitle}
											</div>
											<div class="text-xs text-muted-foreground">
												by {category.lastActivity.userName}
											</div>
										</div>
									{:else}
										<div class="text-sm text-muted-foreground">No topics yet</div>
									{/if}
									<ChevronRight class="h-5 w-5 ml-2" />
								</div>
							</div>
						</div>
					</CardContent>
				</Card>
			</a>
		{/each}
	</div>
</div>
