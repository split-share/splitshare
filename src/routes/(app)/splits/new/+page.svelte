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
	import ExerciseAutocomplete from '$lib/components/forms/exercise-autocomplete.svelte';
	import CreateExerciseModal from '$lib/components/modals/create-exercise-modal.svelte';
	import { DIFFICULTY_LEVELS, WORKOUT_TAGS, DAYS_OF_WEEK } from '$lib/constants';
	import type { PageData } from './$types';
	import type {
		CreateCompleteSplitInput,
		CreateSplitDayInput,
		AddExerciseToDayInput
	} from '$lib/schemas/split';
	import type { Exercise } from '$lib/services/exercises/types';

	let { data }: { data: PageData } = $props();

	// Form state using Svelte 5 runes
	let currentStep = $state(1);
	let loading = $state(false);
	let error = $state('');
	let showExerciseModal = $state(false);
	let currentDayIndex = $state(0); // Track which day we're editing exercises for

	// Split basic info
	let title = $state('');
	let description = $state('');
	let difficulty = $state<'beginner' | 'intermediate' | 'advanced'>('intermediate');
	let duration = $state<number | undefined>(undefined);
	let isPublic = $state(false);
	let selectedTags = $state<string[]>([]);
	let imageUrl = $state('');

	// Days state - using day names (Monday-Sunday)
	let days = $state<CreateSplitDayInput[]>([]);

	// Available exercises from server + newly created ones
	let availableExercises = $state<Exercise[]>(data.exercises);

	// Get available day names (not yet selected)
	const availableDayNames = $derived(
		DAYS_OF_WEEK.filter((day) => !days.some((d) => d.name === day))
	);

	/**
	 * Adds a new day to the split with the first available day name
	 */
	function addDay() {
		if (availableDayNames.length === 0) {
			error = 'All days have been added';
			return;
		}

		const newDay: CreateSplitDayInput = {
			dayNumber: days.length + 1,
			name: availableDayNames[0],
			isRestDay: false,
			exercises: []
		};
		days = [...days, newDay];
	}

	/**
	 * Removes a day from the split and renumbers remaining days
	 * @param {number} index - Index of the day to remove
	 */
	function removeDay(index: number) {
		days = days.filter((_, i) => i !== index);
		// Renumber remaining days
		days = days.map((day, i) => ({ ...day, dayNumber: i + 1 }));
	}

	/**
	 * Changes the day name for a specific day
	 * @param {number} index - Index of the day to change
	 * @param {string} newName - New day name (Monday-Sunday)
	 */
	function changeDayName(index: number, newName: (typeof DAYS_OF_WEEK)[number]) {
		days[index].name = newName;
	}

	/**
	 * Toggles whether a day is a rest day and clears exercises if set to rest
	 * @param {number} index - Index of the day to toggle
	 */
	function toggleRestDay(index: number) {
		days[index].isRestDay = !days[index].isRestDay;
		if (days[index].isRestDay) {
			days[index].exercises = [];
		}
	}

	/**
	 * Adds an exercise to a specific day with default values
	 * @param {number} dayIndex - Index of the day to add exercise to
	 * @param {Exercise} exercise - Exercise to add
	 */
	function addExerciseToDay(dayIndex: number, exercise: Exercise) {
		const exerciseData: AddExerciseToDayInput = {
			exerciseId: exercise.id,
			sets: 3,
			reps: '10',
			restTime: 60,
			order: days[dayIndex].exercises.length,
			notes: ''
		};
		days[dayIndex].exercises = [...days[dayIndex].exercises, exerciseData];
	}

	/**
	 * Removes an exercise from a day and renumbers remaining exercises
	 * @param {number} dayIndex - Index of the day
	 * @param {number} exerciseIndex - Index of the exercise to remove
	 */
	function removeExerciseFromDay(dayIndex: number, exerciseIndex: number) {
		days[dayIndex].exercises = days[dayIndex].exercises.filter((_, i) => i !== exerciseIndex);
		// Renumber remaining exercises
		days[dayIndex].exercises = days[dayIndex].exercises.map((ex, i) => ({ ...ex, order: i }));
	}

	/**
	 * Handles successful exercise creation from modal and adds to available list
	 * @param {Exercise} exercise - Newly created exercise
	 */
	function handleExerciseCreated(exercise: Exercise) {
		availableExercises = [...availableExercises, exercise];
	}

	/**
	 * Toggles selection of a tag
	 * @param {string} tag - Tag to toggle
	 */
	function toggleTag(tag: string) {
		if (selectedTags.includes(tag)) {
			selectedTags = selectedTags.filter((t) => t !== tag);
		} else {
			selectedTags = [...selectedTags, tag];
		}
	}

	// Get non-rest workout days for exercise editing
	const workoutDays = $derived(days.filter((day) => !day.isRestDay));

	/**
	 * Navigates to the next step in the form
	 */
	function nextStep() {
		if (currentStep < 4) {
			currentStep++;
			if (currentStep === 3) {
				currentDayIndex = 0; // Reset to first day when entering exercise step
			}
		}
	}

	/**
	 * Navigates to the previous step in the form
	 */
	function prevStep() {
		if (currentStep > 1) {
			currentStep--;
		}
	}

	/**
	 * Navigates to the next workout day in exercise selection
	 */
	function nextDay() {
		if (currentDayIndex < workoutDays.length - 1) {
			currentDayIndex++;
		}
	}

	/**
	 * Navigates to the previous workout day in exercise selection
	 */
	function prevDay() {
		if (currentDayIndex > 0) {
			currentDayIndex--;
		}
	}

	/**
	 * Submits the split creation form
	 */
	async function handleSubmit() {
		loading = true;
		error = '';

		try {
			// Validate that at least one non-rest day has exercises
			const workoutDays = days.filter((day) => !day.isRestDay);
			const daysWithExercises = workoutDays.filter((day) => day.exercises.length > 0);

			if (workoutDays.length > 0 && daysWithExercises.length === 0) {
				error = 'At least one workout day must have exercises';
				loading = false;
				return;
			}

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
				const result = await response.json();
				if (result.type === 'redirect') {
					goto(result.location);
				}
			} else {
				const result = await response.json();
				// Handle validation errors
				if (result.errors) {
					const errorMessages = Object.entries(result.errors)
						.map(
							([field, messages]) =>
								`${field}: ${Array.isArray(messages) ? messages.join(', ') : messages}`
						)
						.join('; ');
					error = errorMessages || result.error || 'Failed to create split';
				} else {
					error = result.error || 'Failed to create split';
				}
			}
		} catch (err) {
			error = 'An error occurred while creating the split';
			console.error(err);
		} finally {
			loading = false;
		}
	}

	/**
	 * Gets exercise name by ID from available exercises
	 * @param {string} exerciseId - Exercise ID to look up
	 * @returns {string} Exercise name or "Unknown Exercise" if not found
	 */
	function getExerciseName(exerciseId: string) {
		return availableExercises.find((ex) => ex.id === exerciseId)?.name || 'Unknown Exercise';
	}
