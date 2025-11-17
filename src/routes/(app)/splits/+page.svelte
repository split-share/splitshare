<script lang="ts">
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<div class="container mx-auto px-4 py-8">
	<div class="mb-8 flex items-center justify-between">
		<div>
			<h1 class="text-3xl font-bold">My Splits</h1>
			<p class="mt-2 text-muted-foreground">Manage your workout splits</p>
		</div>
		<a
			href="/splits/new"
			class="rounded-lg bg-primary px-4 py-2 font-medium text-primary-foreground hover:bg-primary/90"
		>
			Create Split
		</a>
	</div>

	<div class="rounded-lg border p-8 text-center">
		<p class="text-muted-foreground">No splits yet. Create your first workout split!</p>
	</div>
</div>
