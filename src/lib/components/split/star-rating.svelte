<script lang="ts">
	import { Star } from 'lucide-svelte';

	let {
		rating = $bindable(0),
		readonly = false,
		size = 'md'
	}: {
		rating?: number;
		readonly?: boolean;
		size?: 'sm' | 'md' | 'lg';
	} = $props();

	const sizeClasses = {
		sm: 'h-4 w-4',
		md: 'h-5 w-5',
		lg: 'h-6 w-6'
	};

	let hoverRating = $state(0);

	function handleClick(value: number) {
		if (!readonly) {
			rating = value;
		}
	}

	function handleMouseEnter(value: number) {
		if (!readonly) {
			hoverRating = value;
		}
	}

	function handleMouseLeave() {
		hoverRating = 0;
	}
</script>

<div class="flex gap-1" role={readonly ? 'img' : 'radiogroup'} aria-label="Rating">
	{#each [1, 2, 3, 4, 5] as star (star)}
		<button
			type="button"
			disabled={readonly}
			onclick={() => handleClick(star)}
			onmouseenter={() => handleMouseEnter(star)}
			onmouseleave={handleMouseLeave}
			class="transition-colors {readonly ? 'cursor-default' : 'cursor-pointer hover:scale-110'}"
			aria-label="Rate {star} stars"
		>
			<Star
				class={`${sizeClasses[size]} ${star <= (hoverRating || rating) ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'}`}
			/>
		</button>
	{/each}
</div>
