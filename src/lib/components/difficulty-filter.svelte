<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import { DIFFICULTY_LEVELS } from '$lib/constants';
	import { filterByDifficulty } from '$lib/utils/navigation';

	/**
	 * Difficulty filter dropdown component props
	 */
	let { currentFilter }: { currentFilter: string | null } = $props();
</script>

<DropdownMenu.Root>
	<DropdownMenu.Trigger>
		{#snippet child({ props })}
			<Button {...props} variant="outline">
				{#if currentFilter}
					{currentFilter.charAt(0).toUpperCase() + currentFilter.slice(1)}
				{:else}
					All Difficulties
				{/if}
				<span class="ml-2">▼</span>
			</Button>
		{/snippet}
	</DropdownMenu.Trigger>
	<DropdownMenu.Content>
		<DropdownMenu.Item onclick={() => filterByDifficulty(null)}>All Difficulties</DropdownMenu.Item>
		{#each DIFFICULTY_LEVELS as difficulty (difficulty)}
			<DropdownMenu.Item onclick={() => filterByDifficulty(difficulty)}>
				{difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
			</DropdownMenu.Item>
		{/each}
	</DropdownMenu.Content>
</DropdownMenu.Root>
