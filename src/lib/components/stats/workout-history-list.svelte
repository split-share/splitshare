<script lang="ts">
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
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
		<CardTitle class="text-sm sm:text-base">Workout History</CardTitle>
	</CardHeader>
	<CardContent class="p-3 pt-0 sm:p-6 sm:pt-0">
		{#if workouts.length === 0}
			<p class="text-muted-foreground text-xs sm:text-sm">No workouts completed yet.</p>
		{:else}
			<div class="space-y-3 sm:space-y-4">
				{#each workouts as workout (workout.id)}
					<div class="border rounded-lg p-3 space-y-2 sm:p-4 sm:space-y-3">
						<div class="flex items-center justify-between">
							<div class="min-w-0 flex-1 mr-2">
								<p class="font-semibold text-sm truncate sm:text-base">
									{workout.split.title}
								</p>
								<p class="text-xs text-muted-foreground sm:text-sm">{workout.day.name}</p>
							</div>
							<div class="text-right shrink-0">
								<p class="text-xs font-medium sm:text-sm">
									{formatDate(workout.completedAt)}
								</p>
								{#if workout.duration}
									<p class="text-[10px] text-muted-foreground sm:text-xs">
										{formatDuration(workout.duration)}
									</p>
								{/if}
							</div>
						</div>

						{#if workout.exercises.length > 0}
							<div class="border-t pt-2 sm:pt-3">
								<p class="text-[10px] text-muted-foreground mb-1.5 sm:text-xs sm:mb-2">
									Exercises:
								</p>
								<div class="grid grid-cols-1 gap-1.5 text-xs sm:grid-cols-2 sm:gap-2 sm:text-sm">
									{#each workout.exercises as exercise (exercise.id)}
										<div class="flex justify-between items-center">
											<span class="truncate mr-2">{exercise.exercise.name}</span>
											<span class="text-muted-foreground shrink-0">
												{#if exercise.weight}
													{exercise.weight}kg × {exercise.reps}
												{:else}
													{exercise.sets}×{exercise.reps}
												{/if}
											</span>
										</div>
									{/each}
								</div>
							</div>
						{/if}

						{#if workout.notes}
							<p class="text-xs text-muted-foreground italic border-t pt-2 sm:text-sm sm:pt-3">
								{workout.notes}
							</p>
						{/if}
					</div>
				{/each}
			</div>
		{/if}
	</CardContent>
</Card>
