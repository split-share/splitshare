<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import WorkoutTimer from './workout-timer.svelte';
	import { SkipForward, Timer } from 'lucide-svelte';

	interface Props {
		restSeconds: number;
		onSkip: () => void;
		onComplete: () => void;
		nextExerciseName?: string;
	}

	let { restSeconds, onSkip, onComplete, nextExerciseName }: Props = $props();
</script>

<div
	class="fixed inset-0 bg-background/98 z-50 flex flex-col items-center justify-center p-4 sm:p-6 backdrop-blur-sm"
>
	<div class="text-center space-y-6 sm:space-y-8 max-w-md w-full">
		<div class="space-y-1 sm:space-y-2">
			<div class="flex items-center justify-center gap-2 text-muted-foreground">
				<Timer class="h-4 w-4 sm:h-5 sm:w-5" />
				<span class="text-base sm:text-lg">Rest Time</span>
			</div>
			<p class="text-xs sm:text-sm text-muted-foreground">
				Take a breather and get ready for the next set
			</p>
		</div>

		<div class="py-6 sm:py-8">
			<WorkoutTimer mode="count-down" initialSeconds={restSeconds} {onComplete} />
		</div>

		{#if nextExerciseName}
			<div class="text-sm text-muted-foreground px-4">
				<span class="font-medium">Up next:</span>
				<span class="truncate block max-w-[250px] mx-auto">{nextExerciseName}</span>
			</div>
		{/if}

		<Button variant="outline" size="lg" class="w-full max-w-xs h-12 sm:h-11" onclick={onSkip}>
			<SkipForward class="h-4 w-4 mr-2" />
			Skip Rest
		</Button>
	</div>
</div>
