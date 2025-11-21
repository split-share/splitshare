<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import {
		Card,
		CardContent,
		CardDescription,
		CardHeader,
		CardTitle
	} from '$lib/components/ui/card';
	import { Input } from '$lib/components/ui/input';
	import {
		FieldGroup,
		Field as FieldRoot,
		FieldLabel,
		FieldDescription
	} from '$lib/components/ui/field';
	import { DIFFICULTY_LEVELS, MUSCLE_GROUPS, EQUIPMENT_TYPES } from '$lib/constants';
	import type { CreateExerciseInput } from '$lib/schemas/exercise';

	// Form state using Svelte 5 runes
	let loading = $state(false);
	let error = $state('');

	let name = $state('');
	let description = $state('');
	let difficulty = $state<'beginner' | 'intermediate' | 'advanced'>('intermediate');
	let muscleGroup = $state(MUSCLE_GROUPS[0]);
	let equipmentType = $state(EQUIPMENT_TYPES[0]);
	let imageUrl = $state('');
	let videoUrl = $state('');

	// Submit form
	async function handleSubmit() {
		loading = true;
		error = '';

		try {
			const payload: CreateExerciseInput = {
				name,
				description: description || undefined,
				difficulty,
				muscleGroup,
				equipmentType,
				imageUrl: imageUrl || undefined,
				videoUrl: videoUrl || undefined
			};

			const formData = new FormData();
			formData.append('payload', JSON.stringify(payload));

			const response = await fetch('?/create', {
				method: 'POST',
				body: formData
			});

			if (response.ok || response.redirected) {
				// Will redirect automatically from server action to /splits/new
				window.location.href = '/splits/new';
			} else {
				const result = await response.json();
				error = result.error || 'Failed to create exercise';
			}
		} catch (err) {
			error = 'An error occurred while creating the exercise';
			console.error(err);
		} finally {
			loading = false;
		}
	}
</script>

<div class="container mx-auto px-4 py-8 max-w-2xl">
	<div class="mb-8">
		<h1 class="text-3xl font-bold">Create New Exercise</h1>
		<p class="mt-2 text-muted-foreground">Add a new exercise to your library</p>
	</div>

	{#if error}
		<div class="mb-4 rounded-lg border border-destructive bg-destructive/10 p-4">
			<p class="text-sm text-destructive">{error}</p>
		</div>
	{/if}

	<Card>
		<CardHeader>
			<CardTitle>Exercise Details</CardTitle>
			<CardDescription>Fill in the information about the exercise</CardDescription>
		</CardHeader>
		<CardContent class="space-y-4">
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
					<FieldLabel>Video URL (YouTube)</FieldLabel>
					<Input
						bind:value={videoUrl}
						type="url"
						placeholder="https://www.youtube.com/watch?v=..."
					/>
					<FieldDescription>Link to a YouTube demonstration video</FieldDescription>
				</FieldRoot>

				<FieldRoot>
					<FieldLabel>Image URL</FieldLabel>
					<Input bind:value={imageUrl} type="url" placeholder="https://..." />
					<FieldDescription>Optional thumbnail image</FieldDescription>
				</FieldRoot>
			</FieldGroup>

			<div class="flex justify-between gap-2">
				<Button variant="outline" onclick={() => window.history.back()}>Cancel</Button>
				<Button onclick={handleSubmit} disabled={loading || !name}>
					{loading ? 'Creating...' : 'Create Exercise'}
				</Button>
			</div>
		</CardContent>
	</Card>
</div>
