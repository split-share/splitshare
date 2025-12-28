<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import * as Field from '$lib/components/ui/field';
	import { changePasswordSchema, type ChangePasswordInput } from '$lib/schemas/password';
	import { Check } from 'lucide-svelte';

	type Props = {
		onSubmit: (data: ChangePasswordInput) => Promise<{ success: boolean; error?: string }>;
	};

	let { onSubmit }: Props = $props();

	let currentPassword = $state('');
	let newPassword = $state('');
	let confirmPassword = $state('');
	let loading = $state(false);
	let error = $state('');
	let success = $state(false);

	let validationErrors = $derived.by(() => {
		const result = changePasswordSchema.safeParse({
			currentPassword,
			newPassword,
			confirmPassword
		});
		if (result.success) return null;
		return result.error.flatten().fieldErrors;
	});

	function getPasswordStrength(password: string): { level: number; label: string } {
		if (password.length === 0) return { level: 0, label: '' };
		let score = 0;
		if (password.length >= 8) score++;
		if (password.length >= 12) score++;
		if (/[A-Z]/.test(password)) score++;
		if (/[a-z]/.test(password)) score++;
		if (/[0-9]/.test(password)) score++;
		if (/[^A-Za-z0-9]/.test(password)) score++;

		if (score <= 2) return { level: 1, label: 'Weak' };
		if (score <= 4) return { level: 2, label: 'Medium' };
		return { level: 3, label: 'Strong' };
	}

	let passwordStrength = $derived(getPasswordStrength(newPassword));

	async function handleSubmit(e: SubmitEvent) {
		e.preventDefault();
		error = '';
		success = false;

		const result = changePasswordSchema.safeParse({
			currentPassword,
			newPassword,
			confirmPassword
		});

		if (!result.success) {
			return;
		}

		loading = true;
		try {
			const response = await onSubmit(result.data);
			if (response.success) {
				success = true;
				currentPassword = '';
				newPassword = '';
				confirmPassword = '';
				setTimeout(() => {
					success = false;
				}, 3000);
			} else {
				error = response.error || 'Failed to change password';
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

	{#if success}
		<div class="rounded-lg bg-green-500/10 p-3 text-sm text-green-600" role="status">
			Password changed successfully.
		</div>
	{/if}

	<Field.Group>
		<Field.Field>
			<Field.Label for="currentPassword">Current Password</Field.Label>
			<Input
				id="currentPassword"
				type="password"
				bind:value={currentPassword}
				placeholder="Enter your current password"
				autocomplete="current-password"
			/>
			{#if validationErrors?.currentPassword}
				<Field.Error errors={validationErrors.currentPassword.map((m) => ({ message: m }))} />
			{/if}
		</Field.Field>

		<Field.Field>
			<Field.Label for="newPassword">New Password</Field.Label>
			<Input
				id="newPassword"
				type="password"
				bind:value={newPassword}
				placeholder="Enter your new password"
				autocomplete="new-password"
				aria-invalid={validationErrors?.newPassword ? 'true' : undefined}
			/>
			{#if newPassword.length > 0}
				<div class="mt-2 flex items-center gap-2">
					<div class="flex-1 flex gap-1">
						{#each [1, 2, 3] as level (level)}
							<div
								class="h-1 flex-1 rounded-full transition-colors
									{passwordStrength.level >= level
									? level === 1
										? 'bg-red-500'
										: level === 2
											? 'bg-yellow-500'
											: 'bg-green-500'
									: 'bg-muted'}"
							></div>
						{/each}
					</div>
					<span
						class="text-xs
							{passwordStrength.level === 1
							? 'text-red-500'
							: passwordStrength.level === 2
								? 'text-yellow-500'
								: 'text-green-500'}"
					>
						{passwordStrength.label}
					</span>
				</div>
			{/if}
			{#if validationErrors?.newPassword}
				<Field.Error errors={validationErrors.newPassword.map((m) => ({ message: m }))} />
			{/if}
			<Field.Description>
				Must be at least 8 characters with uppercase, lowercase, and numbers.
			</Field.Description>
		</Field.Field>

		<Field.Field>
			<Field.Label for="confirmPassword">Confirm New Password</Field.Label>
			<Input
				id="confirmPassword"
				type="password"
				bind:value={confirmPassword}
				placeholder="Confirm your new password"
				autocomplete="new-password"
				aria-invalid={validationErrors?.confirmPassword ? 'true' : undefined}
			/>
			{#if validationErrors?.confirmPassword}
				<Field.Error errors={validationErrors.confirmPassword.map((m) => ({ message: m }))} />
			{/if}
		</Field.Field>
	</Field.Group>

	<Button type="submit" disabled={loading || !!validationErrors}>
		{#if loading}
			Changing Password...
		{:else if success}
			<Check class="mr-2 h-4 w-4" />
			Password Changed
		{:else}
			Change Password
		{/if}
	</Button>
</form>
