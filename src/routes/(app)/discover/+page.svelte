<script lang="ts">
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<div class="container mx-auto px-4 py-8">
	<div class="mb-8">
		<h1 class="text-3xl font-bold">Discover Splits</h1>
		<p class="mt-2 text-muted-foreground">Browse public workout splits from the community</p>
	</div>

	<div class="rounded-lg border p-8 text-center">
		<p class="text-muted-foreground">No public splits available yet</p>
	</div>
</div>
