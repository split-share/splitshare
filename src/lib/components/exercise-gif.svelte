<script lang="ts">
	import { Dumbbell } from 'lucide-svelte';
	import { getExerciseGifUrl } from '$lib/constants';

	interface Props {
		exerciseName: string;
		gifUrl?: string | null;
		class?: string;
	}

	let { exerciseName, gifUrl = null, class: className = '' }: Props = $props();

	// Try to get GIF URL from constants if not provided
	const resolvedGifUrl = $derived(gifUrl ?? getExerciseGifUrl(exerciseName));
</script>

{#if resolvedGifUrl}
	<div class="relative aspect-square overflow-hidden rounded-lg bg-muted {className}">
		<img
			src={resolvedGifUrl}
			alt="{exerciseName} demonstration"
			class="h-full w-full object-contain"
			loading="lazy"
		/>
	</div>
{:else}
	<div
		class="flex aspect-square items-center justify-center rounded-lg bg-muted text-muted-foreground {className}"
	>
		<Dumbbell class="h-12 w-12" />
	</div>
{/if}
