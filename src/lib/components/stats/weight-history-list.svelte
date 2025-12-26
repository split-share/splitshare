<script lang="ts">
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import { Trash2, TrendingUp, TrendingDown, BarChart3 } from 'lucide-svelte';
	import { enhance } from '$app/forms';
	import type { WeightEntryWithStatsDto } from '$core/domain/weight/weight-entry.dto';

	interface Props {
		entries: WeightEntryWithStatsDto[];
	}

	let { entries }: Props = $props();

	function formatWeight(w: number): string {
		return `${w.toFixed(1)} kg`;
	}

	function formatDate(date: Date): string {
		return new Date(date).toLocaleDateString('en-US', {
			month: 'short',
			day: 'numeric',
			year: 'numeric'
		});
	}

	function formatChange(change: number | null): {
		text: string;
		class: string;
		icon: typeof TrendingUp;
	} {
		if (change === null) return { text: 'N/A', class: 'text-muted-foreground', icon: BarChart3 };

		const absChange = Math.abs(change);
		const sign = change > 0 ? '+' : '';

		if (change > 0) {
			return {
				text: `${sign}${absChange.toFixed(1)} kg`,
				class: 'text-orange-500',
				icon: TrendingUp
			};
		} else if (change < 0) {
			return {
				text: `${change.toFixed(1)} kg`,
				class: 'text-emerald-500',
				icon: TrendingDown
			};
		}

		return { text: '0.0 kg', class: 'text-muted-foreground', icon: BarChart3 };
	}
</script>

<Card class="border-none shadow-none bg-card/50">
	<CardHeader class="p-3 pb-2 sm:p-6 sm:pb-3">
		<CardTitle class="text-sm sm:text-base">History</CardTitle>
	</CardHeader>
	<CardContent class="p-3 pt-0 sm:p-6 sm:pt-0">
		{#if entries.length === 0}
			<p class="text-muted-foreground text-xs sm:text-sm">No entries yet</p>
		{:else}
			<div class="space-y-2 max-h-[300px] overflow-y-auto sm:space-y-3 sm:max-h-[400px]">
				{#each entries as entry (entry.id)}
					<div
						class="flex items-start justify-between border-b pb-2 last:border-0 last:pb-0 sm:pb-3"
					>
						<div class="space-y-0.5 sm:space-y-1">
							<p class="font-medium text-sm sm:text-base">{formatWeight(entry.weight)}</p>
							<p class="text-xs text-muted-foreground sm:text-sm">
								{formatDate(entry.recordedAt)}
							</p>
							{#if entry.change !== null}
								{@const change = formatChange(entry.change)}
								{@const IconComponent = change.icon}
								<div class="flex items-center gap-1">
									<IconComponent class="h-2.5 w-2.5 sm:h-3 sm:w-3 {change.class}" />
									<span class="text-[10px] sm:text-xs {change.class}">{change.text}</span>
								</div>
							{/if}
							{#if entry.notes}
								<p class="text-[10px] text-muted-foreground italic sm:text-xs">{entry.notes}</p>
							{/if}
						</div>
						<form method="POST" action="?/delete" use:enhance>
							<input type="hidden" name="id" value={entry.id} />
							<Button type="submit" variant="ghost" size="icon" class="h-7 w-7 sm:h-8 sm:w-8">
								<Trash2 class="h-3.5 w-3.5 sm:h-4 sm:w-4" />
							</Button>
						</form>
					</div>
				{/each}
			</div>
		{/if}
	</CardContent>
</Card>
