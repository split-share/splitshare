<script lang="ts">
	import {
		Card,
		CardContent,
		CardDescription,
		CardHeader,
		CardTitle
	} from '$lib/components/ui/card';
	import ProfileForm from '$lib/components/settings/profile-form.svelte';
	import { authClient } from '$lib/auth-client';
	import { invalidateAll } from '$app/navigation';
	import type { UpdateProfileInput } from '$lib/schemas/profile';

	let { data } = $props();

	async function handleUpdateProfile(formData: UpdateProfileInput) {
		const result = await authClient.updateUser({
			name: formData.name
		});

		if (result.error) {
			return { success: false, error: result.error.message || 'Failed to update profile' };
		}

		await invalidateAll();
		return { success: true };
	}
</script>

<Card>
	<CardHeader>
		<CardTitle>Profile Information</CardTitle>
		<CardDescription>Update your personal information.</CardDescription>
	</CardHeader>
	<CardContent>
		<ProfileForm initialName={data.user.name} onSubmit={handleUpdateProfile} />
	</CardContent>
</Card>
