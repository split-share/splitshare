<script lang="ts">
	import {
		Dialog,
		DialogContent,
		DialogDescription,
		DialogHeader,
		DialogTitle
	} from '$lib/components/ui/dialog';
	import ExerciseForm from '$lib/components/forms/exercise-form.svelte';
	import type { CreateExerciseInput } from '$lib/schemas/exercise';
	import type { Exercise } from '$core/domain/exercise/exercise.entity';

	let {
		open = $bindable(false),
		onSuccess
	}: {
		open?: boolean;
		onSuccess: (exercise: Exercise) => void;
	} = $props();

	let loading = $state(false);

	async function handleSubmit(data: CreateExerciseInput) {
		loading = true;
		try {
			const formData = new FormData();
			formData.append('payload', JSON.stringify(data));

			const response = await fetch('/exercises/new?/create', {
				method: 'POST',
				body: formData,
				headers: {
					Accept: 'application/json'
				}
			});

			if (response.ok) {
				const result = await response.json();
				// The server action returns { success: true, exercise: Exercise }
				if (result.success && result.exercise) {
					onSuccess(result.exercise);
					open = false;
				} else {
					throw new Error('Failed to create exercise');
				}
			} else {
				const result = await response.json();
				throw new Error(result.error || 'Failed to create exercise');
			}
		} finally {
			loading = false;
		}
	}
</script>

<Dialog bind:open>
	<DialogContent class="max-w-2xl max-h-[90vh] overflow-y-auto">
		<DialogHeader>
			<DialogTitle>Create New Exercise</DialogTitle>
			<DialogDescription>Add a new exercise to your library</DialogDescription>
		</DialogHeader>

		<ExerciseForm {loading} onSubmit={handleSubmit} onCancel={() => (open = false)} />
	</DialogContent>
</Dialog>
