<script lang="ts">
	import { goto } from '$app/navigation';
	import { SvelteMap } from 'svelte/reactivity';
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
	import { Textarea } from '$lib/components/ui/textarea';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import Badge from '$lib/components/ui/badge.svelte';
	import { DIFFICULTY_LEVELS, WORKOUT_TAGS } from '$lib/constants';
	import { Plus, Trash2 } from 'lucide-svelte';
	import type {
		CreateCompleteSplitInput,
		CreateSplitDayInput,
		AddExerciseToDayInput
	} from '$lib/schemas/split';

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
	let videoUrl = $state('');

	// Days state
	let days = $state<CreateSplitDayInput[]>([]);

	// Exercise name inputs for each day
	let newExerciseNames = new SvelteMap<number, string>();

	function addDay() {
		const dayNumber = days.length + 1;
		const newDay: CreateSplitDayInput = {
			dayNumber,
			name: `Day ${dayNumber}`,
			isRestDay: false,
			exercises: []
		};
		days = [...days, newDay];
	}

	function removeDay(index: number) {
		days = days.filter((_, i) => i !== index);
		days = days.map((day, i) => ({
			...day,
			dayNumber: i + 1,
			name: day.name.startsWith('Day ') ? `Day ${i + 1}` : day.name
		}));
	}

	function toggleRestDay(index: number) {
		days[index].isRestDay = !days[index].isRestDay;
		if (days[index].isRestDay) {
			days[index].exercises = [];
		}
	}

	function addExerciseToDay(dayIndex: number) {
		const exerciseName = newExerciseNames.get(dayIndex)?.trim();
		if (!exerciseName) return;

		const exerciseData: AddExerciseToDayInput = {
			exerciseName: exerciseName,
			sets: 3,
			reps: '8-12',
			restTime: 60,
			order: days[dayIndex].exercises.length,
			notes: ''
		};
		days[dayIndex].exercises = [...days[dayIndex].exercises, exerciseData];

		// Clear the input
		newExerciseNames.set(dayIndex, '');
	}

	function removeExerciseFromDay(dayIndex: number, exerciseIndex: number) {
		days[dayIndex].exercises = days[dayIndex].exercises.filter((_, i) => i !== exerciseIndex);
		days[dayIndex].exercises = days[dayIndex].exercises.map((ex, i) => ({ ...ex, order: i }));
	}

	function toggleTag(tag: string) {
		if (selectedTags.includes(tag)) {
			selectedTags = selectedTags.filter((t) => t !== tag);
		} else {
			selectedTags = [...selectedTags, tag];
		}
	}

	async function handleSubmit() {
		loading = true;
		error = '';

		try {
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
				videoUrl: videoUrl || undefined,
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
</script>

<div class="container mx-auto px-4 py-8 max-w-5xl">
	<div class="mb-8">
		<h1 class="text-3xl font-bold">Create New Split</h1>
		<p class="mt-2 text-muted-foreground">
			Build your workout routine and share it with the community
		</p>
	</div>

	{#if error}
		<div class="mb-6 rounded-lg border border-destructive bg-destructive/10 p-4">
			<p class="text-sm text-destructive">{error}</p>
		</div>
	{/if}

	<form onsubmit={(e) => e.preventDefault()}>
		<!-- Split Details -->
		<Card class="mb-6">
			<CardHeader>
				<CardTitle>Split Details</CardTitle>
			</CardHeader>
			<CardContent class="space-y-4">
				<div class="grid gap-4 md:grid-cols-2">
					<div class="space-y-2">
						<Label for="title">Title *</Label>
						<Input
							id="title"
							bind:value={title}
							placeholder="e.g., Push Pull Legs, Upper Lower, Bro Split"
							required
						/>
					</div>

					<div class="space-y-2">
						<Label for="difficulty">Difficulty</Label>
						<DropdownMenu.Root>
							<DropdownMenu.Trigger>
								{#snippet child({ props })}
									<Button {...props} variant="outline" class="w-full justify-between">
										{difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
										<svg
											xmlns="http://www.w3.org/2000/svg"
											width="16"
											height="16"
											viewBox="0 0 24 24"
											fill="none"
											stroke="currentColor"
											stroke-width="2"
											stroke-linecap="round"
											stroke-linejoin="round"
											class="ml-2 h-4 w-4"
										>
											<path d="m6 9 6 6 6-6" />
										</svg>
									</Button>
								{/snippet}
							</DropdownMenu.Trigger>
							<DropdownMenu.Content>
								{#each DIFFICULTY_LEVELS as level (level)}
									<DropdownMenu.Item onclick={() => (difficulty = level)}>
										{level.charAt(0).toUpperCase() + level.slice(1)}
									</DropdownMenu.Item>
								{/each}
							</DropdownMenu.Content>
						</DropdownMenu.Root>
					</div>
				</div>

				<div class="space-y-2">
					<Label for="description">Description</Label>
					<Textarea
						id="description"
						bind:value={description}
						placeholder="Describe your split, who it's for, and what results to expect..."
						class="min-h-[80px]"
					/>
				</div>

				<div class="grid gap-4 md:grid-cols-2">
					<div class="space-y-2">
						<Label for="duration">Duration (minutes)</Label>
						<Input
							id="duration"
							type="number"
							bind:value={duration}
							placeholder="e.g., 60"
							min="1"
							max="300"
						/>
					</div>

					<div class="flex items-end">
						<div class="flex items-center gap-2 h-10">
							<input type="checkbox" bind:checked={isPublic} id="isPublic" class="h-4 w-4" />
							<Label for="isPublic" class="cursor-pointer">
								Public
								<span class="text-sm text-muted-foreground ml-1">Share with community</span>
							</Label>
						</div>
					</div>
				</div>

				<div class="space-y-2">
					<Label>Tags</Label>
					<div class="flex flex-wrap gap-2">
						{#each WORKOUT_TAGS as tag (tag)}
							<button type="button" onclick={() => toggleTag(tag)}>
								<Badge
									variant={selectedTags.includes(tag) ? 'default' : 'outline'}
									class="cursor-pointer"
								>
									{tag}
								</Badge>
							</button>
						{/each}
					</div>
				</div>

				<div class="grid gap-4 md:grid-cols-2">
					<div class="space-y-2">
						<Label for="imageUrl">Image URL (Optional)</Label>
						<Input id="imageUrl" bind:value={imageUrl} type="url" placeholder="https://..." />
					</div>

					<div class="space-y-2">
						<Label for="videoUrl">Video URL (Optional)</Label>
						<Input
							id="videoUrl"
							bind:value={videoUrl}
							type="url"
							placeholder="https://www.youtube.com/watch?v=..."
						/>
					</div>
				</div>
			</CardContent>
		</Card>

		<!-- Workout Days -->
		<Card class="mb-6">
			<CardHeader>
				<div class="flex items-center justify-between">
					<div>
						<CardTitle>Workout Days</CardTitle>
						<CardDescription>Add workout days to your split</CardDescription>
					</div>
					<Button type="button" onclick={addDay} size="sm">
						<Plus class="h-4 w-4 mr-2" />
						Add Day
					</Button>
				</div>
			</CardHeader>
			<CardContent>
				{#if days.length === 0}
					<div class="rounded-lg border border-dashed p-12 text-center">
						<p class="text-muted-foreground mb-4">No days added yet</p>
						<Button type="button" onclick={addDay} variant="outline">
							<Plus class="h-4 w-4 mr-2" />
							Add First Day
						</Button>
					</div>
				{:else}
					<div class="space-y-4">
						{#each days as day, dayIndex (day.dayNumber)}
							<div class="rounded-lg border p-4">
								<div class="space-y-4">
									<!-- Day Header -->
									<div class="flex items-start gap-4">
										<div class="flex-1 grid gap-4 md:grid-cols-2">
											<div class="space-y-2">
												<Label for="day-{dayIndex}-name">Day Name *</Label>
												<Input
													id="day-{dayIndex}-name"
													bind:value={day.name}
													placeholder="e.g., Push Day, Monday, Upper Body"
												/>
											</div>
											<div class="space-y-2">
												<Label for="day-{dayIndex}-target">Focus/Target</Label>
												<Input
													id="day-{dayIndex}-target"
													placeholder="e.g., Chest, Back, Legs"
													disabled={day.isRestDay}
												/>
											</div>
										</div>
										<Button
											type="button"
											variant="ghost"
											size="sm"
											onclick={() => removeDay(dayIndex)}
											class="mt-8"
										>
											<Trash2 class="h-4 w-4" />
										</Button>
									</div>

									<!-- Rest Day Toggle -->
									<div class="flex items-center gap-2">
										<input
											type="checkbox"
											checked={day.isRestDay}
											onchange={() => toggleRestDay(dayIndex)}
											id="rest-{dayIndex}"
											class="h-4 w-4"
										/>
										<Label for="rest-{dayIndex}" class="cursor-pointer">Rest Day</Label>
									</div>

									<!-- Exercises List -->
									{#if !day.isRestDay}
										<div class="space-y-3">
											{#if day.exercises.length > 0}
												<div class="space-y-2">
													{#each day.exercises as exercise, exIndex (exercise.order)}
														<div class="flex items-center gap-3 rounded-lg border p-3 bg-muted/30">
															<div
																class="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-medium"
															>
																{exIndex + 1}
															</div>
															<div class="flex-1 grid grid-cols-[2fr,1fr,1fr,2fr] gap-3">
																<div class="font-medium text-sm">
																	{exercise.exerciseName}
																</div>
																<Input
																	type="number"
																	bind:value={exercise.sets}
																	placeholder="Sets"
																	min="1"
																	max="20"
																	class="h-8 text-sm"
																/>
																<Input
																	bind:value={exercise.reps}
																	placeholder="Reps"
																	class="h-8 text-sm"
																/>
																<Input
																	bind:value={exercise.notes}
																	placeholder="Notes"
																	class="h-8 text-sm"
																/>
															</div>
															<Button
																type="button"
																variant="ghost"
																size="sm"
																onclick={() => removeExerciseFromDay(dayIndex, exIndex)}
															>
																<Trash2 class="h-4 w-4" />
															</Button>
														</div>
													{/each}
												</div>
											{/if}

											<div class="pt-2">
												<div class="flex gap-2">
													<Input
														value={newExerciseNames.get(dayIndex) || ''}
														oninput={(e) => {
															newExerciseNames.set(dayIndex, e.currentTarget.value);
														}}
														placeholder="Exercise name (e.g., Bench Press, Squats)..."
														onkeydown={(e) => {
															if (e.key === 'Enter') {
																e.preventDefault();
																addExerciseToDay(dayIndex);
															}
														}}
													/>
													<Button
														type="button"
														onclick={() => addExerciseToDay(dayIndex)}
														size="sm"
														disabled={!newExerciseNames.get(dayIndex)?.trim()}
													>
														<Plus class="h-4 w-4" />
													</Button>
												</div>
											</div>
										</div>
									{/if}
								</div>
							</div>
						{/each}
					</div>
				{/if}
			</CardContent>
		</Card>

		<!-- Actions -->
		<div class="flex justify-end gap-3">
			<Button type="button" variant="outline" href="/splits">Cancel</Button>
			<Button type="button" onclick={handleSubmit} disabled={loading || !title}>
				{loading ? 'Creating...' : 'Create Split'}
			</Button>
		</div>
	</form>
</div>
