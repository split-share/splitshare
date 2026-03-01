<script lang="ts">
	import { page } from '$app/state';
	import { Button } from '$lib/components/ui/button';
	import { AlertCircle, Home, ArrowLeft } from 'lucide-svelte';
</script>

<div class="flex min-h-[60vh] items-center justify-center px-4">
	<div class="text-center max-w-md">
		<div class="mb-6 flex justify-center">
			<div class="rounded-full bg-muted p-4">
				<AlertCircle class="h-12 w-12 text-muted-foreground" />
			</div>
		</div>

		<h1 class="text-4xl font-bold mb-2">{page.status}</h1>

		<p class="text-lg text-muted-foreground mb-8">
			{#if page.status === 404}
				The page you're looking for doesn't exist or has been moved.
			{:else if page.status >= 500}
				Something went wrong on our end. Please try again later.
			{:else}
				{page.error?.message || 'An unexpected error occurred.'}
			{/if}
		</p>

		<div class="flex gap-3 justify-center">
			<Button variant="outline" onclick={() => history.back()}>
				<ArrowLeft class="h-4 w-4 mr-2" />
				Go Back
			</Button>
			<Button href="/">
				<Home class="h-4 w-4 mr-2" />
				Home
			</Button>
		</div>
	</div>
</div>
