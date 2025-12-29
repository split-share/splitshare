<script lang="ts">
	import Badge from '$lib/components/ui/badge.svelte';
	import { Repeat } from 'lucide-svelte';

	interface Props {
		groupType: 'superset' | 'triset';
		currentIndex: number;
		totalInGroup: number;
		exerciseNames: string[];
	}

	let { groupType, currentIndex, totalInGroup, exerciseNames }: Props = $props();

	const badgeColors = {
		superset: 'bg-blue-500/20 text-blue-600 border-blue-500/30',
		triset: 'bg-purple-500/20 text-purple-600 border-purple-500/30'
	};

	const dotColors = {
		superset: {
			completed: 'bg-blue-500',
			current: 'bg-blue-500 ring-2 ring-blue-500/30',
			pending: 'bg-muted'
		},
		triset: {
			completed: 'bg-purple-500',
			current: 'bg-purple-500 ring-2 ring-purple-500/30',
			pending: 'bg-muted'
		}
	};
</script>

<div class="rounded-lg border bg-card p-4 space-y-3">
	<div class="flex items-center justify-between">
		<div class="flex items-center gap-2">
			<Repeat class="h-4 w-4 text-muted-foreground" />
			<Badge class={badgeColors[groupType]}>
				{groupType === 'superset' ? 'Superset' : 'Triset'}
			</Badge>
		</div>
		<span class="text-sm text-muted-foreground">
			Exercise {currentIndex + 1} of {totalInGroup}
		</span>
	</div>

	<div class="flex items-center gap-2">
		{#each exerciseNames as name, index (index)}
			{@const status =
				index < currentIndex ? 'completed' : index === currentIndex ? 'current' : 'pending'}
			<div class="flex items-center gap-2 flex-1">
				<div class="w-3 h-3 rounded-full {dotColors[groupType][status]} transition-all"></div>
				<span
					class="text-sm truncate {status === 'current'
						? 'font-medium'
						: status === 'completed'
							? 'text-muted-foreground line-through'
							: 'text-muted-foreground'}"
				>
					{name}
				</span>
			</div>
			{#if index < exerciseNames.length - 1}
				<div class="h-px w-4 bg-border"></div>
			{/if}
		{/each}
	</div>

	<p class="text-xs text-muted-foreground">
		{#if currentIndex < totalInGroup - 1}
			Complete this exercise then move directly to the next - no rest between!
		{:else}
			Last exercise in group - rest period will begin after this set.
		{/if}
	</p>
</div>