</script>

<CreateExerciseModal bind:open={showExerciseModal} onSuccess={handleExerciseCreated} />

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
				<CardDescription>Select days of the week for your split (Monday - Sunday)</CardDescription>
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
								<div class="flex items-center justify-between gap-4">
									<div class="flex-1 space-y-2">
										<div class="flex items-center gap-2">
											<Label class="text-sm font-medium">Day</Label>
											<select
												bind:value={day.name}
												onchange={(e) => {
													const target = e.target as HTMLSelectElement;
													changeDayName(index, target.value as (typeof DAYS_OF_WEEK)[number]);
												}}
												class="flex h-9 rounded-md border border-input bg-background px-3 py-1 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
											>
												<option value={day.name}>{day.name}</option>
												{#each availableDayNames as dayName (dayName)}
													<option value={dayName}>{dayName}</option>
												{/each}
											</select>
										</div>
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

					{#if availableDayNames.length > 0}
						<Button onclick={addDay} variant="outline" class="w-full">Add Another Day</Button>
					{:else}
						<p class="text-sm text-muted-foreground text-center">All days have been added</p>
					{/if}
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
				<div class="flex items-center justify-between">
					<div>
						<CardTitle>Add Exercises</CardTitle>
						<CardDescription>Build your workout for each day</CardDescription>
					</div>
					<Button variant="outline" size="sm" onclick={() => (showExerciseModal = true)}>
						Create Exercise
					</Button>
				</div>
			</CardHeader>
			<CardContent class="space-y-6">
				{#if availableExercises.length === 0}
					<div class="rounded-lg border border-dashed p-8 text-center">
						<p class="text-muted-foreground">You don't have any exercises yet</p>
						<p class="mt-2 text-sm text-muted-foreground">
							Create exercises to add them to your split
						</p>
						<Button onclick={() => (showExerciseModal = true)} class="mt-4">
							Create First Exercise
						</Button>
					</div>
				{:else if workoutDays.length === 0}
					<div class="rounded-lg border border-dashed p-8 text-center">
						<p class="text-muted-foreground">No workout days configured</p>
						<p class="mt-2 text-sm text-muted-foreground">
							All your days are rest days. Go back to add workout days.
						</p>
					</div>
				{:else}
					<!-- Day Navigation -->
					<div class="flex items-center justify-between rounded-lg bg-muted p-4">
						<Button
							variant="ghost"
							size="sm"
							onclick={prevDay}
							disabled={currentDayIndex === 0}
							class="flex items-center gap-1"
						>
							← Previous
						</Button>
						<div class="text-center">
							<div class="text-lg font-semibold">
								{workoutDays[currentDayIndex].name}
							</div>
							<div class="text-sm text-muted-foreground">
								Day {currentDayIndex + 1} of {workoutDays.length}
								{#if workoutDays[currentDayIndex].exercises.length > 0}
									• {workoutDays[currentDayIndex].exercises.length} exercise{workoutDays[
										currentDayIndex
									].exercises.length !== 1
										? 's'
										: ''}
								{/if}
							</div>
						</div>
						<Button
							variant="ghost"
							size="sm"
							onclick={nextDay}
							disabled={currentDayIndex === workoutDays.length - 1}
							class="flex items-center gap-1"
						>
							Next →
						</Button>
					</div>

					<!-- Current Day Exercises -->
					{@const currentDay = workoutDays[currentDayIndex]}
					{@const dayIndexInAllDays = days.findIndex((d) => d.dayNumber === currentDay.dayNumber)}

					<div class="space-y-4">
						{#if currentDay.exercises.length === 0}
							<div class="rounded-lg border border-dashed p-8 text-center">
								<p class="text-muted-foreground">No exercises added yet</p>
								<p class="mt-1 text-sm text-muted-foreground">
									Search below to add exercises to this day
								</p>
							</div>
						{:else}
							<div class="space-y-3">
								{#each currentDay.exercises as exercise, exIndex (exercise.order)}
									<div class="rounded-lg border bg-card p-4">
										<div class="mb-3 flex items-start justify-between">
											<div class="flex items-start gap-3">
												<div
													class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-medium text-primary-foreground"
												>
													{exIndex + 1}
												</div>
												<div>
													<div class="font-semibold">{getExerciseName(exercise.exerciseId)}</div>
												</div>
											</div>
											<Button
												variant="ghost"
												size="sm"
												onclick={() => removeExerciseFromDay(dayIndexInAllDays, exIndex)}
											>
												Remove
											</Button>
										</div>

										<div class="grid gap-3 sm:grid-cols-3">
											<div>
												<Label class="text-xs">Sets</Label>
												<Input
													type="number"
													bind:value={exercise.sets}
													min="1"
													max="20"
													class="h-9"
												/>
											</div>
											<div>
												<Label class="text-xs">Reps</Label>
												<Input bind:value={exercise.reps} class="h-9" placeholder="10 or 8-12" />
											</div>
											<div>
												<Label class="text-xs">Rest (seconds)</Label>
												<Input
													type="number"
													bind:value={exercise.restTime}
													min="0"
													max="600"
													class="h-9"
												/>
											</div>
										</div>

										<div class="mt-3">
											<Label class="text-xs">Notes (optional)</Label>
											<Input
												bind:value={exercise.notes}
												placeholder="Add notes about form, tempo, etc..."
												class="h-9"
											/>
										</div>
									</div>
								{/each}
							</div>
						{/if}

						<!-- Add Exercise -->
						<div class="rounded-lg border-2 border-dashed p-4">
							<Label class="mb-2 block text-sm font-medium">Add Exercise to {currentDay.name}</Label
							>
							<ExerciseAutocomplete
								exercises={availableExercises}
								onSelect={(ex) => addExerciseToDay(dayIndexInAllDays, ex)}
								placeholder="Search exercises by name or muscle group..."
							/>
						</div>
					</div>
				{/if}

				<div class="flex justify-between border-t pt-4">
					<Button variant="outline" onclick={prevStep}>Back</Button>
					<Button onclick={nextStep}>Review & Create</Button>
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
