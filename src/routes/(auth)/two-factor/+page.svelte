<script lang="ts">
	import {
		Card,
		CardContent,
		CardDescription,
		CardHeader,
		CardTitle
	} from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Checkbox } from '$lib/components/ui/checkbox';
	import * as Field from '$lib/components/ui/field';
	import { authClient } from '$lib/auth-client';
	import { goto, invalidateAll } from '$app/navigation';
	import { totpCodeSchema, backupCodeSchema } from '$lib/schemas/two-factor';
	import { Shield, Loader2, Key } from 'lucide-svelte';

	let mode = $state<'totp' | 'backup'>('totp');
	let code = $state('');
	let trustDevice = $state(false);
	let loading = $state(false);
	let error = $state('');

	async function handleSubmit(e: SubmitEvent) {
		e.preventDefault();
		error = '';

		const schema = mode === 'totp' ? totpCodeSchema : backupCodeSchema;
		const result = schema.safeParse({ code });

		if (!result.success) {
			error = result.error.issues[0].message;
			return;
		}

		loading = true;
		try {
			let response;

			if (mode === 'totp') {
				response = await authClient.twoFactor.verifyTotp({
					code,
					trustDevice
				});
			} else {
				response = await authClient.twoFactor.verifyBackupCode({
					code,
					trustDevice
				});
			}

			if (response.error) {
				error = response.error.message || 'Invalid code';
				return;
			}

			await invalidateAll();
			await goto('/splits');
		} catch {
			error = 'An unexpected error occurred';
		} finally {
			loading = false;
		}
	}

	function handleCodeInput(e: Event) {
		const input = e.target as HTMLInputElement;
		if (mode === 'totp') {
			code = input.value.replace(/\D/g, '').slice(0, 6);
		} else {
			code = input.value
				.toUpperCase()
				.replace(/[^A-Z0-9]/g, '')
				.slice(0, 8);
		}
	}

	function switchMode() {
		mode = mode === 'totp' ? 'backup' : 'totp';
		code = '';
		error = '';
	}
</script>

<div class="flex h-full w-full items-center justify-center px-4">
	<Card class="w-full max-w-md">
		<CardHeader class="text-center">
			<div
				class="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10"
			>
				<Shield class="h-6 w-6 text-primary" />
			</div>
			<CardTitle>Two-Factor Authentication</CardTitle>
			<CardDescription>
				{#if mode === 'totp'}
					Enter the 6-digit code from your authenticator app.
				{:else}
					Enter one of your backup codes.
				{/if}
			</CardDescription>
		</CardHeader>
		<CardContent>
			<form onsubmit={handleSubmit} class="space-y-6">
				{#if error}
					<div class="rounded-lg bg-destructive/10 p-3 text-sm text-destructive" role="alert">
						{error}
					</div>
				{/if}

				<Field.Field>
					<Field.Label for="code">
						{mode === 'totp' ? 'Verification Code' : 'Backup Code'}
					</Field.Label>
					<Input
						id="code"
						type="text"
						inputmode={mode === 'totp' ? 'numeric' : 'text'}
						value={code}
						oninput={handleCodeInput}
						placeholder={mode === 'totp' ? '000000' : 'XXXXXXXX'}
						class="text-center text-2xl tracking-widest font-mono"
						maxlength={mode === 'totp' ? 6 : 8}
						autocomplete="one-time-code"
						autofocus
					/>
				</Field.Field>

				<label class="flex items-center gap-3 cursor-pointer">
					<Checkbox bind:checked={trustDevice} />
					<span class="text-sm">Trust this device for 30 days</span>
				</label>

				<Button
					type="submit"
					class="w-full"
					disabled={loading || (mode === 'totp' ? code.length !== 6 : code.length !== 8)}
				>
					{#if loading}
						<Loader2 class="mr-2 h-4 w-4 animate-spin" />
						Verifying...
					{:else}
						Verify
					{/if}
				</Button>

				<div class="text-center">
					<button
						type="button"
						class="text-sm text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-2"
						onclick={switchMode}
					>
						<Key class="h-4 w-4" />
						{mode === 'totp' ? 'Use a backup code instead' : 'Use authenticator app'}
					</button>
				</div>
			</form>
		</CardContent>
	</Card>
</div>
