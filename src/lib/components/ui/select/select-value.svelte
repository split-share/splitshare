<script lang="ts">
	import { cn } from '$lib/utils.js';

	let {
		class: className,
		placeholder,
		...restProps
	}: {
		class?: string;
		placeholder?: string;
	} = $props();
</script>

<span data-slot="select-value" class={cn('block truncate', className)} {...restProps}>
	{placeholder || ''}
</span>
