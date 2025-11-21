<script lang="ts">
	import type { Snippet } from 'svelte';
	import '../app.css';
	import { ModeWatcher } from 'mode-watcher';
	import ModeToggle from '$lib/components/mode-toggle.svelte';
	import SeoHead from '$lib/components/seo-head.svelte';
	import type { LayoutData } from './$types';

	let { data, children }: { data: LayoutData; children: Snippet } = $props();
</script>

<ModeWatcher />

<SeoHead />

<svelte:head>
	<link rel="icon" type="image/png" href="/splitshare.png" />
	<link rel="apple-touch-icon" href="/splitshare.png" />
	<meta name="theme-color" content="#0EA5E9" />
	<meta name="viewport" content="width=device-width, initial-scale=1" />
</svelte:head>

<div class="relative min-h-screen h-dvh flex flex-col">
	<header
		class="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60"
	>
		<div class="flex h-14 items-center justify-between px-4 md:px-6">
			<div class="flex items-center gap-6">
				<a href="/" class="flex items-center space-x-2">
					<span class="font-bold">SplitShare</span>
				</a>
				{#if data.user}
					<nav class="flex items-center gap-4">
						<a href="/splits" class="text-sm hover:text-primary">My Splits</a>
						<a href="/discover" class="text-sm hover:text-primary">Discover</a>
					</nav>
				{/if}
			</div>
			<div class="flex items-center gap-3">
				{#if data.user}
					<span class="text-sm text-muted-foreground hidden md:inline">{data.user.name}</span>
					<form method="POST" action="/logout">
						<button
							type="submit"
							class="rounded-lg border px-3 py-1.5 text-sm hover:bg-accent transition-colors"
						>
							Logout
						</button>
					</form>
				{:else}
					<a
						href="/login"
						class="rounded-lg border px-3 py-1.5 text-sm hover:bg-accent transition-colors"
					>
						Login
					</a>
				{/if}
				<ModeToggle />
			</div>
		</div>
	</header>

	<main class="flex-1">
		{@render children()}
	</main>
</div>
