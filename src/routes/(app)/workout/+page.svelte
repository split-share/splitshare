<script lang="ts">
	import { enhance } from '$app/forms';
	import { invalidateAll } from '$app/navigation';
	import { Button } from '$lib/components/ui/button';
	import {
		Card,
		CardContent,
		CardDescription,
		CardHeader,
		CardTitle
	} from '$lib/components/ui/card';
	import * as Select from '$lib/components/ui/select';
	import { Textarea } from '$lib/components/ui/textarea';
	import { Label } from '$lib/components/ui/label';
	import Badge from '$lib/components/ui/badge.svelte';
	import WorkoutTimer from '$lib/components/workout/workout-timer.svelte';
	import WorkoutProgress from '$lib/components/workout/workout-progress.svelte';
	import ExerciseCard from '$lib/components/workout/exercise-card.svelte';
	import RestOverlay from '$lib/components/workout/rest-overlay.svelte';
	import GroupProgress from '$lib/components/workout/group-progress.svelte';
	import ConfirmDialog from '$lib/components/confirm-dialog.svelte';
	import { Play, Pause, X, Check, Dumbbell, AlertCircle } from 'lucide-svelte';
	import { hapticImpact, hapticNotification } from '$lib/utils/mobile';
	import type { PageData, ActionData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	// State - these need to be mutable for user interaction
	// eslint-disable-next-line svelte/prefer-writable-derived -- Bound to Select component
	let selectedSplitId = $state('');
	// eslint-disable-next-line svelte/prefer-writable-derived -- Bound to Select component
	let selectedDayId = $state('');
	// eslint-disable-next-line svelte/prefer-writable-derived -- Toggled by user actions
	let isPaused = $state(false);
	let isSubmitting = $state(false);
	let abandonForm = $state<HTMLFormElement>();
	let workoutNotes = $state('');
	let showCompleteModal = $state(false);
	let fetchError = $state<string | null>(null);
	// eslint-disable-next-line svelte/prefer-writable-derived -- Updated by timer callback
	let timerSeconds = $state(0);

	const FETCH_TIMEOUT_MS = 10_000;

	// Sync state with data when it changes
	$effect(() => {
		selectedSplitId = data.preselectedSplitId || '';
	});

	$effect(() => {
		selectedDayId = data.preselectedDayId || '';
	});

	$effect(() => {
		isPaused = data.activeSession?.session.pausedAt !== null;
	});

	$effect(() => {
		timerSeconds = data.activeSession?.session.exerciseElapsedSeconds || 0;
	});

	// Derived
	let selectedSplit = $derived(data.splits.find((s) => s.id === selectedSplitId));
	let hasActiveSession = $derived(!!data.activeSession);
	let session = $derived(data.activeSession?.session);
	let exercises = $derived(data.activeSession?.exercises || []);
	let currentExercise = $derived(session ? exercises[session.currentExerciseIndex] : null);
	let completedSetsForCurrentExercise = $derived(
		session
			? session.completedSets.filter((s) => s.exerciseIndex === session.currentExerciseIndex)
			: []
	);
	let showRestOverlay = $derived(session?.phase === 'rest');
	let isWorkoutComplete = $derived(session?.phase === 'completed');
	let nextExerciseName = $derived(() => {
		if (!session || !exercises.length) return undefined;
		const isLastSet = session.currentSetIndex >= (currentExercise?.sets || 0) - 1;
		if (isLastSet && session.currentExerciseIndex < exercises.length - 1) {
			return exercises[session.currentExerciseIndex + 1]?.exerciseName;
		}
		return currentExercise?.exerciseName;
	});

	// Group-related derived state
	let currentGroupInfo = $derived.by(() => {
		if (!currentExercise?.groupId) return null;

		const groupExercises = exercises.filter((ex) => ex.groupId === currentExercise.groupId);
		const currentIndexInGroup = groupExercises.findIndex((ex) => ex.id === currentExercise.id);

		return {
			groupType: currentExercise.groupType as 'superset' | 'triset',
			currentIndex: currentIndexInGroup,
			totalInGroup: groupExercises.length,
			exerciseNames: groupExercises.map((ex) => ex.exerciseName)
		};
	});

	async function fetchWithTimeout(url: string, init: globalThis.RequestInit): Promise<Response> {
		const controller = new AbortController();
		const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
		try {
			const response = await fetch(url, { ...init, signal: controller.signal });
			clearTimeout(timeoutId);
			return response;
		} catch (err) {
			clearTimeout(timeoutId);
			throw err;
		}
	}

	// Sync timer values periodically
	$effect(() => {
		if (!session || isPaused) return;

		const syncInterval = setInterval(async () => {
			try {
				const formData = new FormData();
				formData.append('sessionId', session.id);
				formData.append('exerciseElapsedSeconds', String(timerSeconds));
				const response = await fetchWithTimeout('?/sync', {
					method: 'POST',
					body: formData
				});
				if (!response.ok) {
					console.error('Workout sync failed:', response.status);
				}
			} catch (err) {
				if (err instanceof DOMException && err.name === 'AbortError') {
					console.error('Workout sync timed out');
				} else {
					console.error('Workout sync error:', err);
				}
			}
		}, 10000);

		return () => clearInterval(syncInterval);
	});

	// Show complete modal when workout is done
	$effect(() => {
		if (isWorkoutComplete) {
			showCompleteModal = true;
			hapticNotification('success');
		}
	});

	function handleTimerTick(seconds: number) {
		timerSeconds = seconds;
	}

	function getFetchErrorMessage(err: unknown): string {
		if (err instanceof DOMException && err.name === 'AbortError') {
			return 'Request timed out. Please try again.';
		}
		return 'Network error. Please check your connection.';
	}

	async function handleRestComplete() {
		try {
			fetchError = null;
			const formData = new FormData();
			formData.append('sessionId', session!.id);
			const response = await fetchWithTimeout('?/skipRest', {
				method: 'POST',
				body: formData
			});
			if (!response.ok) {
				fetchError = 'Failed to complete rest period. Please try again.';
				return;
			}
			hapticImpact('medium');
			await invalidateAll();
		} catch (err) {
			fetchError = getFetchErrorMessage(err);
		}
	}

	async function handleSkipRest() {
		try {
			fetchError = null;
			const formData = new FormData();
			formData.append('sessionId', session!.id);
			const response = await fetchWithTimeout('?/skipRest', {
				method: 'POST',
				body: formData
			});
			if (!response.ok) {
				fetchError = 'Failed to skip rest. Please try again.';
				return;
			}
			await invalidateAll();
		} catch (err) {
			fetchError = getFetchErrorMessage(err);
		}
	}

	async function handleCompleteSet(weight: number | null, reps: number, notes: string | null) {
		isSubmitting = true;
		fetchError = null;
		try {
			const formData = new FormData();
			formData.append('sessionId', session!.id);
			if (weight !== null) formData.append('weight', String(weight));
			formData.append('reps', String(reps));
			if (notes) formData.append('notes', notes);

			const response = await fetchWithTimeout('?/completeSet', {
				method: 'POST',
				body: formData
			});

			if (!response.ok) {
				fetchError = 'Failed to save set. Please try again.';
				return;
			}

			hapticImpact('light');
			timerSeconds = 0;
			await invalidateAll();
		} catch (err) {
			fetchError = getFetchErrorMessage(err);
		} finally {
			isSubmitting = false;
		}
	}
</script>

<div class="container mx-auto px-4 py-4 sm:py-8 max-w-2xl">
	{#if form?.error || fetchError}
		<div
			class="mb-6 p-4 bg-destructive/10 border border-destructive rounded-lg flex items-center gap-3"
		>
			<AlertCircle class="h-5 w-5 text-destructive" />
			<p class="text-destructive">{form?.error || fetchError}</p>
		</div>
	{/if}

	{#if !hasActiveSession}
		<!-- Selection View -->
		<div class="space-y-6">
			<div class="text-center space-y-2">
				<Dumbbell class="h-12 w-12 mx-auto text-primary" />
				<h1 class="text-3xl font-bold">Start Workout</h1>
				<p class="text-muted-foreground">Select a split and day to begin your workout</p>
			</div>

			<Card>
				<CardHeader>
					<CardTitle>Choose Your Workout</CardTitle>
					<CardDescription>Select from your saved splits</CardDescription>
				</CardHeader>
				<CardContent>
					<form method="POST" action="?/start" use:enhance class="space-y-6">
						<div class="space-y-2">
							<Label>Split</Label>
							<Select.Root
								type="single"
								name="splitId"
								bind:value={selectedSplitId}
								onValueChange={() => (selectedDayId = '')}
							>
								<Select.Trigger class="w-full">
									{selectedSplit?.title || 'Select a split...'}
								</Select.Trigger>
								<Select.Content>
									{#each data.splits as split (split.id)}
										<Select.Item value={split.id}>{split.title}</Select.Item>
									{/each}
								</Select.Content>
							</Select.Root>
							<input type="hidden" name="splitId" value={selectedSplitId} />
						</div>

						{#if selectedSplit && selectedSplit.days.length > 0}
							<div class="space-y-2">
								<Label>Day</Label>
								<Select.Root type="single" name="dayId" bind:value={selectedDayId}>
									<Select.Trigger class="w-full">
										{selectedSplit.days.find((d) => d.id === selectedDayId)?.name ||
											'Select a day...'}
									</Select.Trigger>
									<Select.Content>
										{#each selectedSplit.days as day (day.id)}
											<Select.Item value={day.id}>
												Day {day.dayNumber}: {day.name} ({day.exerciseCount} exercises)
											</Select.Item>
										{/each}
									</Select.Content>
								</Select.Root>
								<input type="hidden" name="dayId" value={selectedDayId} />
							</div>
						{:else if selectedSplit}
							<p class="text-sm text-muted-foreground">
								This split has no workout days with exercises.
							</p>
						{/if}

						<Button
							type="submit"
							size="lg"
							class="w-full"
							disabled={!selectedSplitId || !selectedDayId}
						>
							<Play class="h-5 w-5 mr-2" />
							Start Workout
						</Button>
					</form>
				</CardContent>
			</Card>

			{#if data.splits.length === 0}
				<Card>
					<CardContent class="pt-6 text-center">
						<p class="text-muted-foreground mb-4">You don't have any splits yet.</p>
						<Button href="/splits/new">Create Your First Split</Button>
					</CardContent>
				</Card>
			{/if}
		</div>
	{:else if showCompleteModal}
		<!-- Workout Complete Modal -->
		<div class="space-y-6">
			<div class="text-center space-y-2">
				<div class="h-16 w-16 mx-auto bg-green-500 rounded-full flex items-center justify-center">
					<Check class="h-8 w-8 text-white" />
				</div>
				<h1 class="text-3xl font-bold">Workout Complete!</h1>
				<p class="text-muted-foreground">Great job! Save your workout to track your progress.</p>
			</div>

			<Card>
				<CardContent class="pt-6">
					<form method="POST" action="?/complete" use:enhance class="space-y-4">
						<input type="hidden" name="sessionId" value={session?.id} />
						<div class="space-y-2">
							<Label for="workoutNotes">Workout Notes (optional)</Label>
							<Textarea
								id="workoutNotes"
								name="notes"
								bind:value={workoutNotes}
								placeholder="How was your workout? Any notes for next time?"
								rows={3}
							/>
						</div>
						<div class="text-sm text-muted-foreground space-y-1">
							<p>
								<strong>Duration:</strong>
								{Math.round((Date.now() - new Date(session!.startedAt).getTime()) / 60000)} minutes
							</p>
							<p><strong>Sets completed:</strong> {session?.completedSets.length}</p>
						</div>
						<Button type="submit" size="lg" class="w-full">
							<Check class="h-5 w-5 mr-2" />
							Save Workout
						</Button>
					</form>
				</CardContent>
			</Card>
		</div>
	{:else}
		<!-- Active Workout View -->
		<div class="space-y-4 sm:space-y-6">
			<!-- Header -->
			<div class="flex items-start justify-between gap-2">
				<div class="min-w-0 flex-1">
					<h1 class="text-xl sm:text-2xl font-bold truncate">{data.activeSession?.split.title}</h1>
					<p class="text-sm sm:text-base text-muted-foreground">{data.activeSession?.day.name}</p>
				</div>
				<ConfirmDialog
					title="Abandon workout?"
					description="This will discard your current session and all completed sets. This cannot be undone."
					confirmLabel="Abandon"
					onConfirm={() => abandonForm?.requestSubmit()}
				>
					{#snippet trigger()}
						<Button variant="ghost" size="icon" class="h-10 w-10 flex-shrink-0">
							<X class="h-5 w-5" />
						</Button>
					{/snippet}
				</ConfirmDialog>
				<form bind:this={abandonForm} method="POST" action="?/abandon" use:enhance class="hidden">
					<input type="hidden" name="sessionId" value={session?.id} />
				</form>
			</div>

			<!-- Progress -->
			{#if currentExercise}
				<WorkoutProgress
					currentExerciseIndex={session!.currentExerciseIndex}
					totalExercises={exercises.length}
					currentSetIndex={session!.currentSetIndex}
					totalSets={currentExercise.sets}
				/>
			{/if}

			<!-- Group Progress (for supersets/trisets) -->
			{#if currentGroupInfo}
				<GroupProgress
					groupType={currentGroupInfo.groupType}
					currentIndex={currentGroupInfo.currentIndex}
					totalInGroup={currentGroupInfo.totalInGroup}
					exerciseNames={currentGroupInfo.exerciseNames}
				/>
			{/if}

			<!-- Timer -->
			<Card>
				<CardContent class="py-4 sm:py-6">
					<div class="flex items-center justify-between gap-4">
						<WorkoutTimer
							mode="count-up"
							initialSeconds={session!.exerciseElapsedSeconds}
							targetSeconds={currentExercise?.restTime || undefined}
							{isPaused}
							onTick={handleTimerTick}
						/>
						<div class="flex gap-2">
							{#if isPaused}
								<form
									method="POST"
									action="?/resume"
									use:enhance={() => {
										return async ({ update }) => {
											isPaused = false;
											await update();
										};
									}}
								>
									<input type="hidden" name="sessionId" value={session?.id} />
									<Button
										type="submit"
										size="icon"
										variant="outline"
										class="h-11 w-11 sm:h-10 sm:w-10"
									>
										<Play class="h-5 w-5" />
									</Button>
								</form>
							{:else}
								<form
									method="POST"
									action="?/pause"
									use:enhance={() => {
										return async ({ update }) => {
											isPaused = true;
											await update();
										};
									}}
								>
									<input type="hidden" name="sessionId" value={session?.id} />
									<input type="hidden" name="exerciseElapsedSeconds" value={timerSeconds} />
									<Button
										type="submit"
										size="icon"
										variant="outline"
										class="h-11 w-11 sm:h-10 sm:w-10"
									>
										<Pause class="h-5 w-5" />
									</Button>
								</form>
							{/if}
						</div>
					</div>
				</CardContent>
			</Card>

			<!-- Current Exercise -->
			{#if currentExercise}
				<ExerciseCard
					exercise={currentExercise}
					currentSet={session!.currentSetIndex}
					totalSets={currentExercise.sets}
					completedSetsForExercise={completedSetsForCurrentExercise}
					suggestedWeight={currentExercise.weight}
					onCompleteSet={handleCompleteSet}
					{isSubmitting}
					progressionSuggestion={currentExercise.exerciseId
						? data.progressionSuggestions[currentExercise.exerciseId]
						: undefined}
				/>
			{/if}

			<!-- Upcoming exercises -->
			{#if exercises.length > session!.currentExerciseIndex + 1}
				<div class="space-y-2">
					<h3 class="text-sm font-medium text-muted-foreground">Up Next</h3>
					<div class="space-y-2">
						{#each exercises.slice(session!.currentExerciseIndex + 1, session!.currentExerciseIndex + 3) as exercise, idx (exercise.id)}
							<div class="flex items-center gap-2 sm:gap-3 p-3 bg-muted/50 rounded-lg">
								<Badge variant="outline" class="flex-shrink-0"
									>{session!.currentExerciseIndex + 2 + idx}</Badge
								>
								<span class="font-medium text-sm sm:text-base truncate flex-1"
									>{exercise.exerciseName}</span
								>
								<span class="text-xs sm:text-sm text-muted-foreground flex-shrink-0">
									{exercise.sets}×{exercise.reps}
								</span>
							</div>
						{/each}
					</div>
				</div>
			{/if}
		</div>

		<!-- Rest Overlay -->
		{#if showRestOverlay && session?.restRemainingSeconds}
			<RestOverlay
				restSeconds={session.restRemainingSeconds}
				onSkip={handleSkipRest}
				onComplete={handleRestComplete}
				nextExerciseName={nextExerciseName()}
			/>
		{/if}
	{/if}
</div>
