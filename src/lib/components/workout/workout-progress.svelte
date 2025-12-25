<script lang="ts">
	import Badge from '$lib/components/ui/badge.svelte';

	interface Props {
		currentExerciseIndex: number;
		totalExercises: number;
		currentSetIndex: number;
		totalSets: number;
	}

	let { currentExerciseIndex, totalExercises, currentSetIndex, totalSets }: Props = $props();

	let overallProgress = $derived(() => {
		const completedExercises = currentExerciseIndex;
		const currentExerciseProgress = totalSets > 0 ? currentSetIndex / totalSets : 0;
		return ((completedExercises + currentExerciseProgress) / totalExercises) * 100;
	});
</script>

<div class="space-y-3">
	<div class="flex items-center justify-between text-sm">
		<div class="flex items-center gap-2">
			<Badge variant="outline">Exercise {currentExerciseIndex + 1} of {totalExercises}</Badge>
			<Badge variant="secondary">Set {currentSetIndex + 1} of {totalSets}</Badge>
		</div>
		<span class="text-muted-foreground">{Math.round(overallProgress())}%</span>
	</div>
	<div class="h-2 bg-muted rounded-full overflow-hidden">
		<div
			class="h-full bg-primary transition-all duration-300 ease-out"
			style="width: {overallProgress()}%"
		></div>
	</div>
</div>
