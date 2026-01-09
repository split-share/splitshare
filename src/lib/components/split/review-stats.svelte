<script lang="ts">
	import { Card, CardContent } from '$lib/components/ui/card';
	import { Star } from 'lucide-svelte';
	import type { ReviewStatsDto } from '$core/domain/split/review.dto';

	let { stats }: { stats: ReviewStatsDto } = $props();
</script>

<Card class="border-none shadow-none bg-card/50">
	<CardContent class="p-6">
		<div class="space-y-4">
			<!-- Average Rating -->
			<div class="text-center">
				<div class="text-4xl font-bold">{stats.averageRating.toFixed(1)}</div>
				<div class="flex justify-center gap-1 my-2">
					{#each [1, 2, 3, 4, 5] as star (star)}
						<Star
							class={`h-5 w-5 ${star <= Math.round(stats.averageRating) ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'}`}
						/>
					{/each}
				</div>
				<p class="text-sm text-muted-foreground">{stats.totalReviews} reviews</p>
			</div>

			<!-- Rating Distribution -->
			<div class="space-y-2">
				{#each [5, 4, 3, 2, 1] as rating (rating)}
					{@const count = stats.ratingDistribution[rating as 1 | 2 | 3 | 4 | 5]}
					{@const percentage = stats.totalReviews > 0 ? (count / stats.totalReviews) * 100 : 0}
					<div class="flex items-center gap-2">
						<span class="text-sm w-12 text-right">{rating} stars</span>
						<div class="flex-1 h-2 bg-muted rounded-full overflow-hidden">
							<div class="h-full bg-yellow-400 transition-all" style="width: {percentage}%"></div>
						</div>
						<span class="text-sm w-8 text-muted-foreground">{count}</span>
					</div>
				{/each}
			</div>
		</div>
	</CardContent>
</Card>
