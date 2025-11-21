<script lang="ts">
	import { goto } from '$app/navigation';
	import { Button } from '$lib/components/ui/button';
	import {
		Card,
		CardContent,
		CardDescription,
		CardHeader,
		CardTitle
	} from '$lib/components/ui/card';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import {
		FieldGroup,
		Field as FieldRoot,
		FieldLabel,
		FieldDescription
	} from '$lib/components/ui/field';
	import Badge from '$lib/components/ui/badge.svelte';
	import { DIFFICULTY_LEVELS, WORKOUT_TAGS } from '$lib/constants';
	import type { PageData } from './$types';
	import type {
		CreateCompleteSplitInput,
		CreateSplitDayInput,
		AddExerciseToDayInput
	} from '$lib/schemas/split';

	let { data }: { data: PageData } = $props();

	// Form state using Svelte 5 runes
	let currentStep = $state(1);
	let loading = $state(false);
	let error = $state('');

	// Split basic info
	let title = $state('');
	let description = $state('');
	let difficulty = $state<'beginner' | 'intermediate' | 'advanced'>('intermediate');
	let duration = $state<number | undefined>(undefined);
	let isPublic = $state(false);
	let selectedTags = $state<string[]>([]);
	let imageUrl = $state('');

	// Days state
	let days = $state<CreateSplitDayInput[]>([]);

	// Available exercises from server
	const exercises = data.exercises;

	// Add a new day
	function addDay() {
		const newDay: CreateSplitDayInput = {
			dayNumber: days.length + 1,
			name: `Day ${days.length + 1}`,
			isRestDay: false,
			exercises: []
		};
		days = [...days, newDay];
	}

	// Remove a day
	function removeDay(index: number) {
		days = days.filter((_, i) => i !== index);
		// Renumber remaining days
		days = days.map((day, i) => ({ ...day, dayNumber: i + 1 }));
	}

	// Toggle rest day
	function toggleRestDay(index: number) {
		days[index].isRestDay = !days[index].isRestDay;
		if (days[index].isRestDay) {
			days[index].exercises = [];
		}
	}

	// Add exercise to a day
	function addExerciseToDay(dayIndex: number, exerciseId: string) {
		const exercise: AddExerciseToDayInput = {
			exerciseId,
			sets: 3,
			reps: '10',
			restTime: 60,
			order: days[dayIndex].exercises.length,
			notes: ''
		};
		days[dayIndex].exercises = [...days[dayIndex].exercises, exercise];
	}

	// Remove exercise from a day
	function removeExerciseFromDay(dayIndex: number, exerciseIndex: number) {
		days[dayIndex].exercises = days[dayIndex].exercises.filter((_, i) => i !== exerciseIndex);
		// Renumber remaining exercises
		days[dayIndex].exercises = days[dayIndex].exercises.map((ex, i) => ({ ...ex, order: i }));
	}

	// Toggle tag selection
	function toggleTag(tag: string) {
		if (selectedTags.includes(tag)) {
			selectedTags = selectedTags.filter((t) => t !== tag);
		} else {
			selectedTags = [...selectedTags, tag];
		}
	}

	// Navigation
	function nextStep() {
		if (currentStep < 4) {
			currentStep++;
		}
	}

	function prevStep() {
		if (currentStep > 1) {
			currentStep--;
		}
	}

	// Submit form
	async function handleSubmit() {
		loading = true;
		error = '';

		try {
			const payload: CreateCompleteSplitInput = {
				title,
				description: description || undefined,
				difficulty,
				duration,
				isPublic,
				tags: selectedTags.length > 0 ? selectedTags : undefined,
				imageUrl: imageUrl || undefined,
				days
			};

			const formData = new FormData();
			formData.append('payload', JSON.stringify(payload));

			const response = await fetch('?/create', {
				method: 'POST',
				body: formData
			});

			if (response.ok) {
				// Will redirect automatically from server action
				const result = await response.json();
				if (result.type === 'redirect') {
					goto(result.location);
				}
			} else {
				const result = await response.json();
				error = result.error || 'Failed to create split';
			}
		} catch (err) {
			error = 'An error occurred while creating the split';
			console.error(err);
		} finally {
			loading = false;
		}
	}

	// Get exercise name by ID
	function getExerciseName(exerciseId: string) {
		return exercises.find((ex) => ex.id === exerciseId)?.name || 'Unknown Exercise';
	}
</script>

