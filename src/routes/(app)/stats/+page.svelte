<script lang="ts">
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Textarea } from '$lib/components/ui/textarea';
	import { Scale, TrendingDown, TrendingUp, BarChart3, Trash2 } from 'lucide-svelte';
	import { enhance } from '$app/forms';
	import WeightChart from './weight-chart.svelte';

	let { data, form } = $props();

	let weight = $state('');
	let notes = $state('');
	let isSubmitting = $state(false);

	function formatWeight(w: number): string {
		return `${w.toFixed(1)} kg`;
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

	function formatDate(date: Date): string {
		return new Date(date).toLocaleDateString('en-US', {
			month: 'short',
			day: 'numeric',
			year: 'numeric'
		});
	}
</script>

<div class="container mx-auto p-6 space-y-6">
	<div>
		<h1 class="text-3xl font-bold">Weight Tracking</h1>
		<p class="text-muted-foreground">Monitor your body weight progress</p>
	</div>

	<!-- Stats Cards -->
	<div class="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
		<Card class="border-none shadow-none bg-card/50">
			<CardHeader class="flex flex-row items-center justify-between pb-2">
				<CardTitle class="text-sm font-medium">Current Weight</CardTitle>
				<Scale class="h-4 w-4 text-muted-foreground" />
			</CardHeader>
			<CardContent>
				<div class="text-2xl font-bold">
					{data.stats.currentWeight ? formatWeight(data.stats.currentWeight) : 'N/A'}
				</div>
			</CardContent>
		</Card>

		<Card class="border-none shadow-none bg-card/50">
			<CardHeader class="flex flex-row items-center justify-between pb-2">
				<CardTitle class="text-sm font-medium">Total Change</CardTitle>
				{#if data.stats.totalChange !== null}
					{#if data.stats.totalChange > 0}
						<TrendingUp class="h-4 w-4 text-orange-500" />
					{:else if data.stats.totalChange < 0}
						<TrendingDown class="h-4 w-4 text-emerald-500" />
					{:else}
						<BarChart3 class="h-4 w-4 text-muted-foreground" />
					{/if}
				{:else}
					<BarChart3 class="h-4 w-4 text-muted-foreground" />
				{/if}
			</CardHeader>
			<CardContent>
				<div class="text-2xl font-bold">
					{#if data.stats.totalChange !== null}
						{@const change = formatChange(data.stats.totalChange)}
						<span class={change.class}>{change.text}</span>
					{:else}
						N/A
					{/if}
				</div>
			</CardContent>
		</Card>

		<Card class="border-none shadow-none bg-card/50">
			<CardHeader class="flex flex-row items-center justify-between pb-2">
				<CardTitle class="text-sm font-medium">Average Weight</CardTitle>
				<BarChart3 class="h-4 w-4 text-muted-foreground" />
			</CardHeader>
			<CardContent>
				<div class="text-2xl font-bold">
					{data.stats.averageWeight ? formatWeight(data.stats.averageWeight) : 'N/A'}
				</div>
			</CardContent>
		</Card>

		<Card class="border-none shadow-none bg-card/50">
			<CardHeader class="flex flex-row items-center justify-between pb-2">
				<CardTitle class="text-sm font-medium">Total Entries</CardTitle>
				<Scale class="h-4 w-4 text-muted-foreground" />
			</CardHeader>
			<CardContent>
				<div class="text-2xl font-bold">{data.stats.totalEntries}</div>
			</CardContent>
		</Card>
	</div>

	<div class="grid gap-6 md:grid-cols-2">
		<!-- Chart -->
		<Card class="border-none shadow-none bg-card/50 md:col-span-2">
			<CardHeader>
				<CardTitle>Weight Progress</CardTitle>
			</CardHeader>
			<CardContent>
				{#if data.chartData.length === 0}
					<p class="text-muted-foreground text-sm">
						No data to display yet. Add your first weight entry!
					</p>
				{:else}
					<WeightChart data={data.chartData} />
				{/if}
			</CardContent>
		</Card>

		<!-- Add Entry Form -->
		<Card class="border-none shadow-none bg-card/50">
			<CardHeader>
				<CardTitle>Add Weight Entry</CardTitle>
			</CardHeader>
			<CardContent>
				<form
					method="POST"
					action="?/add"
					use:enhance={() => {
						isSubmitting = true;
						return async ({ update }) => {
							await update();
							weight = '';
							notes = '';
							isSubmitting = false;
						};
					}}
				>
					<div class="space-y-4">
						<div class="space-y-2">
							<Label for="weight">Weight (kg) *</Label>
							<Input
								id="weight"
								name="weight"
								type="number"
								step="0.1"
								min="1"
								max="999.99"
								bind:value={weight}
								placeholder="e.g., 75.5"
								required
								disabled={isSubmitting}
							/>
						</div>

						<div class="space-y-2">
							<Label for="notes">Notes (optional)</Label>
							<Textarea
								id="notes"
								name="notes"
								bind:value={notes}
								placeholder="Add any notes about this entry..."
								class="min-h-[60px]"
								disabled={isSubmitting}
							/>
						</div>

						{#if form?.error}
							<p class="text-sm text-destructive">{form.error}</p>
						{/if}

						<Button type="submit" class="w-full" disabled={isSubmitting}>
							{isSubmitting ? 'Adding...' : 'Add Entry'}
						</Button>
					</div>
				</form>
			</CardContent>
		</Card>

		<!-- History List -->
		<Card class="border-none shadow-none bg-card/50">
			<CardHeader>
				<CardTitle>History</CardTitle>
			</CardHeader>
			<CardContent>
				{#if data.history.length === 0}
					<p class="text-muted-foreground text-sm">No entries yet</p>
				{:else}
					<div class="space-y-3 max-h-[400px] overflow-y-auto">
						{#each data.history as entry (entry.id)}
							<div class="flex items-start justify-between border-b pb-3 last:border-0 last:pb-0">
								<div class="space-y-1">
									<p class="font-medium">{formatWeight(entry.weight)}</p>
									<p class="text-sm text-muted-foreground">
										{formatDate(entry.recordedAt)}
									</p>
									{#if entry.change !== null}
										{@const change = formatChange(entry.change)}
										{@const IconComponent = change.icon}
										<div class="flex items-center gap-1">
											<IconComponent class="h-3 w-3 {change.class}" />
											<span class="text-xs {change.class}">{change.text}</span>
										</div>
									{/if}
									{#if entry.notes}
										<p class="text-xs text-muted-foreground italic">{entry.notes}</p>
									{/if}
								</div>
								<form method="POST" action="?/delete" use:enhance>
									<input type="hidden" name="id" value={entry.id} />
									<Button type="submit" variant="ghost" size="icon" class="h-8 w-8">
										<Trash2 class="h-4 w-4" />
									</Button>
								</form>
							</div>
						{/each}
					</div>
				{/if}
			</CardContent>
		</Card>
	</div>
</div>
