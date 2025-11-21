<script lang="ts">
	/**
	 * Loading spinner component
	 */
	let {
		size = 'md',
		text
	}: {
		size?: 'sm' | 'md' | 'lg';
		text?: string;
	} = $props();

	const sizeClasses = {
		sm: 'h-4 w-4 border-2',
		md: 'h-8 w-8 border-2',
		lg: 'h-12 w-12 border-3'
	};
</script>

<div class="flex flex-col items-center justify-center gap-3">
	<div
		class="animate-spin rounded-full border-primary border-t-transparent {sizeClasses[size]}"
		role="status"
		aria-label="Loading"
	></div>
	{#if text}
		<p class="text-sm text-muted-foreground">{text}</p>
	{/if}
</div>
