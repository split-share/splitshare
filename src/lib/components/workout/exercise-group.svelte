<script lang="ts">
	import Badge from '$lib/components/ui/badge.svelte';
	import { Button } from '$lib/components/ui/button';
	import { Link2Off } from 'lucide-svelte';
	import type { Snippet } from 'svelte';

	interface Props {
		groupType: 'superset' | 'triset';
		exerciseCount: number;
		onUngroup?: () => void;
		children: Snippet;
	}

	let { groupType, exerciseCount, onUngroup, children }: Props = $props();

	const groupColors = {
		superset: 'border-blue-500/50 bg-blue-500/5',
		triset: 'border-purple-500/50 bg-purple-500/5'
	};

	const badgeColors = {
		superset: 'bg-blue-500/20 text-blue-600 border-blue-500/30',
		triset: 'bg-purple-500/20 text-purple-600 border-purple-500/30'
	};
</script>

<div class="relative rounded-lg border-2 border-dashed {groupColors[groupType]} p-3">
	<div class="absolute -top-3 left-3 flex items-center gap-2">
		<Badge class={badgeColors[groupType]}>
			{groupType === 'superset' ? 'Superset' : 'Triset'}
			<span class="ml-1 opacity-70">({exerciseCount})</span>
		</Badge>
		{#if onUngroup}
			<Button
				variant="ghost"
				size="sm"
				class="h-6 px-2 text-xs text-muted-foreground hover:text-destructive"
				onclick={onUngroup}
			>
				<Link2Off class="h-3 w-3 mr-1" />
				Ungroup
			</Button>
		{/if}
	</div>
	<div class="mt-2 space-y-2">
		{@render children()}
	</div>
</div>
