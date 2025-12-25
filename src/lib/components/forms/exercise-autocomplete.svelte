<script lang="ts">
	import { Input } from '$lib/components/ui/input';
	import type { Exercise } from '$core/domain/exercise/exercise.entity';

	let {
		exercises,
		onSelect,
		placeholder = 'Search exercises...'
	}: {
		exercises: Exercise[];
		onSelect: (exercise: Exercise) => void;
		placeholder?: string;
	} = $props();

	let searchTerm = $state('');
	let showDropdown = $state(false);
	let highlightedIndex = $state(0);

	// Filter exercises based on search term
	const filteredExercises = $derived(
		searchTerm.trim()
			? exercises.filter(
					(ex) =>
						ex.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
						ex.muscleGroup.toLowerCase().includes(searchTerm.toLowerCase())
				)
			: []
	);

	function handleSelect(exercise: Exercise) {
		onSelect(exercise);
		searchTerm = '';
		showDropdown = false;
		highlightedIndex = 0;
	}

	function handleKeydown(e: KeyboardEvent) {
		if (!showDropdown || filteredExercises.length === 0) return;

		switch (e.key) {
			case 'ArrowDown':
				e.preventDefault();
				highlightedIndex = Math.min(highlightedIndex + 1, filteredExercises.length - 1);
				break;
			case 'ArrowUp':
				e.preventDefault();
				highlightedIndex = Math.max(highlightedIndex - 1, 0);
				break;
			case 'Enter':
				e.preventDefault();
				if (filteredExercises[highlightedIndex]) {
					handleSelect(filteredExercises[highlightedIndex]);
				}
				break;
			case 'Escape':
				showDropdown = false;
				break;
		}
	}

	function handleBlur() {
		// Delay to allow click event on dropdown items
		setTimeout(() => {
			showDropdown = false;
		}, 200);
	}
</script>

<div class="relative w-full">
	<Input
		bind:value={searchTerm}
		{placeholder}
		onfocus={() => (showDropdown = true)}
		onblur={handleBlur}
		onkeydown={handleKeydown}
		autocomplete="off"
	/>

	{#if showDropdown && searchTerm.trim() && filteredExercises.length > 0}
		<div
			class="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md border bg-popover text-popover-foreground shadow-md"
		>
			{#each filteredExercises as exercise, index (exercise.id)}
				<button
					type="button"
					class="w-full cursor-pointer px-3 py-2 text-left text-sm hover:bg-accent {index ===
					highlightedIndex
						? 'bg-accent'
						: ''}"
					onclick={() => handleSelect(exercise)}
					onmouseenter={() => (highlightedIndex = index)}
				>
					<div class="font-medium">{exercise.name}</div>
					<div class="text-xs text-muted-foreground">
						{exercise.muscleGroup} • {exercise.equipmentType}
					</div>
				</button>
			{/each}
		</div>
	{/if}

	{#if showDropdown && searchTerm.trim() && filteredExercises.length === 0}
		<div
			class="absolute z-50 mt-1 w-full rounded-md border bg-popover p-3 text-sm text-muted-foreground shadow-md"
		>
			No exercises found
		</div>
	{/if}
</div>
