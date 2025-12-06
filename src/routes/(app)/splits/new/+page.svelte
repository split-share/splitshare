<script lang="ts">
	import { goto } from '$app/navigation';
	import { SvelteMap } from 'svelte/reactivity';
	import { Button } from '$lib/components/ui/button';
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Textarea } from '$lib/components/ui/textarea';
	import * as Select from '$lib/components/ui/select';
	import { DIFFICULTY_LEVELS } from '$lib/constants';
	import { Plus, Trash2 } from 'lucide-svelte';
	import * as Switch from '$lib/components/ui/switch';
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
		<div class="mb-6 rounded-lg border-destructive bg-destructive/10 p-4">
			<p class="text-sm text-destructive">{error}</p>
		</div>
	{/if}

	<form onsubmit={(e) => e.preventDefault()}>
		<!-- Split Details -->
		<Card class="mb-6 border-none shadow-none bg-card/50">
			<CardHeader>
				<CardTitle>Split Details</CardTitle>
			</CardHeader>
			<CardContent class="space-y-4">
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
						<Label for="difficulty">Difficulty</Label>
						<Select.Root
							type="single"
							value={difficulty}
							onValueChange={(v: string | undefined) => {
								if (v) difficulty = v as 'beginner' | 'intermediate' | 'advanced';
							}}
						>
							<Select.Trigger>
								<Select.Value placeholder="Select difficulty" />
							</Select.Trigger>
							<Select.Content>
								{#each DIFFICULTY_LEVELS as level (level)}
									<Select.Item value={level}>
										{level.charAt(0).toUpperCase() + level.slice(1)}
									</Select.Item>
								{/each}
							</Select.Content>
						</Select.Root>
					</div>

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
				</div>

				<div class="flex items-center justify-between rounded-lg border bg-card p-4">
					<div>
						<p class="font-medium">Public</p>
						<p class="text-sm text-muted-foreground">Share with community</p>
					</div>
					<Switch.Root bind:checked={isPublic} />
				</div>
			</CardContent>
		</Card>

		<!-- Workout Days -->
		<div class="mb-6">
			<div class="flex items-center justify-between mb-4">
				<h2 class="text-2xl font-bold">Workout Days</h2>
				<Button
					type="button"
					onclick={addDay}
					size="sm"
					class="bg-emerald-600 hover:bg-emerald-700"
				>
					<Plus class="h-4 w-4 mr-2" />
					Add Day
				</Button>
			</div>

			{#if days.length === 0}
				<Card class="border-dashed border-none shadow-none">
					<CardContent class="pt-6">
						<div class="text-center py-12">
							<p class="text-muted-foreground mb-4">No days added yet</p>
							<Button type="button" onclick={addDay} variant="outline">
								<Plus class="h-4 w-4 mr-2" />
								Add First Day
							</Button>
						</div>
					</CardContent>
				</Card>
			{:else}
				<div class="space-y-4">
					{#each days as day, dayIndex (day.dayNumber)}
						<Card class="border-none shadow-none bg-card/50">
							<CardContent class="pt-6">
								<div class="space-y-4">
									<!-- Day Header -->
									<div class="flex items-start gap-4">
										<div class="flex-1 grid gap-4 md:grid-cols-2">
											<div class="space-y-2">
												<Label for="day-{dayIndex}-name">Day Name *</Label>
												<Input
													id="day-{dayIndex}-name"
													bind:value={day.name}
													placeholder="e.g., Monday, Push Day"
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
											size="icon"
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
											class="h-4 w-4 rounded border-gray-300"
										/>
										<Label for="rest-{dayIndex}" class="cursor-pointer">Rest Day</Label>
									</div>

									<!-- Exercises List -->
									{#if !day.isRestDay}
										<div class="space-y-3">
											{#if day.exercises.length > 0}
												<div class="space-y-2">
													{#each day.exercises as exercise, exIndex (exercise.order)}
														<div
															class="flex items-start gap-3 rounded-lg bg-background/80 p-4 border-none"
														>
															<div
																class="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-medium shrink-0"
															>
																{exIndex + 1}
															</div>
															<div class="flex-1 space-y-3">
																<div class="font-medium">{exercise.exerciseName}</div>
																<div class="grid grid-cols-3 gap-3">
																	<div class="space-y-1">
																		<Label class="text-xs text-muted-foreground">Sets</Label>
																		<Input
																			type="number"
																			bind:value={exercise.sets}
																			min="1"
																			max="20"
																			class="h-9"
																		/>
																	</div>
																	<div class="space-y-1">
																		<Label class="text-xs text-muted-foreground">Reps</Label>
																		<Input
																			bind:value={exercise.reps}
																			placeholder="8-12"
																			class="h-9"
																		/>
																	</div>
																	<div class="space-y-1">
																		<Label class="text-xs text-muted-foreground">Notes</Label>
																		<Input
																			bind:value={exercise.notes}
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
																onclick={() => removeExerciseFromDay(dayIndex, exIndex)}
															>
																<Trash2 class="h-4 w-4" />
															</Button>
														</div>
													{/each}
												</div>
											{/if}

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
													class="flex-1"
												/>
												<Button
													type="button"
													onclick={() => addExerciseToDay(dayIndex)}
													size="sm"
													disabled={!newExerciseNames.get(dayIndex)?.trim()}
													class="bg-emerald-600 hover:bg-emerald-700"
												>
													<Plus class="h-4 w-4 mr-2" />
													Add Exercise
												</Button>
											</div>
										</div>
									{/if}
								</div>
							</CardContent>
						</Card>
					{/each}
				</div>
			{/if}
		</div>

		<!-- Actions -->
		<div class="flex justify-end gap-3">
			<Button type="button" variant="outline" href="/splits">Cancel</Button>
			<Button
				type="button"
				onclick={handleSubmit}
				disabled={loading || !title}
				class="bg-destructive hover:bg-destructive/90"
			>
				{loading ? 'Creating...' : 'Create Split'}
			</Button>
		</div>
	</form>
</div>
