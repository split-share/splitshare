<script lang="ts">
	import { Button } from '$lib/components/ui/button';

	/**
	 * Hero section component props
	 */
	let { user }: { user: { id: string; name: string } | null } = $props();
</script>

<div class="mb-16 text-center py-12">
	<h1 class="mb-4 text-4xl font-bold sm:text-5xl md:text-6xl">
		Share Your <span class="text-primary">Gym Splits</span> with the World
	</h1>
	<p class="mb-8 text-lg text-muted-foreground sm:text-xl max-w-3xl mx-auto">
		Create custom workout routines, discover what works for others, and build your fitness
		community. Your next PR starts with the right split.
	</p>
	<div class="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4">
		<Button href="/discover" size="lg" class="w-full sm:w-auto">Explore Splits</Button>
		{#if !user}
			<Button href="/register" variant="outline" size="lg" class="w-full sm:w-auto">
				Create Your Split
			</Button>
		{:else}
			<Button href="/splits/new" variant="outline" size="lg" class="w-full sm:w-auto">
				Create Your Split
			</Button>
		{/if}
	</div>
</div>
