<script lang="ts">
	import type { Snippet } from 'svelte';
	import '../app.css';
	import { ModeWatcher } from 'mode-watcher';
	import ModeToggle from '$lib/components/mode-toggle.svelte';
	import SeoHead from '$lib/components/seo-head.svelte';
	import { Button } from '$lib/components/ui/button';
	import { Menu, X } from 'lucide-svelte';
	import type { LayoutData } from './$types';

	let { data, children }: { data: LayoutData; children: Snippet } = $props();

	let mobileMenuOpen = $state(false);

	function toggleMobileMenu() {
		mobileMenuOpen = !mobileMenuOpen;
	}

	function closeMobileMenu() {
		mobileMenuOpen = false;
	}
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
			<div class="flex items-center gap-4 md:gap-6">
				<a href="/" class="flex items-center space-x-2" onclick={closeMobileMenu}>
					<span class="font-bold">SplitShare</span>
				</a>
				{#if data.user}
					<!-- Desktop Navigation -->
					<nav class="hidden md:flex items-center gap-4">
						<a href="/splits" class="text-sm hover:text-primary transition-colors">My Splits</a>
						<a href="/discover" class="text-sm hover:text-primary transition-colors">Discover</a>
						<a href="/forum" class="text-sm hover:text-primary transition-colors">Forum</a>
						<a href="/stats" class="text-sm hover:text-primary transition-colors">Stats</a>
					</nav>
				{/if}
			</div>
			<div class="flex items-center gap-2 md:gap-3">
				{#if data.user}
					<span class="text-sm text-muted-foreground hidden md:inline">{data.user.name}</span>
					<form method="POST" action="/logout" class="hidden md:block">
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
						class="rounded-lg border px-3 py-1.5 text-sm hover:bg-accent transition-colors hidden md:inline-flex"
					>
						Login
					</a>
				{/if}
				<ModeToggle />
				<!-- Mobile Menu Toggle -->
				{#if data.user}
					<Button
						variant="ghost"
						size="icon"
						class="md:hidden h-10 w-10"
						onclick={toggleMobileMenu}
						aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
					>
						{#if mobileMenuOpen}
							<X class="h-5 w-5" />
						{:else}
							<Menu class="h-5 w-5" />
						{/if}
					</Button>
				{:else}
					<a
						href="/login"
						class="rounded-lg border px-3 py-1.5 text-sm hover:bg-accent transition-colors md:hidden"
					>
						Login
					</a>
				{/if}
			</div>
		</div>

		<!-- Mobile Navigation Menu -->
		{#if data.user && mobileMenuOpen}
			<nav
				class="md:hidden border-t border-border/40 bg-background/95 backdrop-blur animate-in slide-in-from-top-2 duration-200"
			>
				<div class="flex flex-col py-2">
					<a
						href="/splits"
						class="px-4 py-3 text-sm hover:bg-accent transition-colors active:bg-accent/80"
						onclick={closeMobileMenu}
					>
						My Splits
					</a>
					<a
						href="/discover"
						class="px-4 py-3 text-sm hover:bg-accent transition-colors active:bg-accent/80"
						onclick={closeMobileMenu}
					>
						Discover
					</a>
					<a
						href="/forum"
						class="px-4 py-3 text-sm hover:bg-accent transition-colors active:bg-accent/80"
						onclick={closeMobileMenu}
					>
						Forum
					</a>
					<a
						href="/stats"
						class="px-4 py-3 text-sm hover:bg-accent transition-colors active:bg-accent/80"
						onclick={closeMobileMenu}
					>
						Stats
					</a>
					<div class="border-t border-border/40 mt-2 pt-2 px-4">
						<div class="flex items-center justify-between py-2">
							<span class="text-sm text-muted-foreground">{data.user.name}</span>
							<form method="POST" action="/logout">
								<button
									type="submit"
									class="rounded-lg border px-3 py-1.5 text-sm hover:bg-accent transition-colors"
									onclick={closeMobileMenu}
								>
									Logout
								</button>
							</form>
						</div>
					</div>
				</div>
			</nav>
		{/if}
	</header>

	<main class="flex-1">
		{@render children()}
	</main>
</div>
