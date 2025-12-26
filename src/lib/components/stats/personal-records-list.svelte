<script lang="ts">
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
	import type { PersonalRecordDto } from '$core/domain/workout/workout.dto';

	interface Props {
		records: PersonalRecordDto[];
	}

	let { records }: Props = $props();

	function formatDate(date: Date): string {
		return new Date(date).toLocaleDateString('en-US', {
			month: 'short',
			day: 'numeric',
			year: 'numeric'
		});
	}

	// Group personal records by muscle group
	const recordsByMuscleGroup = $derived(() => {
		const groups: Record<string, PersonalRecordDto[]> = {};
		for (const record of records) {
			const group = record.exercise.muscleGroup;
			if (!groups[group]) groups[group] = [];
			groups[group].push(record);
		}
		return groups;
	});
</script>

<Card class="border-none shadow-none bg-card/50">
	<CardHeader class="p-3 pb-2 sm:p-6 sm:pb-3">
		<CardTitle class="text-sm sm:text-base">Personal Records</CardTitle>
	</CardHeader>
	<CardContent class="p-3 pt-0 sm:p-6 sm:pt-0">
		{#if records.length === 0}
			<p class="text-muted-foreground text-xs sm:text-sm">
				No personal records yet. Complete workouts to start tracking your PRs!
			</p>
		{:else}
			<div class="space-y-4 sm:space-y-6">
				{#each Object.entries(recordsByMuscleGroup()) as [muscleGroup, groupRecords] (muscleGroup)}
					<div>
						<h3
							class="font-semibold capitalize mb-2 flex items-center gap-2 text-sm sm:text-base sm:mb-3"
						>
							<span class="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-primary rounded-full"></span>
							{muscleGroup}
						</h3>
						<div class="space-y-1.5 sm:space-y-2">
							{#each groupRecords as pr (pr.id)}
								<div class="flex items-center justify-between p-2 bg-muted/50 rounded-lg sm:p-3">
									<div class="min-w-0 flex-1 mr-2">
										<p class="font-medium text-sm truncate sm:text-base">
											{pr.exercise.name}
										</p>
										<p class="text-[10px] text-muted-foreground sm:text-xs">
											{formatDate(pr.achievedAt)}
										</p>
									</div>
									<div class="text-right shrink-0">
										<p class="font-bold text-primary text-sm sm:text-base">
											{pr.weight}kg × {pr.reps}
										</p>
										<p class="text-[10px] text-muted-foreground sm:text-xs">
											1RM: {Math.round(pr.oneRepMax)}kg
										</p>
									</div>
								</div>
							{/each}
						</div>
					</div>
				{/each}
			</div>
		{/if}
	</CardContent>
</Card>
