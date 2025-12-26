<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Card, CardContent } from '$lib/components/ui/card';
	import { MessageSquare, Eye, Pin, Lock, Plus, ArrowLeft } from 'lucide-svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	function formatDate(date: Date): string {
		return new Date(date).toLocaleDateString('en-US', {
			month: 'short',
			day: 'numeric',
			year: 'numeric'
		});
	}

	function formatDateTime(date: Date): string {
		return new Date(date).toLocaleDateString('en-US', {
			month: 'short',
			day: 'numeric',
			year: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});
	}
</script>

<div class="container mx-auto px-4 py-4 sm:py-8 max-w-6xl">
	<!-- Header -->
	<div class="mb-6 sm:mb-8">
		<Button href="/forum" variant="ghost" class="mb-2 -ml-2 h-9 px-2 sm:h-10 sm:px-4">
			<ArrowLeft class="h-4 w-4 mr-1 sm:mr-2" />
			<span class="text-sm">Back</span>
		</Button>
		<div class="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4">
			<div class="min-w-0">
				<h1 class="text-2xl sm:text-4xl font-bold">{data.category.name}</h1>
				<p class="text-sm sm:text-lg text-muted-foreground mt-1 sm:mt-2">
					{data.category.description}
				</p>
			</div>
			<Button href="/forum/{data.category.slug}/new" class="w-full sm:w-auto flex-shrink-0">
				<Plus class="h-4 w-4 mr-2" />
				New Topic
			</Button>
		</div>
	</div>

	<!-- Topics List -->
	{#if data.topics.length === 0}
		<Card class="border-none shadow-none bg-card/50">
			<CardContent class="pt-6">
				<div class="text-center py-12">
					<MessageSquare class="h-12 w-12 text-muted-foreground mx-auto mb-4" />
					<h3 class="text-lg font-semibold mb-2">No topics yet</h3>
					<p class="text-muted-foreground mb-4">Be the first to start a discussion!</p>
					<Button href="/forum/{data.category.slug}/new">Create First Topic</Button>
				</div>
			</CardContent>
		</Card>
	{:else}
		<div class="space-y-2">
			{#each data.topics as topic (topic.id)}
				<a href="/forum/topic/{topic.id}" class="block">
					<Card class="hover:bg-muted/50 transition-colors border-none shadow-none bg-card/50">
						<CardContent class="p-4 sm:pt-6">
							<div class="flex items-start gap-3 sm:gap-4">
								<!-- Author Avatar -->
								{#if topic.author.image}
									<img
										src={topic.author.image}
										alt={topic.author.name}
										class="h-8 w-8 sm:h-10 sm:w-10 rounded-full flex-shrink-0"
									/>
								{:else}
									<div
										class="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-semibold flex-shrink-0 text-sm"
									>
										{topic.author.name.charAt(0).toUpperCase()}
									</div>
								{/if}

								<!-- Topic Content -->
								<div class="flex-1 min-w-0">
									<div class="flex items-start gap-2 mb-1">
										<h3 class="text-base sm:text-lg font-semibold flex-1 line-clamp-2">
											{topic.title}
										</h3>
										<div class="flex items-center gap-1 flex-shrink-0">
											{#if topic.isPinned}
												<Pin class="h-4 w-4 text-primary" />
											{/if}
											{#if topic.isLocked}
												<Lock class="h-4 w-4 text-muted-foreground" />
											{/if}
										</div>
									</div>
									<div
										class="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm text-muted-foreground flex-wrap"
									>
										<span class="truncate max-w-[100px] sm:max-w-none">{topic.author.name}</span>
										<span>•</span>
										<span>{formatDate(topic.createdAt)}</span>
									</div>
									<!-- Mobile stats row -->
									<div class="flex items-center gap-4 mt-2 sm:hidden">
										<div class="flex items-center gap-1 text-xs text-muted-foreground">
											<MessageSquare class="h-3.5 w-3.5" />
											<span>{topic.postCount}</span>
										</div>
										<div class="flex items-center gap-1 text-xs text-muted-foreground">
											<Eye class="h-3.5 w-3.5" />
											<span>{topic.viewCount}</span>
										</div>
									</div>
								</div>

								<!-- Desktop Stats -->
								<div class="hidden sm:flex items-center gap-4 md:gap-6 flex-shrink-0">
									<div class="flex items-center gap-1.5 text-sm text-muted-foreground">
										<MessageSquare class="h-4 w-4" />
										<span>{topic.postCount}</span>
									</div>
									<div class="flex items-center gap-1.5 text-sm text-muted-foreground">
										<Eye class="h-4 w-4" />
										<span>{topic.viewCount}</span>
									</div>
									{#if topic.lastPost}
										<div class="hidden md:block text-xs text-muted-foreground text-right">
											<div>Last post by</div>
											<div class="font-medium truncate max-w-[100px]">
												{topic.lastPost.userName}
											</div>
											<div>{formatDateTime(topic.lastPost.createdAt)}</div>
										</div>
									{/if}
								</div>
							</div>
						</CardContent>
					</Card>
				</a>
			{/each}
		</div>
	{/if}
</div>
