<script lang="ts">
	import { LineChart } from 'layerchart';
	import { scaleUtc } from 'd3-scale';
	import { curveNatural } from 'd3-shape';
	import { timeDay } from 'd3-time';
	import * as Chart from '$lib/components/ui/chart';
	import type { WeightChartDataDto } from '$core/domain/weight/weight-entry.dto';

	let { data }: { data: WeightChartDataDto[] } = $props();

	const chartConfig = {
		weight: {
			label: 'Weight',
			color: 'var(--chart-1)'
		}
	} satisfies Chart.ChartConfig;

	// Transform data for LayerChart
	const chartData = $derived(
		data.map((d) => ({
			date: new Date(d.date),
			weight: d.weight
		}))
	);

	// Generate unique date ticks (max ~7 ticks for readability)
	const xTicks = $derived(() => {
		if (chartData.length === 0) return [];
		const dates = chartData.map((d) => d.date);
		const step = Math.max(1, Math.ceil(dates.length / 7));
		return dates.filter((_, i) => i % step === 0);
	});
</script>

{#if chartData.length > 0}
	<Chart.Container config={chartConfig} class="aspect-auto h-full w-full">
		<LineChart
			points={{ r: 3 }}
			labels={{ offset: 8 }}
			data={chartData}
			x="date"
			xScale={scaleUtc().nice(timeDay)}
			yDomain={[40, null]}
			axis="x"
			series={[
				{
					key: 'weight',
					label: 'Weight',
					color: chartConfig.weight.color
				}
			]}
			props={{
				spline: { curve: curveNatural, motion: 'tween', strokeWidth: 2 },
				xAxis: {
					ticks: xTicks(),
					format: (v: Date) => v.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
				},
				yAxis: {
					format: (v: number) => `${v.toFixed(0)}kg`
				},
				highlight: {
					points: {
						motion: 'none',
						r: 5
					}
				}
			}}
		>
			{#snippet tooltip()}
				<Chart.Tooltip
					labelFormatter={(v: Date) => {
						return v.toLocaleDateString('en-US', {
							month: 'short',
							day: 'numeric',
							year: 'numeric'
						});
					}}
					indicator="line"
				/>
			{/snippet}
		</LineChart>
	</Chart.Container>
{:else}
	<div class="flex h-full w-full items-center justify-center text-muted-foreground text-sm">
		No data available
	</div>
{/if}
