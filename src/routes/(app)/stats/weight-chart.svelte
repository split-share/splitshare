<script lang="ts">
	import { LineChart } from 'layerchart';
	import { scaleUtc } from 'd3-scale';
	import { curveNatural } from 'd3-shape';
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
</script>

{#if chartData.length > 0}
	<Chart.Container config={chartConfig} class="aspect-auto h-[300px] w-full">
		<LineChart
			points={{ r: 4 }}
			labels={{ offset: 12 }}
			data={chartData}
			x="date"
			xScale={scaleUtc()}
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
					format: (v: Date) => v.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
				},
				yAxis: {
					format: (v: number) => `${v.toFixed(1)} kg`
				},
				highlight: {
					points: {
						motion: 'none',
						r: 6
					}
				}
			}}
		>
			{#snippet tooltip()}
				<Chart.Tooltip
					labelFormatter={(v: Date) => {
						return v.toLocaleDateString('en-US', {
							month: 'long',
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
	<div class="flex h-[300px] w-full items-center justify-center text-muted-foreground">
		No data available
	</div>
{/if}
