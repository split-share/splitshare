<script lang="ts">
	import { enhance } from '$app/forms';
	import { Button } from '$lib/components/ui/button';
	import { Card, CardContent } from '$lib/components/ui/card';
	import { Trash2 } from 'lucide-svelte';
	import StarRating from './star-rating.svelte';
	import type { ReviewWithUserDto } from '$core/domain/split/review.dto';

	let {
		reviews,
		currentUserId
	}: {
		reviews: ReviewWithUserDto[];
		currentUserId?: string;
	} = $props();

	function formatDate(date: Date): string {
		return new Date(date).toLocaleDateString('en-US', {
			month: 'short',
			day: 'numeric',
			year: 'numeric'
		});
	}
</script>

{#if reviews.length === 0}
	<Card>
		<CardContent class="pt-6">
			<p class="text-muted-foreground text-center">No reviews yet. Be the first to review!</p>
		</CardContent>
	</Card>
{:else}
	<div class="space-y-4">
		{#each reviews as review (review.id)}
			<Card>
				<CardContent class="pt-6">
					<div class="flex items-start gap-4">
						{#if review.user.image}
							<img src={review.user.image} alt={review.user.name} class="h-10 w-10 rounded-full" />
						{:else}
							<div
								class="h-10 w-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-semibold"
							>
								{review.user.name.charAt(0).toUpperCase()}
							</div>
						{/if}

						<div class="flex-1 space-y-2">
							<div class="flex items-start justify-between">
								<div>
									<p class="font-semibold">{review.user.name}</p>
									<div class="flex items-center gap-2 mt-1">
										<StarRating rating={review.rating} readonly size="sm" />
										<span class="text-xs text-muted-foreground">{formatDate(review.createdAt)}</span
										>
									</div>
									{#if review.updatedAt.getTime() !== review.createdAt.getTime()}
										<p class="text-xs text-muted-foreground">(edited)</p>
									{/if}
								</div>

								{#if currentUserId === review.userId}
									<div class="flex gap-2">
										<form method="POST" action="?/deleteReview" use:enhance>
											<input type="hidden" name="reviewId" value={review.id} />
											<Button type="submit" variant="ghost" size="sm">
												<Trash2 class="h-4 w-4" />
											</Button>
										</form>
									</div>
								{/if}
							</div>

							<p class="text-sm whitespace-pre-wrap">{review.content}</p>
						</div>
					</div>
				</CardContent>
			</Card>
		{/each}
	</div>
{/if}
