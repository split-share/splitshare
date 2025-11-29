<script lang="ts">
	import { enhance } from '$app/forms';
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Separator } from '$lib/components/ui/separator';
	import { Plus, Trash2 } from 'lucide-svelte';

	let { data } = $props();

	let selectedSplitId = $state('');
	let selectedDayId = $state('');
	let duration = $state('');
	let notes = $state('');
	let exercises = $state<
		Array<{
			exerciseId: string;
			sets: string;
			reps: string;
			weight: string;
			notes: string;
		}>
	>([]);

	let selectedSplit = $derived(data.splits.find((s) => s.id === selectedSplitId));
	let availableDays = $derived(
		selectedSplit
			? data.splits
					.find((s) => s.id === selectedSplitId)
					?.days?.map((d: { id: string; name: string }) => ({ id: d.id, name: d.name })) || []
			: []
	);

	let loading = $state(false);

	async function loadDayExercises() {
		if (!selectedSplitId || !selectedDayId) return;

		const response = await fetch(`/api/splits/${selectedSplitId}/days/${selectedDayId}`);
		if (response.ok) {
			const dayData = await response.json();
			exercises = dayData.exercises.map(
				(e: { exercise: { id: string }; sets: number; reps: string }) => ({
					exerciseId: e.exercise.id,
					sets: e.sets.toString(),
					reps: e.reps,
					weight: '',
					notes: ''
				})
			);
		}
	}

	function addExercise() {
		exercises = [
			...exercises,
			{
				exerciseId: '',
				sets: '3',
				reps: '10',
				weight: '',
				notes: ''
			}
		];
	}

	function removeExercise(index: number) {
		exercises = exercises.filter((_, i) => i !== index);
	}

	function handleSubmit() {
		return async ({ update }: { update: () => Promise<void> }) => {
			loading = true;
			const payload = JSON.stringify({
				splitId: selectedSplitId,
				dayId: selectedDayId,
				duration,
				notes,
				exercises
			});

			const formData = new FormData();
			formData.append('payload', payload);

			await update();
			loading = false;
		};
	}
</script>

<div class="container mx-auto p-6 max-w-4xl">
	<div class="mb-6">
		<h1 class="text-3xl font-bold">Log Workout</h1>
		<p class="text-muted-foreground">Record your workout progress</p>
	</div>

	<form method="POST" action="?/log" use:enhance={handleSubmit}>
		<input type="hidden" name="payload" />

		<Card>
			<CardHeader>
				<CardTitle>Workout Details</CardTitle>
			</CardHeader>
			<CardContent class="space-y-4">
				<!-- Select Split -->
				<div class="space-y-2">
					<Label for="split">Select Split</Label>
					<select
						id="split"
						bind:value={selectedSplitId}
						onchange={() => {
							selectedDayId = '';
							exercises = [];
						}}
						class="w-full rounded-md border border-input bg-background px-3 py-2"
						required
					>
						<option value="">Choose a split...</option>
						{#each data.splits as split (split.id)}
							<option value={split.id}>{split.title}</option>
						{/each}
					</select>
				</div>

				<!-- Select Day -->
				{#if selectedSplitId}
					<div class="space-y-2">
						<Label for="day">Select Day</Label>
						<select
							id="day"
							bind:value={selectedDayId}
							onchange={loadDayExercises}
							class="w-full rounded-md border border-input bg-background px-3 py-2"
							required
						>
							<option value="">Choose a day...</option>
							{#each availableDays as day (day.id)}
								<option value={day.id}>{day.name}</option>
							{/each}
						</select>
					</div>
				{/if}

				<!-- Duration and Notes -->
				<div class="grid grid-cols-2 gap-4">
					<div class="space-y-2">
						<Label for="duration">Duration (minutes)</Label>
						<Input id="duration" type="number" bind:value={duration} placeholder="60" />
					</div>
				</div>

				<div class="space-y-2">
					<Label for="notes">Workout Notes</Label>
					<textarea
						id="notes"
						bind:value={notes}
						placeholder="How did the workout feel?"
						class="w-full rounded-md border border-input bg-background px-3 py-2 min-h-[80px]"
					></textarea>
				</div>
			</CardContent>
		</Card>

		<!-- Exercises -->
		{#if selectedDayId && exercises.length > 0}
			<Card class="mt-6">
				<CardHeader class="flex flex-row items-center justify-between">
					<CardTitle>Exercises</CardTitle>
					<Button type="button" variant="outline" size="sm" onclick={addExercise}>
						<Plus class="h-4 w-4 mr-2" />
						Add Exercise
					</Button>
				</CardHeader>
				<CardContent class="space-y-4">
					{#each exercises as exercise, index (index)}
						<div class="space-y-3 p-4 border rounded-lg">
							<div class="flex justify-between items-start">
								<p class="font-medium">Exercise {index + 1}</p>
								{#if exercises.length > 1}
									<Button
										type="button"
										variant="ghost"
										size="sm"
										onclick={() => removeExercise(index)}
									>
										<Trash2 class="h-4 w-4" />
									</Button>
								{/if}
							</div>

							<div class="grid grid-cols-3 gap-3">
								<div class="space-y-2">
									<Label>Sets</Label>
									<Input
										type="number"
										bind:value={exercise.sets}
										placeholder="3"
										min="1"
										required
									/>
								</div>

								<div class="space-y-2">
									<Label>Reps</Label>
									<Input bind:value={exercise.reps} placeholder="10" required />
								</div>

								<div class="space-y-2">
									<Label>Weight (kg)</Label>
									<Input type="number" bind:value={exercise.weight} placeholder="50" />
								</div>
							</div>

							<div class="space-y-2">
								<Label>Exercise Notes</Label>
								<Input bind:value={exercise.notes} placeholder="Form notes, adjustments..." />
							</div>
						</div>
					{/each}
				</CardContent>
			</Card>
		{/if}

		<Separator class="my-6" />

		<div class="flex justify-end gap-4">
			<Button type="button" variant="outline" href="/dashboard">Cancel</Button>
			<Button type="submit" disabled={loading || !selectedDayId || exercises.length === 0}>
				{loading ? 'Logging...' : 'Log Workout'}
			</Button>
		</div>
	</form>
</div>
