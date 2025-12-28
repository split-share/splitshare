<script lang="ts">
	import type { Snippet } from 'svelte';
	import { page } from '$app/stores';
	import { User, Shield } from 'lucide-svelte';

	let { children }: { children: Snippet } = $props();

	const navItems = [
		{ href: '/settings/profile', label: 'Profile', icon: User },
		{ href: '/settings/security', label: 'Security', icon: Shield }
	];
</script>

<div class="container mx-auto p-6">
	<div class="mb-8">
		<h1 class="text-3xl font-bold">Settings</h1>
		<p class="text-muted-foreground">Manage your account settings and preferences</p>
	</div>

	<div class="flex flex-col gap-8 md:flex-row">
		<nav class="w-full md:w-48 flex-shrink-0">
			<ul class="flex gap-2 md:flex-col">
				{#each navItems as item (item.href)}
					{@const isActive = $page.url.pathname === item.href}
					<li>
						<a
							href={item.href}
							class="flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors
								{isActive
								? 'bg-primary text-primary-foreground'
								: 'text-muted-foreground hover:bg-muted hover:text-foreground'}"
						>
							<item.icon class="h-4 w-4" />
							{item.label}
						</a>
					</li>
				{/each}
			</ul>
		</nav>

		<main class="flex-1 min-w-0">
			{@render children()}
		</main>
	</div>
</div>
