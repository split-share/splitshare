<script lang="ts">
	import type { DayExercise, Exercise } from '$lib/server/db/schema';

	let {
		exercise
	}: {
		exercise: DayExercise & { exercise: Exercise };
	} = $props();
</script>

<div class="flex items-center justify-between rounded-lg border p-4">
	<div class="flex-1">
		<h4 class="font-medium">{exercise.exercise.name}</h4>
		<div class="mt-1 flex gap-3 text-sm text-muted-foreground">
			<span>{exercise.sets} sets</span>
			<span>•</span>
			<span>{exercise.reps} reps</span>
			{#if exercise.restTime}
				<span>•</span>
				<span>{exercise.restTime}s rest</span>
			{/if}
		</div>
		{#if exercise.notes}
			<p class="mt-2 text-sm italic text-muted-foreground">{exercise.notes}</p>
		{/if}
	</div>

	<div class="flex flex-col items-end gap-1">
		<span class="rounded-md bg-secondary px-2 py-1 text-xs font-medium">
			{exercise.exercise.muscleGroup}
		</span>
		<span class="text-xs text-muted-foreground">{exercise.exercise.equipmentType}</span>
	</div>
</div>
