<script lang="ts">
	import { enhance } from '$app/forms';
	import { Button } from '$lib/components/ui/button';
	import {
		Card,
		CardContent,
		CardDescription,
		CardHeader,
		CardTitle
	} from '$lib/components/ui/card';
	import { RichTextEditor } from '$lib/components/ui/rich-text-editor';
	import { ArrowLeft, Eye, MessageSquare, Edit2, Trash2, Pin, Lock } from 'lucide-svelte';
	import type { PageData, ActionData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	const isAuthor = $derived(data.user?.id === data.topic.author.id);
	const isAuthenticated = $derived(!!data.user);

	let newPostContent = $state('');
	let editingPostId = $state<string | null>(null);
	let editingPostContent = $state('');

	function startEditing(postId: string, currentContent: string) {
		editingPostId = postId;
		editingPostContent = currentContent;
	}

	function cancelEditing() {
		editingPostId = null;
		editingPostContent = '';
	}

	function formatDate(date: Date): string {
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
		<Button href="/forum/{data.topic.category.slug}" variant="ghost" class="mb-2">
			<ArrowLeft class="h-4 w-4 mr-2" />
			Back to {data.topic.category.name}
		</Button>

		<div class="flex items-start justify-between gap-4">
			<div class="flex-1">
				<div class="flex items-center gap-3 mb-2">
					<h1 class="text-4xl font-bold">{data.topic.title}</h1>
					{#if data.topic.isPinned}
						<Pin class="h-6 w-6 text-primary" />
					{/if}
					{#if data.topic.isLocked}
						<Lock class="h-6 w-6 text-muted-foreground" />
					{/if}
				</div>

				<div class="flex items-center gap-4 text-sm text-muted-foreground">
					<span>by {data.topic.author.name}</span>
					<span>•</span>
					<span>{formatDate(data.topic.createdAt)}</span>
					<span>•</span>
					<div class="flex items-center gap-1.5">
						<Eye class="h-4 w-4" />
						<span>{data.topic.viewCount} views</span>
					</div>
					<span>•</span>
					<div class="flex items-center gap-1.5">
						<MessageSquare class="h-4 w-4" />
						<span>{data.topic.postCount} replies</span>
					</div>
				</div>
			</div>

			{#if isAuthor}
				<form method="POST" action="?/deleteTopic" use:enhance>
					<Button type="submit" variant="destructive" size="sm">
						<Trash2 class="h-4 w-4 mr-2" />
						Delete Topic
					</Button>
				</form>
			{/if}
		</div>
	</div>

	<!-- Original Post -->
	<Card class="mb-8">
		<CardContent class="pt-6">
			<div class="flex items-start gap-4">
				{#if data.topic.author.image}
					<img
						src={data.topic.author.image}
						alt={data.topic.author.name}
						class="h-12 w-12 rounded-full flex-shrink-0"
					/>
				{:else}
					<div
						class="h-12 w-12 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-semibold flex-shrink-0"
					>
						{data.topic.author.name.charAt(0).toUpperCase()}
					</div>
				{/if}

				<div class="flex-1">
					<div class="mb-4">
						<p class="font-semibold text-lg">{data.topic.author.name}</p>
						<p class="text-xs text-muted-foreground">{formatDate(data.topic.createdAt)}</p>
					</div>

					<div class="prose prose-sm max-w-none">
						<!-- eslint-disable-next-line svelte/no-at-html-tags -->
						{@html data.topic.content}
					</div>
				</div>
			</div>
		</CardContent>
	</Card>

	<!-- Replies -->
	{#if data.posts.length > 0}
		<div class="mb-8 space-y-4">
			<h2 class="text-2xl font-bold">Replies ({data.posts.length})</h2>

			{#each data.posts as post (post.id)}
				<Card>
					<CardContent class="pt-6">
						<div class="flex items-start gap-4">
							{#if post.author.image}
								<img
									src={post.author.image}
									alt={post.author.name}
									class="h-10 w-10 rounded-full flex-shrink-0"
								/>
							{:else}
								<div
									class="h-10 w-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-semibold flex-shrink-0"
								>
									{post.author.name.charAt(0).toUpperCase()}
								</div>
							{/if}

							<div class="flex-1 space-y-2">
								<div class="flex items-center justify-between">
									<div>
										<p class="font-semibold">{post.author.name}</p>
										<p class="text-xs text-muted-foreground">{formatDate(post.createdAt)}</p>
										{#if post.updatedAt.getTime() !== post.createdAt.getTime()}
											<p class="text-xs text-muted-foreground">(edited)</p>
										{/if}
									</div>

									{#if data.user?.id === post.author.id}
										<div class="flex gap-2">
											<Button
												variant="ghost"
												size="sm"
												onclick={() => startEditing(post.id, post.content)}
											>
												<Edit2 class="h-4 w-4" />
											</Button>
											<form method="POST" action="?/deletePost" use:enhance>
												<input type="hidden" name="postId" value={post.id} />
												<Button type="submit" variant="ghost" size="sm">
													<Trash2 class="h-4 w-4" />
												</Button>
											</form>
										</div>
									{/if}
								</div>

								{#if editingPostId === post.id}
									<form
										method="POST"
										action="?/updatePost"
										use:enhance={() => {
											return async ({ update }) => {
												await update();
												cancelEditing();
											};
										}}
									>
										<input type="hidden" name="postId" value={post.id} />
										<input type="hidden" name="content" value={editingPostContent} />
										<div class="space-y-2">
											<RichTextEditor
												bind:value={editingPostContent}
												minHeight="150px"
												onUpdate={(html) => {
													editingPostContent = html;
												}}
											/>
											<div class="flex gap-2 justify-end">
												<Button type="button" variant="outline" size="sm" onclick={cancelEditing}>
													Cancel
												</Button>
												<Button type="submit" size="sm">Save</Button>
											</div>
										</div>
									</form>
								{:else}
									<div class="prose prose-sm max-w-none">
										<!-- eslint-disable-next-line svelte/no-at-html-tags -->
										{@html post.content}
									</div>
								{/if}
							</div>
						</div>
					</CardContent>
				</Card>
			{/each}
		</div>
	{/if}

	<!-- Reply Form -->
	{#if isAuthenticated && !data.topic.isLocked}
		<Card>
			<CardHeader>
				<CardTitle>Post a Reply</CardTitle>
				<CardDescription>Share your thoughts on this topic</CardDescription>
			</CardHeader>
			<CardContent>
				<form
					method="POST"
					action="?/createPost"
					use:enhance={() => {
						return async ({ update }) => {
							await update();
							newPostContent = '';
						};
					}}
				>
					{#if form?.error}
						<div
							class="bg-destructive/10 text-destructive border border-destructive rounded-md p-4 mb-4"
						>
							{form.error}
						</div>
					{/if}

					<div class="space-y-4">
						<input type="hidden" name="content" value={newPostContent} />
						<RichTextEditor
							bind:value={newPostContent}
							placeholder="Write your reply..."
							minHeight="200px"
							onUpdate={(html) => {
								newPostContent = html;
							}}
						/>
						<div class="flex justify-end">
							<Button type="submit" disabled={!newPostContent.trim()}>Post Reply</Button>
						</div>
					</div>
				</form>
			</CardContent>
		</Card>
	{:else if !isAuthenticated}
		<Card>
			<CardContent class="pt-6">
				<p class="text-muted-foreground text-center">
					<a
						href="/login?redirect=/forum/topic/{data.topic.id}"
						class="text-primary hover:underline"
					>
						Sign in
					</a> to reply to this topic
				</p>
			</CardContent>
		</Card>
	{:else if data.topic.isLocked}
		<Card>
			<CardContent class="pt-6">
				<div class="flex items-center justify-center gap-2 text-muted-foreground">
					<Lock class="h-5 w-5" />
					<p>This topic is locked and cannot accept new replies</p>
				</div>
			</CardContent>
		</Card>
	{/if}
</div>
