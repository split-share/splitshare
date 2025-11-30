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
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { RichTextEditor } from '$lib/components/ui/rich-text-editor';
	import { ArrowLeft } from 'lucide-svelte';
	import type { PageData, ActionData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	let title = $state('');
	let content = $state('');
	let isSubmitting = $state(false);
</script>

<div class="container mx-auto px-4 py-8 max-w-4xl">
	<!-- Header -->
	<div class="mb-8">
		<Button href="/forum/{data.category.slug}" variant="ghost" class="mb-2">
			<ArrowLeft class="h-4 w-4 mr-2" />
			Back to {data.category.name}
		</Button>
		<h1 class="text-4xl font-bold">Create New Topic</h1>
		<p class="text-lg text-muted-foreground mt-2">
			in {data.category.name}
		</p>
	</div>

	<!-- Form -->
	<Card>
		<CardHeader>
			<CardTitle>Topic Details</CardTitle>
			<CardDescription>Share your thoughts, ask questions, or start a discussion</CardDescription>
		</CardHeader>
		<CardContent>
			<form
				method="POST"
				use:enhance={() => {
					isSubmitting = true;
					return async ({ update }) => {
						await update();
						isSubmitting = false;
					};
				}}
				class="space-y-6"
			>
				{#if form?.error}
					<div class="bg-destructive/10 text-destructive border border-destructive rounded-md p-4">
						{form.error}
					</div>
				{/if}

				<!-- Title -->
				<div class="space-y-2">
					<Label for="title">Topic Title</Label>
					<Input
						id="title"
						name="title"
						bind:value={title}
						placeholder="Enter a descriptive title..."
						required
						maxlength={200}
					/>
					<p class="text-xs text-muted-foreground">
						{title.length}/200 characters
					</p>
				</div>

				<!-- Content -->
				<div class="space-y-2">
					<Label for="content">Content</Label>
					<input type="hidden" name="content" value={content} />
					<RichTextEditor
						bind:value={content}
						placeholder="Share your thoughts in detail..."
						minHeight="300px"
						onUpdate={(html) => {
							content = html;
						}}
					/>
					<p class="text-xs text-muted-foreground">
						Use the editor to format your post with headings, lists, bold, italic, and more
					</p>
				</div>

				<!-- Actions -->
				<div class="flex gap-4 justify-end">
					<Button
						type="button"
						variant="outline"
						href="/forum/{data.category.slug}"
						disabled={isSubmitting}
					>
						Cancel
					</Button>
					<Button type="submit" disabled={isSubmitting || !title.trim() || !content.trim()}>
						{isSubmitting ? 'Creating...' : 'Create Topic'}
					</Button>
				</div>
			</form>
		</CardContent>
	</Card>
</div>
