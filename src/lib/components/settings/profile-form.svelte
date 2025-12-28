<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import * as Field from '$lib/components/ui/field';
	import { updateProfileSchema, type UpdateProfileInput } from '$lib/schemas/profile';
	import { Check } from 'lucide-svelte';

	type Props = {
		initialName: string;
		onSubmit: (data: UpdateProfileInput) => Promise<{ success: boolean; error?: string }>;
	};

	let { initialName, onSubmit }: Props = $props();

	let name = $state(initialName);
	let loading = $state(false);
	let error = $state('');
	let success = $state(false);

	let validationErrors = $derived.by(() => {
		const result = updateProfileSchema.safeParse({ name });
		if (result.success) return null;
		return result.error.flatten().fieldErrors;
	});

	async function handleSubmit(e: SubmitEvent) {
		e.preventDefault();
		error = '';
		success = false;

		const result = updateProfileSchema.safeParse({ name });
		if (!result.success) {
			return;
		}

		loading = true;
		try {
			const response = await onSubmit(result.data);
			if (response.success) {
				success = true;
				setTimeout(() => {
					success = false;
				}, 3000);
			} else {
				error = response.error || 'Failed to update profile';
			}
		} catch {
			error = 'An unexpected error occurred';
		} finally {
			loading = false;
		}
	}
</script>

<form onsubmit={handleSubmit} class="space-y-6">
	{#if error}
		<div class="rounded-lg bg-destructive/10 p-3 text-sm text-destructive" role="alert">
			{error}
		</div>
	{/if}

	<Field.Group>
		<Field.Field>
			<Field.Label for="name">Display Name</Field.Label>
			<Input
				id="name"
				type="text"
				bind:value={name}
				placeholder="Your display name"
				aria-invalid={validationErrors?.name ? 'true' : undefined}
			/>
			{#if validationErrors?.name}
				<Field.Error errors={validationErrors.name.map((m) => ({ message: m }))} />
			{/if}
			<Field.Description>This is the name that will be displayed to other users.</Field.Description>
		</Field.Field>
	</Field.Group>

	<Button type="submit" disabled={loading || !!validationErrors}>
		{#if loading}
			Saving...
		{:else if success}
			<Check class="mr-2 h-4 w-4" />
			Saved
		{:else}
			Save Changes
		{/if}
	</Button>
</form>
