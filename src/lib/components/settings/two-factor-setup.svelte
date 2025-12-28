<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import * as Field from '$lib/components/ui/field';
	import * as Dialog from '$lib/components/ui/dialog';
	import BackupCodesDisplay from './backup-codes-display.svelte';
	import { authClient } from '$lib/auth-client';
	import { enableTwoFactorSchema, totpCodeSchema } from '$lib/schemas/two-factor';
	import { Shield, Smartphone, Loader2 } from 'lucide-svelte';
	import QRCode from 'qrcode';

	type Props = {
		onComplete: () => void;
	};

	let { onComplete }: Props = $props();

	type Step = 'password' | 'qr' | 'verify' | 'backup';

	let open = $state(false);
	let step = $state<Step>('password');
	let loading = $state(false);
	let error = $state('');

	let password = $state('');
	let totpUri = $state('');
	let qrCodeDataUrl = $state('');
	let backupCodes = $state<string[]>([]);
	let verificationCode = $state('');

	function resetState() {
		step = 'password';
		password = '';
		totpUri = '';
		qrCodeDataUrl = '';
		backupCodes = [];
		verificationCode = '';
		error = '';
		loading = false;
	}

	function handleOpenChange(isOpen: boolean) {
		open = isOpen;
		if (!isOpen) {
			resetState();
		}
	}

	async function handlePasswordSubmit(e: SubmitEvent) {
		e.preventDefault();
		error = '';

		const result = enableTwoFactorSchema.safeParse({ password });
		if (!result.success) {
			error = result.error.issues[0].message;
			return;
		}

		loading = true;
		try {
			const response = await authClient.twoFactor.enable({
				password
			});

			if (response.error) {
				error = response.error.message || 'Failed to enable 2FA';
				return;
			}

			if (response.data?.totpURI && response.data?.backupCodes) {
				totpUri = response.data.totpURI;
				backupCodes = response.data.backupCodes;

				qrCodeDataUrl = await QRCode.toDataURL(totpUri, {
					width: 200,
					margin: 2,
					color: {
						dark: '#000000',
						light: '#ffffff'
					}
				});

				step = 'qr';
			}
		} catch {
			error = 'An unexpected error occurred';
		} finally {
			loading = false;
		}
	}

	async function handleVerifyCode(e: SubmitEvent) {
		e.preventDefault();
		error = '';

		const result = totpCodeSchema.safeParse({ code: verificationCode });
		if (!result.success) {
			error = result.error.issues[0].message;
			return;
		}

		loading = true;
		try {
			const response = await authClient.twoFactor.verifyTotp({
				code: verificationCode
			});

			if (response.error) {
				error = response.error.message || 'Invalid verification code';
				return;
			}

			step = 'backup';
		} catch {
			error = 'An unexpected error occurred';
		} finally {
			loading = false;
		}
	}

	function handleBackupConfirm() {
		open = false;
		resetState();
		onComplete();
	}

	function handleCodeInput(e: Event) {
		const input = e.target as HTMLInputElement;
		verificationCode = input.value.replace(/\D/g, '').slice(0, 6);
	}
</script>

<Dialog.Root {open} onOpenChange={handleOpenChange}>
	<Dialog.Trigger>
		{#snippet child({ props })}
			<Button {...props}>
				<Shield class="mr-2 h-4 w-4" />
				Enable Two-Factor Authentication
			</Button>
		{/snippet}
	</Dialog.Trigger>

	<Dialog.Content class="max-w-md">
		{#if step === 'password'}
			<Dialog.Header>
				<Dialog.Title>Enable Two-Factor Authentication</Dialog.Title>
				<Dialog.Description>
					Enter your password to begin setting up two-factor authentication.
				</Dialog.Description>
			</Dialog.Header>

			<form onsubmit={handlePasswordSubmit} class="space-y-4">
				{#if error}
					<div class="rounded-lg bg-destructive/10 p-3 text-sm text-destructive" role="alert">
						{error}
					</div>
				{/if}

				<Field.Field>
					<Field.Label for="2fa-password">Password</Field.Label>
					<Input
						id="2fa-password"
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
					<Button type="submit" disabled={loading || !password}>
						{#if loading}
							<Loader2 class="mr-2 h-4 w-4 animate-spin" />
							Verifying...
						{:else}
							Continue
						{/if}
					</Button>
				</Dialog.Footer>
			</form>
		{:else if step === 'qr'}
			<Dialog.Header>
				<Dialog.Title>Scan QR Code</Dialog.Title>
				<Dialog.Description>
					Scan this QR code with your authenticator app (Google Authenticator, Authy, etc.)
				</Dialog.Description>
			</Dialog.Header>

			<div class="flex flex-col items-center space-y-4">
				<div class="bg-white p-4 rounded-lg">
					{#if qrCodeDataUrl}
						<img src={qrCodeDataUrl} alt="TOTP QR Code" class="w-48 h-48" />
					{/if}
				</div>

				<div class="flex items-center gap-2 text-sm text-muted-foreground">
					<Smartphone class="h-4 w-4" />
					<span>Can't scan? Enter this key manually:</span>
				</div>

				<code class="block w-full p-2 bg-muted rounded text-xs text-center break-all select-all">
					{totpUri.match(/secret=([A-Z2-7]+)/)?.[1] || ''}
				</code>
			</div>

			<Dialog.Footer>
				<Button onclick={() => (step = 'verify')} class="w-full">I've Scanned the QR Code</Button>
			</Dialog.Footer>
		{:else if step === 'verify'}
			<Dialog.Header>
				<Dialog.Title>Verify Setup</Dialog.Title>
				<Dialog.Description>
					Enter the 6-digit code from your authenticator app to verify the setup.
				</Dialog.Description>
			</Dialog.Header>

			<form onsubmit={handleVerifyCode} class="space-y-4">
				{#if error}
					<div class="rounded-lg bg-destructive/10 p-3 text-sm text-destructive" role="alert">
						{error}
					</div>
				{/if}

				<Field.Field>
					<Field.Label for="totp-code">Verification Code</Field.Label>
					<Input
						id="totp-code"
						type="text"
						inputmode="numeric"
						value={verificationCode}
						oninput={handleCodeInput}
						placeholder="000000"
						class="text-center text-2xl tracking-widest font-mono"
						maxlength={6}
						autocomplete="one-time-code"
					/>
				</Field.Field>

				<Dialog.Footer>
					<Button type="button" variant="outline" onclick={() => (step = 'qr')}>Back</Button>
					<Button type="submit" disabled={loading || verificationCode.length !== 6}>
						{#if loading}
							<Loader2 class="mr-2 h-4 w-4 animate-spin" />
							Verifying...
						{:else}
							Verify
						{/if}
					</Button>
				</Dialog.Footer>
			</form>
		{:else if step === 'backup'}
			<Dialog.Header>
				<Dialog.Title>Backup Codes</Dialog.Title>
				<Dialog.Description>
					Two-factor authentication is now enabled. Save these backup codes for emergency access.
				</Dialog.Description>
			</Dialog.Header>

			<BackupCodesDisplay codes={backupCodes} onConfirm={handleBackupConfirm} />
		{/if}
	</Dialog.Content>
</Dialog.Root>
