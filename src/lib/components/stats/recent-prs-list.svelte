<script lang="ts">
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Trophy } from 'lucide-svelte';
	import type { PersonalRecordDto } from '$core/domain/workout/workout.dto';

	interface Props {
		records: PersonalRecordDto[];
		limit?: number;
	}

	let { records, limit = 5 }: Props = $props();

	const displayRecords = $derived(records.slice(0, limit));
</script>

<Card class="border-none shadow-none bg-card/50">
	<CardHeader class="p-3 pb-2 sm:p-6 sm:pb-3">
		<CardTitle class="flex items-center gap-2 text-sm sm:text-base">
			<Trophy class="h-4 w-4 sm:h-5 sm:w-5" />
			Recent PRs
		</CardTitle>
	</CardHeader>
	<CardContent class="p-3 pt-0 sm:p-6 sm:pt-0">
		{#if records.length === 0}
			<p class="text-muted-foreground text-xs sm:text-sm">No personal records yet. Keep lifting!</p>
		{:else}
			<div class="space-y-2 sm:space-y-3">
				{#each displayRecords as pr (pr.id)}
					<div
						class="flex items-center justify-between border-b pb-2 last:border-0 last:pb-0 sm:pb-3"
					>
						<div class="space-y-0.5 min-w-0 flex-1 mr-2">
							<p class="font-medium text-sm truncate sm:text-base">{pr.exercise.name}</p>
							<p class="text-xs text-muted-foreground capitalize sm:text-sm">
								{pr.exercise.muscleGroup}
							</p>
						</div>
						<div class="text-right shrink-0">
							<p class="text-xs font-bold text-primary sm:text-sm">
								{pr.weight}kg × {pr.reps}
							</p>
							<p class="text-[10px] text-muted-foreground sm:text-xs">
								~{Math.round(pr.oneRepMax)}kg 1RM
							</p>
						</div>
					</div>
				{/each}
			</div>
		{/if}
	</CardContent>
</Card>
