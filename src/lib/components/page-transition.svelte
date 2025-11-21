<script lang="ts">
	import { fade, fly } from 'svelte/transition';
	import type { Snippet } from 'svelte';

	/**
	 * Page transition wrapper component
	 */
	let {
		children,
		duration = 200
	}: {
		children: Snippet;
		duration?: number;
	} = $props();
</script>

<div in:fly={{ y: 10, duration, delay: duration }} out:fade={{ duration: duration / 2 }}>
	{@render children()}
</div>
