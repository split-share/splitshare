<script lang="ts">
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
	import Badge from '$lib/components/ui/badge.svelte';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Textarea } from '$lib/components/ui/textarea';
	import { Check, Dumbbell } from 'lucide-svelte';
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

	let weight = $state(suggestedWeight || '');
	let reps = $state(exercise.reps.split('-')[0] || '10');
	let notes = $state('');

	function handleCompleteSet() {
		const weightNum = weight ? parseFloat(weight) : null;
		const repsNum = parseInt(reps) || 0;
		onCompleteSet(weightNum, repsNum, notes || null);
		// Reset notes for next set, keep weight
		notes = '';
	}
</script>

<Card class="border-2">
	<CardHeader class="pb-4">
		<div class="flex items-start justify-between gap-4">
			<div class="flex items-start gap-3">
				{#if exercise.exercise?.imageUrl}
					<img
						src={exercise.exercise.imageUrl}
						alt={exercise.exerciseName}
						class="w-16 h-16 rounded-lg object-cover"
					/>
				{:else}
					<div
						class="w-16 h-16 rounded-lg bg-muted flex items-center justify-center text-muted-foreground"
					>
						<Dumbbell class="h-8 w-8" />
					</div>
				{/if}
				<div>
					<CardTitle class="text-xl">{exercise.exerciseName}</CardTitle>
					{#if exercise.exercise}
						<div class="flex flex-wrap gap-1 mt-1">
							<Badge variant="outline" class="text-xs">{exercise.exercise.muscleGroup}</Badge>
							<Badge variant="outline" class="text-xs">{exercise.exercise.equipmentType}</Badge>
						</div>
					{/if}
				</div>
			</div>
			<Badge variant="secondary" class="text-lg px-3 py-1">
				Set {currentSet + 1}/{totalSets}
			</Badge>
		</div>
	</CardHeader>

	<CardContent class="space-y-6">
		<!-- Target info -->
		<div class="flex gap-4 text-sm">
			<div class="flex items-center gap-2">
				<span class="text-muted-foreground">Target:</span>
				<Badge>{exercise.sets} sets x {exercise.reps} reps</Badge>
			</div>
			{#if exercise.restTime}
				<div class="flex items-center gap-2">
					<span class="text-muted-foreground">Rest:</span>
					<Badge variant="outline">{exercise.restTime}s</Badge>
				</div>
			{/if}
		</div>

		<!-- Completed sets summary -->
		{#if completedSetsForExercise.length > 0}
			<div class="space-y-2">
				<Label class="text-sm text-muted-foreground">Completed sets:</Label>
				<div class="flex flex-wrap gap-2">
					{#each completedSetsForExercise as set, idx (idx)}
						<Badge variant="secondary" class="gap-1">
							<Check class="h-3 w-3" />
							Set {idx + 1}: {set.weight ? `${set.weight}kg x ` : ''}{set.reps} reps
						</Badge>
					{/each}
				</div>
			</div>
		{/if}

		<!-- Input form for current set -->
		<div class="grid grid-cols-2 gap-4">
			<div class="space-y-2">
				<Label for="weight">Weight (kg)</Label>
				<Input id="weight" type="number" placeholder="e.g., 50" bind:value={weight} step="0.5" />
			</div>
			<div class="space-y-2">
				<Label for="reps">Reps</Label>
				<Input id="reps" type="number" placeholder="e.g., 10" bind:value={reps} />
			</div>
		</div>

		<div class="space-y-2">
			<Label for="notes">Notes (optional)</Label>
			<Textarea id="notes" placeholder="How did this set feel?" bind:value={notes} rows={2} />
		</div>

		{#if exercise.notes}
			<div class="p-3 bg-muted rounded-lg">
				<Label class="text-xs text-muted-foreground">Exercise notes</Label>
				<p class="text-sm mt-1">{exercise.notes}</p>
			</div>
		{/if}

		<Button size="lg" class="w-full" onclick={handleCompleteSet} disabled={isSubmitting}>
			<Check class="h-5 w-5 mr-2" />
			{isSubmitting ? 'Saving...' : 'Complete Set'}
		</Button>
	</CardContent>
</Card>
