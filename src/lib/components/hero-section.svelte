<script lang="ts">
	import { Button } from '$lib/components/ui/button';

	/**
	 * Hero section component props
	 */
	let { user }: { user: { id: string; name: string } | null } = $props();
</script>

<div class="mb-12 text-center">
	<h1 class="mb-4 text-3xl font-bold sm:text-4xl md:text-5xl">Welcome to SplitShare</h1>
	<p class="mb-6 text-base text-muted-foreground sm:text-lg max-w-2xl mx-auto">
		Discover and share workout splits with the fitness community
	</p>
	<div class="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4">
		{#if !user}
			<Button href="/login" class="w-full sm:w-auto">Sign In</Button>
			<Button href="/register" variant="outline" class="w-full sm:w-auto">Sign Up</Button>
		{:else}
			<Button href="/splits" class="w-full sm:w-auto">My Splits</Button>
		{/if}
		<Button href="/discover" variant="secondary" class="w-full sm:w-auto">
			<span class="hidden sm:inline">Explore Popular Splits</span>
			<span class="sm:hidden">Explore</span>
		</Button>
	</div>
</div>
