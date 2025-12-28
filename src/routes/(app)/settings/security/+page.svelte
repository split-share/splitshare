<script lang="ts">
	import {
		Card,
		CardContent,
		CardDescription,
		CardHeader,
		CardTitle
	} from '$lib/components/ui/card';
	import { Separator } from '$lib/components/ui/separator';
	import Badge from '$lib/components/ui/badge.svelte';
	import PasswordForm from '$lib/components/settings/password-form.svelte';
	import TwoFactorSetup from '$lib/components/settings/two-factor-setup.svelte';
	import TwoFactorDisable from '$lib/components/settings/two-factor-disable.svelte';
	import { authClient } from '$lib/auth-client';
	import { invalidateAll } from '$app/navigation';
	import type { ChangePasswordInput } from '$lib/schemas/password';
	import { Shield, ShieldCheck } from 'lucide-svelte';

	let { data } = $props();

	type UserWithTwoFactor = typeof data.user & { twoFactorEnabled?: boolean };
	const user = data.user as UserWithTwoFactor;

	let twoFactorEnabled = $state(user.twoFactorEnabled ?? false);

	async function handleChangePassword(formData: ChangePasswordInput) {
		const result = await authClient.changePassword({
			currentPassword: formData.currentPassword,
			newPassword: formData.newPassword
		});

		if (result.error) {
			return { success: false, error: result.error.message || 'Failed to change password' };
		}

		return { success: true };
	}

	async function handleTwoFactorChange() {
		await invalidateAll();
		twoFactorEnabled = !twoFactorEnabled;
	}
</script>

<div class="space-y-6">
	<Card>
		<CardHeader>
			<CardTitle>Change Password</CardTitle>
			<CardDescription>Update your password to keep your account secure.</CardDescription>
		</CardHeader>
		<CardContent>
			<PasswordForm onSubmit={handleChangePassword} />
		</CardContent>
	</Card>

	<Separator />

	<Card>
		<CardHeader>
			<div class="flex items-center justify-between">
				<div>
					<CardTitle class="flex items-center gap-2">
						Two-Factor Authentication
						{#if twoFactorEnabled}
							<Badge variant="default" class="bg-green-600">
								<ShieldCheck class="mr-1 h-3 w-3" />
								Enabled
							</Badge>
						{:else}
							<Badge variant="secondary">
								<Shield class="mr-1 h-3 w-3" />
								Disabled
							</Badge>
						{/if}
					</CardTitle>
					<CardDescription class="mt-1">
						Add an extra layer of security to your account using an authenticator app.
					</CardDescription>
				</div>
			</div>
		</CardHeader>
		<CardContent>
			{#if twoFactorEnabled}
				<div class="space-y-4">
					<p class="text-sm text-muted-foreground">
						Two-factor authentication is enabled. You'll need to enter a code from your
						authenticator app when signing in.
					</p>
					<TwoFactorDisable onComplete={handleTwoFactorChange} />
				</div>
			{:else}
				<div class="space-y-4">
					<p class="text-sm text-muted-foreground">
						Two-factor authentication adds an extra layer of security by requiring a code from your
						authenticator app in addition to your password.
					</p>
					<TwoFactorSetup onComplete={handleTwoFactorChange} />
				</div>
			{/if}
		</CardContent>
	</Card>
</div>
