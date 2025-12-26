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

<div class="container mx-auto px-4 py-4 sm:py-8 max-w-6xl">
	<!-- Header -->
	<div class="mb-6 sm:mb-8">
		<Button
			href="/forum/{data.topic.category.slug}"
			variant="ghost"
			class="mb-2 -ml-2 h-9 px-2 sm:h-10 sm:px-4"
		>
			<ArrowLeft class="h-4 w-4 mr-1 sm:mr-2" />
			<span class="text-sm">Back</span>
		</Button>

		<div class="space-y-3 sm:space-y-0 sm:flex sm:items-start sm:justify-between sm:gap-4">
			<div class="flex-1 min-w-0">
				<div class="flex items-start gap-2 mb-2">
					<h1 class="text-xl sm:text-3xl md:text-4xl font-bold">{data.topic.title}</h1>
					<div class="flex items-center gap-1 flex-shrink-0 mt-1">
						{#if data.topic.isPinned}
							<Pin class="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-primary" />
						{/if}
						{#if data.topic.isLocked}
							<Lock class="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-muted-foreground" />
						{/if}
					</div>
				</div>

				<div
					class="flex flex-wrap items-center gap-x-2 gap-y-1 sm:gap-x-4 text-xs sm:text-sm text-muted-foreground"
				>
					<span>by {data.topic.author.name}</span>
					<span class="hidden sm:inline">•</span>
					<span>{formatDate(data.topic.createdAt)}</span>
					<span>•</span>
					<div class="flex items-center gap-1">
						<Eye class="h-3.5 w-3.5 sm:h-4 sm:w-4" />
						<span>{data.topic.viewCount}</span>
					</div>
					<div class="flex items-center gap-1">
						<MessageSquare class="h-3.5 w-3.5 sm:h-4 sm:w-4" />
						<span>{data.topic.postCount}</span>
					</div>
				</div>
			</div>

			{#if isAuthor}
				<form method="POST" action="?/deleteTopic" use:enhance class="w-full sm:w-auto">
					<Button type="submit" variant="destructive" size="sm" class="w-full sm:w-auto">
						<Trash2 class="h-4 w-4 mr-2" />
						Delete
					</Button>
				</form>
			{/if}
		</div>
	</div>

	<!-- Original Post -->
	<Card class="mb-6 sm:mb-8 border-none shadow-none bg-card/50">
		<CardContent class="p-4 sm:pt-6">
			<div class="flex items-start gap-3 sm:gap-4">
				{#if data.topic.author.image}
					<img
						src={data.topic.author.image}
						alt={data.topic.author.name}
						class="h-10 w-10 sm:h-12 sm:w-12 rounded-full flex-shrink-0"
					/>
				{:else}
					<div
						class="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-semibold flex-shrink-0 text-sm sm:text-base"
					>
						{data.topic.author.name.charAt(0).toUpperCase()}
					</div>
				{/if}

				<div class="flex-1 min-w-0">
					<div class="mb-3 sm:mb-4">
						<p class="font-semibold text-base sm:text-lg">{data.topic.author.name}</p>
						<p class="text-xs text-muted-foreground">{formatDate(data.topic.createdAt)}</p>
					</div>

					<div class="prose prose-sm max-w-none break-words">
						<!-- eslint-disable-next-line svelte/no-at-html-tags -->
						{@html data.topic.content}
					</div>
				</div>
			</div>
		</CardContent>
	</Card>

	<!-- Replies -->
	{#if data.posts.length > 0}
		<div class="mb-6 sm:mb-8 space-y-3 sm:space-y-4">
			<h2 class="text-xl sm:text-2xl font-bold">Replies ({data.posts.length})</h2>

			{#each data.posts as post (post.id)}
				<Card class="border-none shadow-none bg-card/50">
					<CardContent class="p-4 sm:pt-6">
						<div class="flex items-start gap-3 sm:gap-4">
							{#if post.author.image}
								<img
									src={post.author.image}
									alt={post.author.name}
									class="h-8 w-8 sm:h-10 sm:w-10 rounded-full flex-shrink-0"
								/>
							{:else}
								<div
									class="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-semibold flex-shrink-0 text-sm"
								>
									{post.author.name.charAt(0).toUpperCase()}
								</div>
							{/if}

							<div class="flex-1 min-w-0 space-y-2">
								<div class="flex items-start justify-between gap-2">
									<div>
										<p class="font-semibold text-sm sm:text-base">{post.author.name}</p>
										<p class="text-xs text-muted-foreground">{formatDate(post.createdAt)}</p>
										{#if post.updatedAt.getTime() !== post.createdAt.getTime()}
											<p class="text-xs text-muted-foreground">(edited)</p>
										{/if}
									</div>

									{#if data.user?.id === post.author.id}
										<div class="flex gap-1 sm:gap-2 flex-shrink-0">
											<Button
												variant="ghost"
												size="icon"
												class="h-8 w-8 sm:h-9 sm:w-9"
												onclick={() => startEditing(post.id, post.content)}
											>
												<Edit2 class="h-4 w-4" />
											</Button>
											<form method="POST" action="?/deletePost" use:enhance>
												<input type="hidden" name="postId" value={post.id} />
												<Button
													type="submit"
													variant="ghost"
													size="icon"
													class="h-8 w-8 sm:h-9 sm:w-9"
												>
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
									<div class="prose prose-sm max-w-none break-words">
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
		<Card class="border-none shadow-none bg-card/50">
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
							minHeight="400px"
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
		<Card class="border-none shadow-none bg-card/50">
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
		<Card class="border-none shadow-none bg-card/50">
			<CardContent class="pt-6">
				<div class="flex items-center justify-center gap-2 text-muted-foreground">
					<Lock class="h-5 w-5" />
					<p>This topic is locked and cannot accept new replies</p>
				</div>
			</CardContent>
		</Card>
	{/if}
</div>