<div class="container mx-auto px-4 py-8 max-w-4xl">
	<div class="mb-8">
		<h1 class="text-3xl font-bold">Create New Split</h1>
		<p class="mt-2 text-muted-foreground">Design your custom workout split</p>
	</div>

	<!-- Progress indicator -->
	<div class="mb-8 flex items-center gap-2">
		{#each [1, 2, 3, 4] as step (step)}
			<div class="flex items-center gap-2">
				<div
					class="flex h-8 w-8 items-center justify-center rounded-full {currentStep >= step
						? 'bg-primary text-primary-foreground'
						: 'bg-muted text-muted-foreground'}"
				>
					{step}
				</div>
				{#if step < 4}
					<div class="h-1 w-12 {currentStep > step ? 'bg-primary' : 'bg-muted'}"></div>
				{/if}
			</div>
		{/each}
	</div>

	{#if error}
		<div class="mb-4 rounded-lg border border-destructive bg-destructive/10 p-4">
			<p class="text-sm text-destructive">{error}</p>
		</div>
	{/if}

	<!-- Step 1: Basic Info -->
	{#if currentStep === 1}
		<Card>
			<CardHeader>
				<CardTitle>Basic Information</CardTitle>
				<CardDescription>Enter the basic details of your workout split</CardDescription>
			</CardHeader>
			<CardContent class="space-y-4">
				<FieldGroup>
					<FieldRoot>
						<FieldLabel>Title *</FieldLabel>
						<Input bind:value={title} placeholder="e.g., PPL 6-Day Split" required />
					</FieldRoot>

					<FieldRoot>
						<FieldLabel>Description</FieldLabel>
						<textarea
							bind:value={description}
							class="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
							placeholder="Describe your split..."
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
						<FieldLabel>Duration (minutes)</FieldLabel>
						<Input type="number" bind:value={duration} placeholder="e.g., 60" min="1" max="300" />
						<FieldDescription>Estimated workout duration per session</FieldDescription>
					</FieldRoot>

					<FieldRoot>
						<FieldLabel>Tags</FieldLabel>
						<div class="flex flex-wrap gap-2">
							{#each WORKOUT_TAGS as tag (tag)}
								<button type="button" onclick={() => toggleTag(tag)}>
									<Badge
										class="cursor-pointer {selectedTags.includes(tag)
											? 'bg-primary text-primary-foreground'
											: 'bg-muted text-muted-foreground'}"
									>
										{tag}
									</Badge>
								</button>
							{/each}
						</div>
						<FieldDescription>Select tags that describe your split</FieldDescription>
					</FieldRoot>

					<FieldRoot>
						<FieldLabel>Image URL</FieldLabel>
						<Input bind:value={imageUrl} type="url" placeholder="https://..." />
						<FieldDescription>Optional cover image for your split</FieldDescription>
					</FieldRoot>

					<FieldRoot>
						<div class="flex items-center gap-2">
							<input type="checkbox" bind:checked={isPublic} id="isPublic" />
							<Label for="isPublic">Make this split public</Label>
						</div>
					</FieldRoot>
				</FieldGroup>

				<div class="flex justify-end">
					<Button onclick={nextStep} disabled={!title}>Next</Button>
				</div>
			</CardContent>
		</Card>
	{/if}

	<!-- Step 2: Add Days -->
	{#if currentStep === 2}
		<Card>
			<CardHeader>
				<CardTitle>Setup Days</CardTitle>
				<CardDescription>Add and configure the days in your split</CardDescription>
			</CardHeader>
			<CardContent class="space-y-4">
				{#if days.length === 0}
					<div class="rounded-lg border border-dashed p-8 text-center">
						<p class="text-muted-foreground">No days added yet</p>
						<Button onclick={addDay} class="mt-4">Add First Day</Button>
					</div>
				{:else}
					<div class="space-y-3">
						{#each days as day, index (day.dayNumber)}
							<div class="rounded-lg border p-4">
								<div class="flex items-center justify-between">
									<div class="flex-1">
										<Input bind:value={day.name} placeholder="Day name" class="mb-2 font-medium" />
										<div class="flex items-center gap-2">
											<input
												type="checkbox"
												checked={day.isRestDay}
												onchange={() => toggleRestDay(index)}
												id="rest-{index}"
											/>
											<Label for="rest-{index}" class="text-sm">Rest Day</Label>
											{#if !day.isRestDay}
												<Badge variant="secondary">{day.exercises.length} exercises</Badge>
											{/if}
										</div>
									</div>
									<Button variant="destructive" size="sm" onclick={() => removeDay(index)}>
										Remove
									</Button>
								</div>
							</div>
						{/each}
					</div>

					<Button onclick={addDay} variant="outline" class="w-full">Add Another Day</Button>
				{/if}

				<div class="flex justify-between">
					<Button variant="outline" onclick={prevStep}>Back</Button>
					<Button onclick={nextStep} disabled={days.length === 0}>Next</Button>
				</div>
			</CardContent>
		</Card>
	{/if}

	<!-- Step 3: Add Exercises to Days -->
	{#if currentStep === 3}
		<Card>
			<CardHeader>
				<CardTitle>Add Exercises</CardTitle>
				<CardDescription>Add exercises to each workout day</CardDescription>
			</CardHeader>
			<CardContent class="space-y-6">
				{#if exercises.length === 0}
					<div class="rounded-lg border border-dashed p-8 text-center">
						<p class="text-muted-foreground">You don't have any exercises yet</p>
						<p class="mt-2 text-sm text-muted-foreground">
							Create exercises first to add them to your split
						</p>
						<Button onclick={() => window.open('/exercises/new', '_blank')} class="mt-4">
							Create Exercise
						</Button>
					</div>
				{:else}
					{#each days as day, dayIndex (day.dayNumber)}
						{#if !day.isRestDay}
							<div class="rounded-lg border p-4">
								<h3 class="mb-3 font-semibold">{day.name}</h3>

								{#if day.exercises.length === 0}
									<p class="mb-3 text-sm text-muted-foreground">No exercises added yet</p>
								{:else}
									<div class="mb-3 space-y-2">
										{#each day.exercises as exercise, exIndex (exercise.order)}
											<div class="rounded border bg-muted/50 p-3">
												<div class="mb-2 flex items-center justify-between">
													<span class="font-medium">{getExerciseName(exercise.exerciseId)}</span>
													<Button
														variant="ghost"
														size="sm"
														onclick={() => removeExerciseFromDay(dayIndex, exIndex)}
													>
														Remove
													</Button>
												</div>
												<div class="grid grid-cols-3 gap-2">
													<div>
														<Label class="text-xs">Sets</Label>
														<Input
															type="number"
															bind:value={exercise.sets}
															min="1"
															max="20"
															class="h-8"
														/>
													</div>
													<div>
														<Label class="text-xs">Reps</Label>
														<Input bind:value={exercise.reps} class="h-8" placeholder="10" />
													</div>
													<div>
														<Label class="text-xs">Rest (sec)</Label>
														<Input
															type="number"
															bind:value={exercise.restTime}
															min="0"
															max="600"
															class="h-8"
														/>
													</div>
												</div>
												<div class="mt-2">
													<Label class="text-xs">Notes</Label>
													<Input
														bind:value={exercise.notes}
														placeholder="Optional notes..."
														class="h-8"
													/>
												</div>
											</div>
										{/each}
									</div>
								{/if}

								<div class="space-y-2">
									<Label class="text-sm">Add Exercise</Label>
									<select
										class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
										onchange={(e) => {
											const target = e.target as HTMLSelectElement;
											if (target.value) {
												addExerciseToDay(dayIndex, target.value);
												target.value = '';
											}
										}}
									>
										<option value="">Select an exercise...</option>
										{#each exercises as exercise (exercise.id)}
											<option value={exercise.id}>
												{exercise.name} ({exercise.muscleGroup})
											</option>
										{/each}
									</select>
								</div>
							</div>
						{/if}
					{/each}
				{/if}

				<div class="flex justify-between">
					<Button variant="outline" onclick={prevStep}>Back</Button>
					<Button onclick={nextStep}>Next</Button>
				</div>
			</CardContent>
		</Card>
	{/if}

	<!-- Step 4: Review & Submit -->
	{#if currentStep === 4}
		<Card>
			<CardHeader>
				<CardTitle>Review & Create</CardTitle>
				<CardDescription>Review your split before creating it</CardDescription>
			</CardHeader>
			<CardContent class="space-y-4">
				<div class="space-y-2">
					<div>
						<span class="font-semibold">Title:</span>
						{title}
					</div>
					{#if description}
						<div>
							<span class="font-semibold">Description:</span>
							{description}
						</div>
					{/if}
					<div>
						<span class="font-semibold">Difficulty:</span>
						<Badge>{difficulty}</Badge>
					</div>
					{#if duration}
						<div>
							<span class="font-semibold">Duration:</span>
							{duration} minutes
						</div>
					{/if}
					{#if selectedTags.length > 0}
						<div>
							<span class="font-semibold">Tags:</span>
							<div class="mt-1 flex flex-wrap gap-1">
								{#each selectedTags as tag (tag)}
									<Badge variant="secondary">{tag}</Badge>
								{/each}
							</div>
						</div>
					{/if}
				</div>

				<div class="border-t pt-4">
					<h3 class="mb-3 font-semibold">Days ({days.length})</h3>
					<div class="space-y-2">
						{#each days as day (day.dayNumber)}
							<div class="rounded border p-3">
								<div class="font-medium">{day.name}</div>
								{#if day.isRestDay}
									<Badge variant="secondary" class="mt-1">Rest Day</Badge>
								{:else}
									<div class="mt-1 text-sm text-muted-foreground">
										{day.exercises.length} exercise{day.exercises.length !== 1 ? 's' : ''}
									</div>
								{/if}
							</div>
						{/each}
					</div>
				</div>

				<div class="flex justify-between">
					<Button variant="outline" onclick={prevStep}>Back</Button>
					<Button onclick={handleSubmit} disabled={loading}>
						{loading ? 'Creating...' : 'Create Split'}
					</Button>
				</div>
			</CardContent>
		</Card>
	{/if}
</div>
