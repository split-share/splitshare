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
	class="fixed inset-0 bg-background/98 z-50 flex flex-col items-center justify-center p-6 backdrop-blur-sm"
>
	<div class="text-center space-y-8 max-w-md w-full">
		<div class="space-y-2">
			<div class="flex items-center justify-center gap-2 text-muted-foreground">
				<Timer class="h-5 w-5" />
				<span class="text-lg">Rest Time</span>
			</div>
			<p class="text-sm text-muted-foreground">Take a breather and get ready for the next set</p>
		</div>

		<div class="py-8">
			<WorkoutTimer mode="count-down" initialSeconds={restSeconds} {onComplete} />
		</div>

		{#if nextExerciseName}
			<div class="text-sm text-muted-foreground">
				<span class="font-medium">Up next:</span>
				{nextExerciseName}
			</div>
		{/if}

		<Button variant="outline" size="lg" class="w-full max-w-xs" onclick={onSkip}>
			<SkipForward class="h-4 w-4 mr-2" />
			Skip Rest
		</Button>
	</div>
</div>
