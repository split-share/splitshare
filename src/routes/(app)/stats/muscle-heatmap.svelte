<script lang="ts">
	import { LineChart } from 'layerchart';
	import { curveLinearClosed } from 'd3-shape';
	import { scaleBand } from 'd3-scale';
	import * as Chart from '$lib/components/ui/chart';
	import {
		Card,
		CardContent,
		CardHeader,
		CardTitle,
		CardDescription
	} from '$lib/components/ui/card';
	import { Target } from 'lucide-svelte';
	import type { MuscleHeatmapDataDto } from '$core/domain/workout/muscle-heatmap.dto';

	interface Props {
		data: MuscleHeatmapDataDto;
	}

	let { data }: Props = $props();

	// Color palette for muscle groups
	const muscleColors: Record<string, string> = {
		Chest: 'var(--chart-1)',
		Back: 'var(--chart-2)',
		Shoulders: 'var(--chart-3)',
		Biceps: 'var(--chart-4)',
		Triceps: 'var(--chart-5)',
		Legs: 'hsl(280 65% 60%)',
		Quads: 'hsl(200 70% 50%)',
		Hamstrings: 'hsl(340 75% 55%)',
		Calves: 'hsl(160 60% 45%)',
		Glutes: 'hsl(30 80% 55%)',
		Core: 'hsl(180 50% 50%)',
		Abs: 'hsl(260 60% 55%)',
		Cardio: 'hsl(0 70% 55%)',
		'Full Body': 'hsl(220 60% 50%)'
	};

	// Get day name from date string
	const getDayName = (dateStr: string): string => {
		const date = new Date(dateStr + 'T12:00:00');
		return date.toLocaleDateString('en-US', { weekday: 'short' });
	};

	// Transform data: days on corners, muscle groups as series
	// Each data point has day + sets value for each muscle group
	const chartData = $derived(() => {
		return data.dates.map((dateStr) => {
			const point: Record<string, string | number> = {
				day: getDayName(dateStr)
			};

			// Add sets for each muscle group
			data.muscleGroups.forEach((muscleGroup) => {
				const cell = data.cells.find((c) => c.date === dateStr && c.muscleGroup === muscleGroup);
				point[muscleGroup] = cell?.totalSets ?? 0;
			});

			return point;
		});
	});

	// Get muscle groups that have any training data
	const activeMuscleGroups = $derived(() => {
		return data.muscleGroups.filter((muscleGroup) =>
			data.cells.some((c) => c.muscleGroup === muscleGroup && c.totalSets > 0)
		);
	});

	// Build chart config with colors for active muscle groups
	const chartConfig = $derived(() => {
		const config: Chart.ChartConfig = {};
		activeMuscleGroups().forEach((muscleGroup) => {
			config[muscleGroup] = {
				label: muscleGroup,
				color: muscleColors[muscleGroup] || 'var(--chart-1)'
			};
		});
		return config;
	});

	// Build series array for active muscle groups
	const chartSeries = $derived(() => {
		return activeMuscleGroups().map((muscleGroup) => ({
			key: muscleGroup,
			label: muscleGroup,
			color: muscleColors[muscleGroup] || 'var(--chart-1)',
			props: {
				fill: muscleColors[muscleGroup] || 'var(--chart-1)',
				fillOpacity: 0.2
			}
		}));
	});

	// Get total sets trained this week
	const totalWeekSets = $derived(data.cells.reduce((sum, c) => sum + c.totalSets, 0));

	// Get number of muscle groups trained
	const muscleGroupsTrained = $derived(activeMuscleGroups().length);
</script>

<Card class="border-none shadow-none bg-card/50">
	<CardHeader class="p-3 pb-2 sm:p-6 sm:pb-3 items-center">
		<CardTitle class="flex items-center gap-2 text-sm sm:text-base">
			<Target class="h-4 w-4 sm:h-5 sm:w-5" />
			Weekly Training Balance
		</CardTitle>
		<CardDescription class="text-xs sm:text-sm">
			Muscle groups trained in the past 7 days
		</CardDescription>
	</CardHeader>
	<CardContent class="p-3 pt-0 sm:p-6 sm:pt-0">
		{#if data.maxSets === 0 || activeMuscleGroups().length === 0}
			<p class="text-muted-foreground text-xs sm:text-sm text-center py-8">
				No workout data for the past week. Start logging workouts to see your training balance!
			</p>
		{:else}
			<div class="h-[280px] sm:h-[320px] w-full">
				<Chart.Container config={chartConfig()} class="h-full w-full">
					<LineChart
						data={chartData()}
						series={chartSeries()}
						radial
						x="day"
						xScale={scaleBand()}
						padding={40}
						props={{
							spline: {
								curve: curveLinearClosed,
								strokeWidth: 2,
								motion: 'tween'
							},
							xAxis: {
								tickLength: 0
							},
							yAxis: {
								format: () => ''
							},
							grid: {
								radialY: 'linear'
							},
							tooltip: {
								context: {
									mode: 'voronoi'
								}
							},
							highlight: {
								lines: false,
								points: { r: 4 }
							}
						}}
					>
						{#snippet tooltip()}
							<Chart.Tooltip />
						{/snippet}
					</LineChart>
				</Chart.Container>
			</div>

			<!-- Legend for active muscle groups -->
			<div class="flex flex-wrap justify-center gap-3 mt-4">
				{#each activeMuscleGroups() as muscleGroup (muscleGroup)}
					<div class="flex items-center gap-1.5 text-xs">
						<div
							class="w-3 h-3 rounded-full"
							style="background-color: {muscleColors[muscleGroup] || 'var(--chart-1)'}"
						></div>
						<span class="text-muted-foreground">{muscleGroup}</span>
					</div>
				{/each}
			</div>

			<div class="flex justify-center gap-6 mt-4 text-xs sm:text-sm text-muted-foreground">
				<div class="text-center">
					<p class="text-lg sm:text-xl font-bold text-foreground">{totalWeekSets}</p>
					<p>Total Sets</p>
				</div>
				<div class="text-center">
					<p class="text-lg sm:text-xl font-bold text-foreground">{muscleGroupsTrained}</p>
					<p>Muscle Groups</p>
				</div>
			</div>
		{/if}
	</CardContent>
</Card>
