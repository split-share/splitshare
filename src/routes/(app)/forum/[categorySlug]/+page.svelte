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

<div class="container mx-auto px-4 py-8 max-w-6xl">
	<!-- Header -->
	<div class="mb-8">
		<div class="flex items-center justify-between mb-4">
			<div>
				<Button href="/forum" variant="ghost" class="mb-2">
					<ArrowLeft class="h-4 w-4 mr-2" />
					Back to Forum
				</Button>
				<h1 class="text-4xl font-bold">{data.category.name}</h1>
				<p class="text-lg text-muted-foreground mt-2">{data.category.description}</p>
			</div>
			<Button href="/forum/{data.category.slug}/new">
				<Plus class="h-4 w-4 mr-2" />
				New Topic
			</Button>
		</div>
	</div>

	<!-- Topics List -->
	{#if data.topics.length === 0}
		<Card>
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
					<Card class="hover:bg-muted/50 transition-colors">
						<CardContent class="pt-6">
							<div class="flex items-start gap-4">
								<!-- Author Avatar -->
								{#if topic.author.image}
									<img
										src={topic.author.image}
										alt={topic.author.name}
										class="h-10 w-10 rounded-full flex-shrink-0"
									/>
								{:else}
									<div
										class="h-10 w-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-semibold flex-shrink-0"
									>
										{topic.author.name.charAt(0).toUpperCase()}
									</div>
								{/if}

								<!-- Topic Content -->
								<div class="flex-1 min-w-0">
									<div class="flex items-start gap-2 mb-1">
										<h3 class="text-lg font-semibold flex-1">{topic.title}</h3>
										{#if topic.isPinned}
											<Pin class="h-4 w-4 text-primary flex-shrink-0" />
										{/if}
										{#if topic.isLocked}
											<Lock class="h-4 w-4 text-muted-foreground flex-shrink-0" />
										{/if}
									</div>
									<div class="flex items-center gap-3 text-sm text-muted-foreground flex-wrap">
										<span>by {topic.author.name}</span>
										<span>•</span>
										<span>{formatDate(topic.createdAt)}</span>
									</div>
								</div>

								<!-- Stats -->
								<div class="flex items-center gap-6 flex-shrink-0">
									<div class="flex items-center gap-1.5 text-sm text-muted-foreground">
										<MessageSquare class="h-4 w-4" />
										<span>{topic.postCount}</span>
									</div>
									<div class="flex items-center gap-1.5 text-sm text-muted-foreground">
										<Eye class="h-4 w-4" />
										<span>{topic.viewCount}</span>
									</div>
									{#if topic.lastPost}
										<div class="text-xs text-muted-foreground text-right min-w-[120px]">
											<div>Last post by</div>
											<div class="font-medium">{topic.lastPost.userName}</div>
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
