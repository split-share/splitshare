<script lang="ts">
	import { SvelteSet } from 'svelte/reactivity';
	import { dndzone, type DndEvent } from 'svelte-dnd-action';
	import { flip } from 'svelte/animate';
	import ExerciseGroup from './exercise-group.svelte';
	import ExerciseGif from '$lib/components/exercise-gif.svelte';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Trash2, GripVertical, Link } from 'lucide-svelte';
	import type { AddExerciseToDayInput } from '$lib/schemas/split';

	interface ExerciseItem extends AddExerciseToDayInput {
		id: string; // Unique ID for drag-and-drop
	}

	interface Props {
		exercises: ExerciseItem[];
		onExercisesChange: (exercises: ExerciseItem[]) => void;
		onRemoveExercise: (index: number) => void;
		onCreateGroup: (exerciseIds: string[], groupType: 'superset' | 'triset') => void;
		onUngroup: (groupId: string) => void;
	}

	let { exercises, onExercisesChange, onRemoveExercise, onCreateGroup, onUngroup }: Props =
		$props();

	const flipDurationMs = 200;
	let selectedForGrouping = new SvelteSet<string>();

	function handleDndConsider(e: CustomEvent<DndEvent<ExerciseItem>>) {
		onExercisesChange(e.detail.items);
	}

	function handleDndFinalize(e: CustomEvent<DndEvent<ExerciseItem>>) {
		// Update order based on new positions
		const reorderedExercises = e.detail.items.map((ex, index) => ({
			...ex,
			order: index
		}));
		onExercisesChange(reorderedExercises);
	}

	function toggleSelection(exerciseId: string) {
		if (selectedForGrouping.has(exerciseId)) {
			selectedForGrouping.delete(exerciseId);
		} else {
			selectedForGrouping.add(exerciseId);
		}
	}

	function createGroupFromSelection() {
		if (selectedForGrouping.size < 2) return;

		const groupType = selectedForGrouping.size === 2 ? 'superset' : 'triset';
		onCreateGroup(Array.from(selectedForGrouping), groupType);
		selectedForGrouping.clear();
	}

	function canCreateGroup() {
		return selectedForGrouping.size >= 2 && selectedForGrouping.size <= 3;
	}

	function handleUngroup(groupId: string) {
		onUngroup(groupId);
	}
</script>

