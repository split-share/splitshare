<script lang="ts">
	import { enhance } from '$app/forms';
	import { Button } from '$lib/components/ui/button';
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Textarea } from '$lib/components/ui/textarea';
	import { Label } from '$lib/components/ui/label';
	import StarRating from './star-rating.svelte';
	import type { Review } from '$lib/server/db/schema';

	let {
		existingReview,
		isEligible = true
	}: {
		existingReview?: Review;
		isEligible?: boolean;
	} = $props();

	let rating = $state(existingReview?.rating || 0);
	let content = $state(existingReview?.content || '');

	const action = existingReview ? '?/updateReview' : '?/addReview';
	const buttonText = existingReview ? 'Update Review' : 'Submit Review';
</script>

<Card>
	<CardHeader>
		<CardTitle>{existingReview ? 'Edit Your Review' : 'Write a Review'}</CardTitle>
	</CardHeader>
	<CardContent>
		{#if !isEligible}
			<div class="rounded-lg bg-muted p-4 text-sm text-muted-foreground">
				You need to complete at least one workout using this split before you can review it.
			</div>
		{:else}
			<form
				method="POST"
				{action}
				use:enhance={() => {
					return async ({ update }) => {
						await update();
						if (!existingReview) {
							rating = 0;
							content = '';
						}
					};
				}}
			>
				{#if existingReview}
					<input type="hidden" name="reviewId" value={existingReview.id} />
				{/if}
				<input type="hidden" name="rating" value={rating} />

				<div class="space-y-4">
					<div>
						<Label>Rating</Label>
						<StarRating bind:rating size="lg" />
					</div>

					<div>
						<Label for="review-content">Your Review</Label>
						<Textarea
							id="review-content"
							name="content"
							bind:value={content}
							placeholder="Share your experience with this split..."
							class="min-h-[150px]"
							required
						/>
						<p class="mt-1 text-xs text-muted-foreground">
							{content.length}/2000 characters (minimum 10)
						</p>
					</div>

					<div class="flex justify-end gap-2">
						<Button type="submit" disabled={rating === 0 || content.length < 10}>
							{buttonText}
						</Button>
					</div>
				</div>
			</form>
		{/if}
	</CardContent>
</Card>
