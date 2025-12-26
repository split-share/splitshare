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

<div class="container mx-auto px-4 py-4 sm:py-8 max-w-6xl">
	<!-- Header -->
	<div class="mb-6 sm:mb-8">
		<div class="flex items-center gap-2 sm:gap-3 mb-2">
			<MessageSquare class="h-8 w-8 sm:h-10 sm:w-10 text-primary" />
			<h1 class="text-2xl sm:text-4xl font-bold">Community Forum</h1>
		</div>
		<p class="text-sm sm:text-lg text-muted-foreground">
			Discuss workouts, share tips, and connect with fellow fitness enthusiasts
		</p>
	</div>

	<!-- Categories -->
	<div class="space-y-3 sm:space-y-4">
		{#each data.categories as category (category.id)}
			<a href="/forum/{category.slug}" class="block">
				<Card
					class="hover:bg-muted/50 transition-colors cursor-pointer border-none shadow-none bg-card/50"
				>
					<CardContent class="p-4 sm:pt-6">
						{@const Icon = getIcon(category.icon)}
						<div class="flex items-start sm:items-center gap-3 sm:gap-4">
							<!-- Icon -->
							<div
								class="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-lg bg-primary/10 text-primary flex-shrink-0"
							>
								<Icon class="h-5 w-5 sm:h-6 sm:w-6" />
							</div>

							<!-- Content -->
							<div class="flex-1 min-w-0">
								<div class="flex items-start justify-between gap-2">
									<div class="min-w-0 flex-1">
										<h3 class="text-base sm:text-lg font-semibold mb-0.5 sm:mb-1">
											{category.name}
										</h3>
										<p class="text-xs sm:text-sm text-muted-foreground line-clamp-2">
											{category.description}
										</p>
									</div>
									<!-- Mobile: Show topic count inline -->
									<div class="flex items-center gap-2 sm:hidden flex-shrink-0">
										<span class="text-sm font-medium">{category.topicCount}</span>
										<ChevronRight class="h-4 w-4 text-muted-foreground" />
									</div>
								</div>
								<!-- Mobile: Show last activity below -->
								{#if category.lastActivity}
									<div class="mt-2 text-xs text-muted-foreground sm:hidden">
										<span class="truncate"
											>Latest: {category.lastActivity.topicTitle.length > 25
												? category.lastActivity.topicTitle.substring(0, 25) + '...'
												: category.lastActivity.topicTitle}</span
										>
									</div>
								{/if}
							</div>

							<!-- Desktop Stats -->
							<div class="hidden sm:flex items-center gap-6 text-center flex-shrink-0">
								<div class="min-w-[60px]">
									<div class="text-xl sm:text-2xl font-bold">{category.topicCount}</div>
									<div class="text-xs text-muted-foreground">Topics</div>
								</div>
								<div class="flex items-center text-muted-foreground">
									{#if category.lastActivity}
										<div class="text-sm text-right mr-2 max-w-[180px]">
											<div class="font-medium truncate">
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