<div class="space-y-2">
	{#if selectedForGrouping.size > 0}
		<div class="flex items-center gap-2 p-2 bg-muted/50 rounded-lg mb-3">
			<span class="text-sm text-muted-foreground">
				{selectedForGrouping.size} exercise{selectedForGrouping.size > 1 ? 's' : ''} selected
			</span>
			<Button
				variant="outline"
				size="sm"
				disabled={!canCreateGroup()}
				onclick={createGroupFromSelection}
			>
				<Link class="h-4 w-4 mr-1" />
				Create {selectedForGrouping.size === 2 ? 'Superset' : 'Triset'}
			</Button>
			<Button variant="ghost" size="sm" onclick={() => selectedForGrouping.clear()}>Cancel</Button>
		</div>
	{/if}

	<div
		use:dndzone={{ items: exercises, flipDurationMs, type: 'exercises' }}
		onconsider={handleDndConsider}
		onfinalize={handleDndFinalize}
		class="space-y-2"
	>
		{#each exercises as exercise (exercise.id)}
			<div animate:flip={{ duration: flipDurationMs }}>
				{#if exercise.groupId}
					{@const groupExercises = exercises.filter((e) => e.groupId === exercise.groupId)}
					{@const isFirstInGroup =
						groupExercises.length > 0 && groupExercises[0].id === exercise.id}
					{#if isFirstInGroup}
						<ExerciseGroup
							groupType={exercise.groupType ?? 'superset'}
							exerciseCount={groupExercises.length}
							onUngroup={() => handleUngroup(exercise.groupId!)}
						>
							{#each groupExercises as groupEx (groupEx.id)}
								{@render exerciseItem(groupEx, false)}
							{/each}
						</ExerciseGroup>
					{/if}
				{:else}
					{@render exerciseItem(exercise, true)}
				{/if}
			</div>
		{/each}
	</div>
</div>

{#snippet exerciseItem(exercise: ExerciseItem, showSelection: boolean)}
	{@const isSelected = selectedForGrouping.has(exercise.id)}
	{@const exerciseIndex = exercises.findIndex((e) => e.id === exercise.id)}
	<div
		class="flex items-start gap-3 rounded-lg bg-background/80 p-4 border transition-all {isSelected
			? 'border-primary ring-2 ring-primary/20'
			: 'border-transparent'}"
	>
		<div class="flex items-center gap-2 cursor-grab active:cursor-grabbing">
			<GripVertical class="h-5 w-5 text-muted-foreground" />
		</div>
		{#if showSelection && !exercise.groupId}
			<button
				type="button"
				class="mt-4 h-5 w-5 rounded border-2 flex items-center justify-center shrink-0 transition-colors {isSelected
					? 'bg-primary border-primary text-primary-foreground'
					: 'border-muted-foreground/30 hover:border-primary'}"
				onclick={() => toggleSelection(exercise.id)}
			>
				{#if isSelected}
					<svg class="h-3 w-3" viewBox="0 0 12 12" fill="currentColor">
						<path
							d="M10.28 2.28L4.75 7.81 2.22 5.28a.75.75 0 00-1.06 1.06l3.25 3.25a.75.75 0 001.06 0l6.25-6.25a.75.75 0 00-1.06-1.06z"
						/>
					</svg>
				{/if}
			</button>
		{/if}
		<ExerciseGif exerciseName={exercise.exerciseName} class="w-16 h-16 shrink-0" />
		<div class="flex-1 space-y-3">
			<div class="font-medium">{exercise.exerciseName}</div>
			<div class="grid grid-cols-4 gap-3">
				<div class="space-y-1">
					<Label class="text-xs text-muted-foreground">Sets</Label>
					<Input
						type="number"
						value={exercise.sets}
						oninput={(e) => {
							const newExercises = [...exercises];
							newExercises[exerciseIndex].sets = parseInt(e.currentTarget.value) || 1;
							onExercisesChange(newExercises);
						}}
						min="1"
						max="20"
						class="h-9"
					/>
				</div>
				<div class="space-y-1">
					<Label class="text-xs text-muted-foreground">Reps</Label>
					<Input
						value={exercise.reps}
						oninput={(e) => {
							const newExercises = [...exercises];
							newExercises[exerciseIndex].reps = e.currentTarget.value;
							onExercisesChange(newExercises);
						}}
						placeholder="8-12"
						class="h-9"
					/>
				</div>
				<div class="space-y-1">
					<Label class="text-xs text-muted-foreground">Weight (kg)</Label>
					<Input
						type="number"
						value={exercise.weight ?? ''}
						oninput={(e) => {
							const newExercises = [...exercises];
							const val = e.currentTarget.value;
							newExercises[exerciseIndex].weight = val ? parseFloat(val) : undefined;
							onExercisesChange(newExercises);
						}}
						placeholder="Optional"
						min="0"
						max="1000"
						step="0.5"
						class="h-9"
					/>
				</div>
				<div class="space-y-1">
					<Label class="text-xs text-muted-foreground">Notes</Label>
					<Input
						value={exercise.notes ?? ''}
						oninput={(e) => {
							const newExercises = [...exercises];
							newExercises[exerciseIndex].notes = e.currentTarget.value || undefined;
							onExercisesChange(newExercises);
						}}
						placeholder="Optional"
						class="h-9"
					/>
				</div>
			</div>
		</div>
		<Button
			type="button"
			variant="ghost"
			size="icon"
			onclick={() => onRemoveExercise(exerciseIndex)}
		>
			<Trash2 class="h-4 w-4" />
		</Button>
	</div>
{/snippet}
