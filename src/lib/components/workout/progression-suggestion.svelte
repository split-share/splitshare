<script lang="ts">
	import { Card, CardContent } from '$lib/components/ui/card';
	import Badge from '$lib/components/ui/badge.svelte';
	import { Trophy, TrendingUp, Dumbbell, Lightbulb } from 'lucide-svelte';
	import type { ProgressionSuggestionDto } from '$core/domain/workout/progression-suggestion.dto';

	interface Props {
		suggestion: ProgressionSuggestionDto;
	}

	let { suggestion }: Props = $props();

	function formatDate(date: Date): string {
		return new Date(date).toLocaleDateString('en-US', {
			month: 'short',
			day: 'numeric'
		});
	}

	function formatReps(reps: string): string {
		return reps.includes(',') ? reps.split(',').join(', ') : reps;
	}
</script>

<Card class="border-dashed bg-muted/30">
	<CardContent class="p-3 space-y-2">
		{#if suggestion.reason === 'no_history'}
			<!-- First time doing this exercise -->
			<div class="flex items-center gap-2 text-sm">
				<Lightbulb class="h-4 w-4 text-amber-500 flex-shrink-0" />
				<span class="text-muted-foreground">First time! Start light and focus on form.</span>
			</div>
		{:else}
			<!-- Show PR if available -->
			{#if suggestion.currentPR}
				<div class="flex items-center gap-2 text-sm">
					<Trophy class="h-4 w-4 text-amber-500 flex-shrink-0" />
					<span class="text-muted-foreground">PR:</span>
					<Badge variant="secondary" class="text-xs">
						{suggestion.currentPR.weight}kg x {suggestion.currentPR.reps}
					</Badge>
					<span class="text-xs text-muted-foreground">
						({formatDate(suggestion.currentPR.date)})
					</span>
				</div>
			{/if}

			<!-- Show last performance -->
			{#if suggestion.lastPerformance}
				<div class="flex items-center gap-2 text-sm">
					<Dumbbell class="h-4 w-4 text-muted-foreground flex-shrink-0" />
					<span class="text-muted-foreground">Last:</span>
					<Badge variant="outline" class="text-xs">
						{suggestion.lastPerformance.weight ?? 'BW'}kg x {formatReps(
							suggestion.lastPerformance.reps
						)}
					</Badge>
				</div>
			{/if}

			<!-- Show suggestion based on reason -->
			{#if suggestion.reason === 'ready_to_progress' && suggestion.suggestedWeight}
				<div class="flex items-center gap-2 text-sm">
					<TrendingUp class="h-4 w-4 text-green-500 flex-shrink-0" />
					<span class="font-medium text-green-600 dark:text-green-400">Ready to progress!</span>
					<Badge variant="default" class="text-xs bg-green-600">
						Try {suggestion.suggestedWeight}kg (+{suggestion.increment}kg)
					</Badge>
				</div>
				<p class="text-xs text-muted-foreground pl-6">
					You hit your target {suggestion.consecutiveSuccesses} sessions in a row.
				</p>
			{:else if suggestion.reason === 'maintain'}
				<div class="flex items-center gap-2 text-sm">
					<Dumbbell class="h-4 w-4 text-blue-500 flex-shrink-0" />
					<span class="text-muted-foreground">Maintain current weight to build consistency.</span>
				</div>
			{:else if suggestion.reason === 'inconsistent'}
				<div class="flex items-center gap-2 text-sm">
					<Dumbbell class="h-4 w-4 text-orange-500 flex-shrink-0" />
					<span class="text-muted-foreground">
						Keep at current weight. {suggestion.consecutiveSuccesses}/2 successful sessions.
					</span>
				</div>
			{/if}
		{/if}
	</CardContent>
</Card>
