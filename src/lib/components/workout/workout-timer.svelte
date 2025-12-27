<script lang="ts">
	import { hapticImpact } from '$lib/utils/mobile';

	interface Props {
		mode: 'count-up' | 'count-down';
		initialSeconds?: number;
		targetSeconds?: number;
		isPaused?: boolean;
		onComplete?: () => void;
		onTick?: (seconds: number) => void;
	}

	let {
		mode,
		initialSeconds = 0,
		targetSeconds,
		isPaused = false,
		onComplete,
		onTick
	}: Props = $props();

	// eslint-disable-next-line svelte/prefer-writable-derived -- Timer state updated by interval
	let seconds = $state(0);
	let isOverTarget = $derived(mode === 'count-up' && targetSeconds && seconds > targetSeconds);

	// Sync seconds when initialSeconds prop changes
	$effect(() => {
		seconds = initialSeconds;
	});

	$effect(() => {
		if (isPaused) return;

		const interval = setInterval(() => {
			if (mode === 'count-up') {
				seconds++;
			} else {
				seconds--;
				if (seconds <= 0) {
					seconds = 0;
					clearInterval(interval);
					hapticImpact('heavy');
					onComplete?.();
				}
			}
			onTick?.(seconds);
		}, 1000);

		return () => clearInterval(interval);
	});

	function formatTime(s: number): string {
		const mins = Math.floor(Math.abs(s) / 60);
		const secs = Math.abs(s) % 60;
		return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
	}

	export function getSeconds(): number {
		return seconds;
	}

	export function setSeconds(value: number): void {
		seconds = value;
	}
</script>

<div class="text-center">
	<div
		class="text-4xl sm:text-5xl md:text-6xl font-mono font-bold tabular-nums transition-colors duration-300"
		class:text-red-500={isOverTarget}
		class:text-green-500={mode === 'count-down' && seconds > 0}
	>
		{formatTime(seconds)}
	</div>
	{#if mode === 'count-up' && targetSeconds}
		<p class="text-xs sm:text-sm text-muted-foreground mt-1 sm:mt-2">
			Target: {formatTime(targetSeconds)}
		</p>
	{/if}
</div>
