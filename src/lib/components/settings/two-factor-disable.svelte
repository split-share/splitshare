<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import * as Field from '$lib/components/ui/field';
	import * as Dialog from '$lib/components/ui/dialog';
	import { authClient } from '$lib/auth-client';
	import { disableTwoFactorSchema } from '$lib/schemas/two-factor';
	import { ShieldOff, Loader2, AlertTriangle } from 'lucide-svelte';

	type Props = {
		onComplete: () => void;
	};

	let { onComplete }: Props = $props();

	let open = $state(false);
	let loading = $state(false);
	let error = $state('');
	let password = $state('');

	function resetState() {
		password = '';
		error = '';
		loading = false;
	}

	function handleOpenChange(isOpen: boolean) {
		open = isOpen;
		if (!isOpen) {
			resetState();
		}
	}

	async function handleSubmit(e: SubmitEvent) {
		e.preventDefault();
		error = '';

		const result = disableTwoFactorSchema.safeParse({ password });
		if (!result.success) {
			error = result.error.issues[0].message;
			return;
		}

		loading = true;
		try {
			const response = await authClient.twoFactor.disable({
				password
			});

			if (response.error) {
				error = response.error.message || 'Failed to disable 2FA';
				return;
			}

			open = false;
			resetState();
			onComplete();
		} catch {
			error = 'An unexpected error occurred';
		} finally {
			loading = false;
		}
	}
</script>

<Dialog.Root {open} onOpenChange={handleOpenChange}>
	<Dialog.Trigger>
		{#snippet child({ props })}
			<Button {...props} variant="outline">
				<ShieldOff class="mr-2 h-4 w-4" />
				Disable Two-Factor Authentication
			</Button>
		{/snippet}
	</Dialog.Trigger>

	<Dialog.Content class="max-w-md">
		<Dialog.Header>
			<Dialog.Title>Disable Two-Factor Authentication</Dialog.Title>
			<Dialog.Description>
				This will make your account less secure. Enter your password to confirm.
			</Dialog.Description>
		</Dialog.Header>

		<div class="rounded-lg border border-yellow-500/50 bg-yellow-500/10 p-4 mb-4">
			<div class="flex gap-3">
				<AlertTriangle class="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
				<p class="text-sm text-yellow-600">
					Disabling two-factor authentication will remove an important security layer from your
					account.
				</p>
			</div>
		</div>

		<form onsubmit={handleSubmit} class="space-y-4">
			{#if error}
				<div class="rounded-lg bg-destructive/10 p-3 text-sm text-destructive" role="alert">
					{error}
				</div>
			{/if}

			<Field.Field>
				<Field.Label for="disable-2fa-password">Password</Field.Label>
				<Input
					id="disable-2fa-password"
					type="password"
					bind:value={password}
					placeholder="Enter your password"
					autocomplete="current-password"
				/>
			</Field.Field>

			<Dialog.Footer>
				<Button type="button" variant="outline" onclick={() => handleOpenChange(false)}>
					Cancel
				</Button>
				<Button type="submit" variant="destructive" disabled={loading || !password}>
					{#if loading}
						<Loader2 class="mr-2 h-4 w-4 animate-spin" />
						Disabling...
					{:else}
						Disable 2FA
					{/if}
				</Button>
			</Dialog.Footer>
		</form>
	</Dialog.Content>
</Dialog.Root>
