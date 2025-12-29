<script lang="ts">
	import {
		Dialog,
		DialogContent,
		DialogDescription,
		DialogFooter,
		DialogHeader,
		DialogTitle
	} from '$lib/components/ui/dialog';
	import { Button } from '$lib/components/ui/button';
	import Badge from '$lib/components/ui/badge.svelte';
	import { Link2 } from 'lucide-svelte';

	interface Props {
		open: boolean;
		exerciseNames: string[];
		onConfirm: (groupType: 'superset' | 'triset') => void;
		onCancel: () => void;
	}

	let { open = $bindable(false), exerciseNames, onConfirm, onCancel }: Props = $props();

	let selectedGroupType = $state<'superset' | 'triset'>(
		exerciseNames.length === 2 ? 'superset' : 'triset'
	);

	// Update group type when exercise count changes
	$effect(() => {
		if (exerciseNames.length === 2) {
			selectedGroupType = 'superset';
		} else if (exerciseNames.length >= 3) {
			selectedGroupType = 'triset';
		}
	});

	function handleConfirm() {
		onConfirm(selectedGroupType);
		open = false;
	}

	function handleCancel() {
		onCancel();
		open = false;
	}
</script>

<Dialog bind:open>
	<DialogContent class="max-w-md">
		<DialogHeader>
			<DialogTitle class="flex items-center gap-2">
				<Link2 class="h-5 w-5" />
				Create Exercise Group
			</DialogTitle>
			<DialogDescription>
				Group these exercises to perform them back-to-back with rest only after completing all
				exercises.
			</DialogDescription>
		</DialogHeader>

		<div class="space-y-4 py-4">
			<div class="space-y-2">
				<p class="text-sm font-medium">Exercises to group:</p>
				<div class="space-y-1">
					{#each exerciseNames as name, index (index)}
						<div class="flex items-center gap-2 text-sm">
							<Badge variant="outline" class="w-6 h-6 p-0 justify-center">{index + 1}</Badge>
							<span>{name}</span>
						</div>
					{/each}
				</div>
			</div>

			<div class="space-y-2">
				<p class="text-sm font-medium">Group type:</p>
				<div class="flex gap-2">
					<button
						type="button"
						class="flex-1 p-3 rounded-lg border-2 text-center transition-all {selectedGroupType ===
						'superset'
							? 'border-blue-500 bg-blue-500/10'
							: 'border-muted hover:border-muted-foreground/30'}"
						onclick={() => (selectedGroupType = 'superset')}
						disabled={exerciseNames.length > 2}
					>
						<div class="font-medium text-blue-600">Superset</div>
						<div class="text-xs text-muted-foreground">2 exercises</div>
					</button>
					<button
						type="button"
						class="flex-1 p-3 rounded-lg border-2 text-center transition-all {selectedGroupType ===
						'triset'
							? 'border-purple-500 bg-purple-500/10'
							: 'border-muted hover:border-muted-foreground/30'}"
						onclick={() => (selectedGroupType = 'triset')}
						disabled={exerciseNames.length < 3}
					>
						<div class="font-medium text-purple-600">Triset</div>
						<div class="text-xs text-muted-foreground">3 exercises</div>
					</button>
				</div>
			</div>

			<div class="bg-muted/50 rounded-lg p-3 text-sm text-muted-foreground">
				<p>
					<strong>How it works:</strong> During your workout, you'll perform one set of each exercise
					in the group back-to-back, then rest before repeating.
				</p>
			</div>
		</div>

		<DialogFooter>
			<Button variant="outline" onclick={handleCancel}>Cancel</Button>
			<Button onclick={handleConfirm}>Create Group</Button>
		</DialogFooter>
	</DialogContent>
</Dialog>
