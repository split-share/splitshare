<script lang="ts">
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import * as Field from '$lib/components/ui/field/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { signUp } from '$lib/auth-client';
	import { goto, invalidateAll } from '$app/navigation';
	import type { ComponentProps } from 'svelte';

	let { ...restProps }: ComponentProps<typeof Card.Root> = $props();

	let name = $state('');
	let email = $state('');
	let password = $state('');
	let confirmPassword = $state('');
	let error = $state('');
	let loading = $state(false);

	/**
	 * Handles signup form submission
	 * @param {Event} e - Form submit event
	 */
	async function handleSubmit(e: Event) {
		e.preventDefault();
		error = '';

		if (password !== confirmPassword) {
			error = 'Passwords do not match';
			return;
		}

		if (password.length < 8) {
			error = 'Password must be at least 8 characters long';
			return;
		}

		loading = true;

		try {
			const result = await signUp.email({
				name,
				email,
				password
			});

			if (result.error) {
				error = result.error.message || 'Failed to create account';
			} else {
				// Invalidate all data to reload user info
				await invalidateAll();
				await goto('/splits');
			}
		} catch {
			error = 'An error occurred. Please try again.';
		} finally {
			loading = false;
		}
	}
</script>

<Card.Root {...restProps}>
	<Card.Header>
		<Card.Title>Create an account</Card.Title>
		<Card.Description>Enter your information below to create your account</Card.Description>
	</Card.Header>
	<Card.Content>
		<form onsubmit={handleSubmit}>
			{#if error}
				<div class="mb-4 rounded-lg bg-destructive/10 p-3 text-sm text-destructive" role="alert">
					{error}
				</div>
			{/if}

			<Field.Group>
				<Field.Field>
					<Field.Label for="name">Full Name</Field.Label>
					<Input
						id="name"
						type="text"
						placeholder="John Doe"
						bind:value={name}
						required
						autocomplete="name"
					/>
				</Field.Field>
				<Field.Field>
					<Field.Label for="email">Email</Field.Label>
					<Input
						id="email"
						type="email"
						placeholder="m@example.com"
						bind:value={email}
						required
						autocomplete="email"
					/>
					<Field.Description>
						We'll use this to contact you. We will not share your email with anyone else.
					</Field.Description>
				</Field.Field>
				<Field.Field>
					<Field.Label for="password">Password</Field.Label>
					<Input
						id="password"
						type="password"
						bind:value={password}
						required
						autocomplete="new-password"
					/>
					<Field.Description>Must be at least 8 characters long.</Field.Description>
				</Field.Field>
				<Field.Field>
					<Field.Label for="confirm-password">Confirm Password</Field.Label>
					<Input
						id="confirm-password"
						type="password"
						bind:value={confirmPassword}
						required
						autocomplete="new-password"
					/>
					<Field.Description>Please confirm your password.</Field.Description>
				</Field.Field>
				<Field.Group>
					<Field.Field>
						<Button type="submit" disabled={loading}>
							{loading ? 'Creating account...' : 'Create Account'}
						</Button>
						<Field.Description class="px-6 text-center">
							Already have an account? <a href="/login" class="underline">Sign in</a>
						</Field.Description>
					</Field.Field>
				</Field.Group>
			</Field.Group>
		</form>
	</Card.Content>
</Card.Root>
