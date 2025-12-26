<script lang="ts">
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Calendar } from 'lucide-svelte';
	import type { WorkoutLogWithDetailsDto } from '$core/domain/workout/workout.dto';

	interface Props {
		workouts: WorkoutLogWithDetailsDto[];
	}

	let { workouts }: Props = $props();

	function formatDate(date: Date): string {
		return new Date(date).toLocaleDateString('en-US', {
			month: 'short',
			day: 'numeric',
			year: 'numeric'
		});
	}

	function formatDuration(minutes: number): string {
		if (minutes < 60) return `${minutes}m`;
		const hours = Math.floor(minutes / 60);
		const mins = minutes % 60;
		return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
	}
</script>

<Card class="border-none shadow-none bg-card/50">
	<CardHeader class="p-3 pb-2 sm:p-6 sm:pb-3">
		<CardTitle class="flex items-center gap-2 text-sm sm:text-base">
			<Calendar class="h-4 w-4 sm:h-5 sm:w-5" />
			Recent Workouts
		</CardTitle>
	</CardHeader>
	<CardContent class="p-3 pt-0 sm:p-6 sm:pt-0">
		{#if workouts.length === 0}
			<p class="text-muted-foreground text-xs sm:text-sm">No workouts yet. Start training!</p>
		{:else}
			<div class="space-y-2 sm:space-y-3">
				{#each workouts as workout (workout.id)}
					<div
						class="flex items-center justify-between border-b pb-2 last:border-0 last:pb-0 sm:pb-3"
					>
						<div class="space-y-0.5 min-w-0 flex-1 mr-2">
							<p class="font-medium text-sm truncate sm:text-base">{workout.split.title}</p>
							<p class="text-xs text-muted-foreground sm:text-sm">
								{workout.day.name}
							</p>
						</div>
						<div class="text-right shrink-0">
							<p class="text-xs font-medium sm:text-sm">
								{#if workout.duration}
									{formatDuration(workout.duration)}
								{:else}
									--
								{/if}
							</p>
							<p class="text-[10px] text-muted-foreground sm:text-xs">
								{formatDate(workout.completedAt)}
							</p>
						</div>
					</div>
				{/each}
			</div>
		{/if}
	</CardContent>
</Card>
