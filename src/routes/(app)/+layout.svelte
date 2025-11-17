<script lang="ts">
	import type { LayoutData } from './$types';

	let { data, children }: { data: LayoutData; children: any } = $props();
</script>

<div class="min-h-screen bg-background">
	<nav class="border-b">
		<div class="container mx-auto flex items-center justify-between px-4 py-4">
			<div class="flex items-center gap-6">
				<a href="/" class="text-xl font-bold">Splitify</a>
				<a href="/splits" class="text-sm hover:text-primary">My Splits</a>
				<a href="/discover" class="text-sm hover:text-primary">Discover</a>
			</div>
			<div class="flex items-center gap-4">
				<span class="text-sm text-muted-foreground">{data.user.name}</span>
				<form method="POST" action="/logout">
					<button type="submit" class="rounded-lg border px-3 py-1.5 text-sm hover:bg-accent">
						Logout
					</button>
				</form>
			</div>
		</div>
	</nav>

	<main>
		{@render children()}
	</main>
</div>
