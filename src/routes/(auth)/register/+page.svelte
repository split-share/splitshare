<script lang="ts">
	import { signUp } from '$lib/auth-client';
	import { goto } from '$app/navigation';

	let name = $state('');
	let email = $state('');
	let password = $state('');
	let confirmPassword = $state('');
	let error = $state('');
	let fieldErrors = $state<Record<string, string>>({});
	let loading = $state(false);

	async function handleSubmit(e: Event) {
		e.preventDefault();
		error = '';
		fieldErrors = {};
		loading = true;

		// Client-side validation
		if (name.length < 3) {
			fieldErrors.name = 'Name must be at least 3 characters';
			loading = false;
			return;
		}

		if (password.length < 8) {
			fieldErrors.password = 'Password must be at least 8 characters';
			loading = false;
			return;
		}

		if (password !== confirmPassword) {
			fieldErrors.confirmPassword = "Passwords don't match";
			loading = false;
			return;
		}

		if (!/[A-Z]/.test(password)) {
			fieldErrors.password = 'Password must contain at least one uppercase letter';
			loading = false;
			return;
		}

		if (!/[a-z]/.test(password)) {
			fieldErrors.password = 'Password must contain at least one lowercase letter';
			loading = false;
			return;
		}

		if (!/[0-9]/.test(password)) {
			fieldErrors.password = 'Password must contain at least one number';
			loading = false;
			return;
		}

		try {
			const result = await signUp.email({
				email,
				password,
				name
			});

			if (result.error) {
				error = result.error.message || 'Failed to create account';
			} else {
				goto('/splits');
			}
		} catch (err) {
			error = 'An error occurred. Please try again.';
		} finally {
			loading = false;
		}
	}
</script>

<div class="flex min-h-screen items-center justify-center px-4">
	<div class="w-full max-w-md space-y-8">
		<div class="text-center">
			<h1 class="text-3xl font-bold">Create an account</h1>
			<p class="mt-2 text-muted-foreground">Start tracking your workouts</p>
		</div>

		<form onsubmit={handleSubmit} class="space-y-6">
			{#if error}
				<div class="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
					{error}
				</div>
			{/if}

			<div class="space-y-2">
				<label for="name" class="text-sm font-medium">Name</label>
				<input
					id="name"
					name="name"
					type="text"
					bind:value={name}
					required
					class="w-full rounded-lg border border-input bg-background px-3 py-2"
					placeholder="John Doe"
				/>
				{#if fieldErrors.name}
					<p class="text-sm text-destructive">{fieldErrors.name}</p>
				{/if}
			</div>

			<div class="space-y-2">
				<label for="email" class="text-sm font-medium">Email</label>
				<input
					id="email"
					name="email"
					type="email"
					bind:value={email}
					required
					class="w-full rounded-lg border border-input bg-background px-3 py-2"
					placeholder="you@example.com"
				/>
				{#if fieldErrors.email}
					<p class="text-sm text-destructive">{fieldErrors.email}</p>
				{/if}
			</div>

			<div class="space-y-2">
				<label for="password" class="text-sm font-medium">Password</label>
				<input
					id="password"
					name="password"
					type="password"
					bind:value={password}
					required
					class="w-full rounded-lg border border-input bg-background px-3 py-2"
					placeholder="••••••••"
				/>
				{#if fieldErrors.password}
					<p class="text-sm text-destructive">{fieldErrors.password}</p>
				{/if}
			</div>

			<div class="space-y-2">
				<label for="confirmPassword" class="text-sm font-medium">Confirm Password</label>
				<input
					id="confirmPassword"
					name="confirmPassword"
					type="password"
					bind:value={confirmPassword}
					required
					class="w-full rounded-lg border border-input bg-background px-3 py-2"
					placeholder="••••••••"
				/>
				{#if fieldErrors.confirmPassword}
					<p class="text-sm text-destructive">{fieldErrors.confirmPassword}</p>
				{/if}
			</div>

			<button
				type="submit"
				disabled={loading}
				class="w-full rounded-lg bg-primary px-4 py-2 font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
			>
				{loading ? 'Creating account...' : 'Create account'}
			</button>
		</form>

		<p class="text-center text-sm text-muted-foreground">
			Already have an account?
			<a href="/login" class="font-medium text-primary hover:underline">Sign in</a>
		</p>
	</div>
</div>
