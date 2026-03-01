<script lang="ts">
	import { navigating } from '$app/stores';
</script>

{#if $navigating}
	<div class="fixed top-0 left-0 z-[100] h-0.5 w-full" role="progressbar" aria-label="Loading page">
		<div class="h-full bg-primary animate-progress"></div>
	</div>
{/if}

<style>
	@keyframes progress {
		0% {
			width: 0%;
		}
		50% {
			width: 70%;
		}
		100% {
			width: 95%;
		}
	}

	.animate-progress {
		animation: progress 2s ease-out forwards;
	}
</style>
