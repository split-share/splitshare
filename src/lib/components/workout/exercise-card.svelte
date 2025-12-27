<script lang="ts">
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
	import Badge from '$lib/components/ui/badge.svelte';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Textarea } from '$lib/components/ui/textarea';
	import { Check } from 'lucide-svelte';
	import ExerciseGif from '$lib/components/exercise-gif.svelte';
	import type { DayExerciseDto } from '../../../core/domain/workout/workout-session.dto';
	import type { CompletedSetData } from '../../../core/domain/workout/workout-session.entity';

	interface Props {
		exercise: DayExerciseDto;
		currentSet: number;
		totalSets: number;
		completedSetsForExercise: CompletedSetData[];
		suggestedWeight: string | null;
		onCompleteSet: (weight: number | null, reps: number, notes: string | null) => void;
		isSubmitting?: boolean;
	}

	let {
		exercise,
		currentSet,
		totalSets,
		completedSetsForExercise,
		suggestedWeight,
		onCompleteSet,
		isSubmitting = false
	}: Props = $props();

	// eslint-disable-next-line svelte/prefer-writable-derived -- Mutable state bound to inputs
	let weight = $state('');
	// eslint-disable-next-line svelte/prefer-writable-derived -- Mutable state bound to inputs
	let reps = $state('');
	let notes = $state('');

	// Sync weight and reps when props change
	$effect(() => {
		weight = suggestedWeight || '';
	});

	$effect(() => {
		reps = exercise.reps.split('-')[0] || '10';
	});

	function handleCompleteSet() {
		const weightNum = weight ? parseFloat(weight) : null;
		const repsNum = parseInt(reps) || 0;
		onCompleteSet(weightNum, repsNum, notes || null);
		// Reset notes for next set, keep weight
		notes = '';
	}
</script>

<Card class="border-2">
	<CardHeader class="p-4 sm:p-6 pb-4">
		<div class="flex items-start justify-between gap-2 sm:gap-4">
			<div class="min-w-0 flex-1">
				<CardTitle class="text-lg sm:text-xl truncate">{exercise.exerciseName}</CardTitle>
				{#if exercise.exercise}
					<div class="flex flex-wrap gap-1 mt-1">
						<Badge variant="outline" class="text-xs">{exercise.exercise.muscleGroup}</Badge>
						<Badge variant="outline" class="text-xs">{exercise.exercise.equipmentType}</Badge>
					</div>
				{/if}
			</div>
			<Badge variant="secondary" class="text-sm sm:text-lg px-2 sm:px-3 py-1 flex-shrink-0">
				{currentSet + 1}/{totalSets}
			</Badge>
		</div>
		<!-- Exercise GIF demonstration -->
		<div class="mt-3 sm:mt-4 flex justify-center">
			<ExerciseGif
				exerciseName={exercise.exerciseName}
				gifUrl={exercise.exercise?.gifUrl}
				class="w-36 h-36 sm:w-48 sm:h-48 md:w-64 md:h-64"
			/>
		</div>
	</CardHeader>

	<CardContent class="p-4 sm:p-6 pt-0 space-y-4 sm:space-y-6">
		<!-- Target info -->
		<div class="flex flex-wrap gap-2 sm:gap-4 text-sm">
			<div class="flex items-center gap-1 sm:gap-2">
				<span class="text-muted-foreground text-xs sm:text-sm">Target:</span>
				<Badge class="text-xs sm:text-sm">{exercise.sets}×{exercise.reps}</Badge>
			</div>
			{#if exercise.restTime}
				<div class="flex items-center gap-1 sm:gap-2">
					<span class="text-muted-foreground text-xs sm:text-sm">Rest:</span>
					<Badge variant="outline" class="text-xs sm:text-sm">{exercise.restTime}s</Badge>
				</div>
			{/if}
		</div>

		<!-- Completed sets summary -->
		{#if completedSetsForExercise.length > 0}
			<div class="space-y-2">
				<Label class="text-xs sm:text-sm text-muted-foreground">Completed:</Label>
				<div class="flex flex-wrap gap-1.5 sm:gap-2">
					{#each completedSetsForExercise as set, idx (idx)}
						<Badge variant="secondary" class="gap-1 text-xs">
							<Check class="h-3 w-3" />
							{idx + 1}: {set.weight ? `${set.weight}kg×` : ''}{set.reps}
						</Badge>
					{/each}
				</div>
			</div>
		{/if}

		<!-- Input form for current set -->
		<div class="grid grid-cols-2 gap-3 sm:gap-4">
			<div class="space-y-1.5 sm:space-y-2">
				<Label for="weight" class="text-sm">Weight (kg)</Label>
				<Input
					id="weight"
					type="number"
					placeholder="50"
					bind:value={weight}
					step="0.5"
					class="h-11 sm:h-10"
				/>
			</div>
			<div class="space-y-1.5 sm:space-y-2">
				<Label for="reps" class="text-sm">Reps</Label>
				<Input id="reps" type="number" placeholder="10" bind:value={reps} class="h-11 sm:h-10" />
			</div>
		</div>

		<div class="space-y-1.5 sm:space-y-2">
			<Label for="notes" class="text-sm">Notes (optional)</Label>
			<Textarea id="notes" placeholder="How did this set feel?" bind:value={notes} rows={2} />
		</div>

		{#if exercise.notes}
			<div class="p-3 bg-muted rounded-lg">
				<Label class="text-xs text-muted-foreground">Exercise notes</Label>
				<p class="text-sm mt-1">{exercise.notes}</p>
			</div>
		{/if}

		<Button
			size="lg"
			class="w-full h-12 sm:h-11"
			onclick={handleCompleteSet}
			disabled={isSubmitting}
		>
			<Check class="h-5 w-5 mr-2" />
			{isSubmitting ? 'Saving...' : 'Complete Set'}
		</Button>
	</CardContent>
</Card>
