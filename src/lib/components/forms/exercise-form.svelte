<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import {
		FieldGroup,
		Field as FieldRoot,
		FieldLabel,
		FieldDescription
	} from '$lib/components/ui/field';
	import { DIFFICULTY_LEVELS, MUSCLE_GROUPS, EQUIPMENT_TYPES } from '$lib/constants';
	import type { CreateExerciseInput } from '$lib/schemas/exercise';
	import type { Exercise } from '$core/domain/exercise/exercise.entity';

	let {
		onSubmit,
		onCancel,
		loading = false
	}: {
		onSubmit: (data: CreateExerciseInput) => Promise<Exercise | void>;
		onCancel?: () => void;
		loading?: boolean;
	} = $props();

	// Form state
	let error = $state('');
	let name = $state('');
	let description = $state('');
	let difficulty = $state<'beginner' | 'intermediate' | 'advanced'>('intermediate');
	let muscleGroup = $state(MUSCLE_GROUPS[0]);
	let equipmentType = $state(EQUIPMENT_TYPES[0]);
	let imageUrl = $state('');
	let isSubmitting = $state(false);

	async function handleSubmit() {
		isSubmitting = true;
		error = '';

		try {
			const payload: CreateExerciseInput = {
				name,
				description: description || undefined,
				difficulty,
				muscleGroup,
				equipmentType,
				imageUrl: imageUrl || undefined
			};

			await onSubmit(payload);

			// Reset form on success
			name = '';
			description = '';
			difficulty = 'intermediate';
			muscleGroup = MUSCLE_GROUPS[0];
			equipmentType = EQUIPMENT_TYPES[0];
			imageUrl = '';
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to create exercise';
		} finally {
			isSubmitting = false;
		}
	}
</script>

<div class="space-y-4">
	{#if error}
		<div class="rounded-lg border border-destructive bg-destructive/10 p-4">
			<p class="text-sm text-destructive">{error}</p>
		</div>
	{/if}

	<FieldGroup>
		<FieldRoot>
			<FieldLabel>Name *</FieldLabel>
			<Input bind:value={name} placeholder="e.g., Bench Press" required />
		</FieldRoot>

		<FieldRoot>
			<FieldLabel>Description</FieldLabel>
			<textarea
				bind:value={description}
				class="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
				placeholder="Describe the exercise and how to perform it..."
			></textarea>
		</FieldRoot>

		<FieldRoot>
			<FieldLabel>Difficulty *</FieldLabel>
			<div class="flex gap-2">
				{#each DIFFICULTY_LEVELS as level (level)}
					<Button
						type="button"
						variant={difficulty === level ? 'default' : 'outline'}
						onclick={() => (difficulty = level)}
					>
						{level.charAt(0).toUpperCase() + level.slice(1)}
					</Button>
				{/each}
			</div>
		</FieldRoot>

		<FieldRoot>
			<FieldLabel>Muscle Group *</FieldLabel>
			<select
				bind:value={muscleGroup}
				class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
			>
				{#each MUSCLE_GROUPS as group (group)}
					<option value={group}>{group}</option>
				{/each}
			</select>
		</FieldRoot>

		<FieldRoot>
			<FieldLabel>Equipment Type *</FieldLabel>
			<select
				bind:value={equipmentType}
				class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
			>
				{#each EQUIPMENT_TYPES as equipment (equipment)}
					<option value={equipment}>{equipment}</option>
				{/each}
			</select>
		</FieldRoot>

		<FieldRoot>
			<FieldLabel>Image URL</FieldLabel>
			<Input bind:value={imageUrl} type="url" placeholder="https://..." />
			<FieldDescription>Optional thumbnail image</FieldDescription>
		</FieldRoot>
	</FieldGroup>

	<div class="flex justify-end gap-2">
		{#if onCancel}
			<Button variant="outline" onclick={onCancel} disabled={isSubmitting}>Cancel</Button>
		{/if}
		<Button onclick={handleSubmit} disabled={loading || isSubmitting || !name}>
			{isSubmitting ? 'Creating...' : 'Create Exercise'}
		</Button>
	</div>
</div>
