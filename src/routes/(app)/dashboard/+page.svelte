<script lang="ts">
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
	import Badge from '$lib/components/ui/badge.svelte';
	import { Activity, TrendingUp, Calendar, Award } from 'lucide-svelte';

	let { data } = $props();

	function formatDate(date: Date): string {
		return new Date(date).toLocaleDateString('en-US', {
			month: 'short',
			day: 'numeric',
			year: 'numeric'
		});
	}

	function formatDuration(minutes: number | null): string {
		if (!minutes) return 'N/A';
		const hours = Math.floor(minutes / 60);
		const mins = minutes % 60;
		if (hours > 0) {
			return `${hours}h ${mins}m`;
		}
		return `${mins}m`;
	}
</script>

<div class="container mx-auto p-6 space-y-6">
	<div>
		<h1 class="text-3xl font-bold">Dashboard</h1>
		<p class="text-muted-foreground">Track your fitness journey</p>
	</div>

	<!-- Stats Cards -->
	<div class="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
		<Card>
			<CardHeader class="flex flex-row items-center justify-between pb-2">
				<CardTitle class="text-sm font-medium">Total Workouts</CardTitle>
				<Activity class="h-4 w-4 text-muted-foreground" />
			</CardHeader>
			<CardContent>
				<div class="text-2xl font-bold">{data.stats.totalWorkouts}</div>
			</CardContent>
		</Card>

		<Card>
			<CardHeader class="flex flex-row items-center justify-between pb-2">
				<CardTitle class="text-sm font-medium">Current Streak</CardTitle>
				<TrendingUp class="h-4 w-4 text-muted-foreground" />
			</CardHeader>
			<CardContent>
				<div class="text-2xl font-bold">{data.stats.currentStreak} days</div>
			</CardContent>
		</Card>

		<Card>
			<CardHeader class="flex flex-row items-center justify-between pb-2">
				<CardTitle class="text-sm font-medium">Total Time</CardTitle>
				<Calendar class="h-4 w-4 text-muted-foreground" />
			</CardHeader>
			<CardContent>
				<div class="text-2xl font-bold">{formatDuration(data.stats.totalDuration)}</div>
			</CardContent>
		</Card>

		<Card>
			<CardHeader class="flex flex-row items-center justify-between pb-2">
				<CardTitle class="text-sm font-medium">Avg Duration</CardTitle>
				<Activity class="h-4 w-4 text-muted-foreground" />
			</CardHeader>
			<CardContent>
				<div class="text-2xl font-bold">{formatDuration(data.stats.averageDuration)}</div>
			</CardContent>
		</Card>
	</div>

	<div class="grid gap-6 md:grid-cols-2">
		<!-- Recent Workouts -->
		<Card>
			<CardHeader>
				<CardTitle>Recent Workouts</CardTitle>
			</CardHeader>
			<CardContent>
				{#if data.workoutHistory.length === 0}
					<p class="text-muted-foreground text-sm">No workouts logged yet</p>
				{:else}
					<div class="space-y-4">
						{#each data.workoutHistory as workout (workout.id)}
							<div class="flex items-start justify-between border-b pb-4 last:border-0 last:pb-0">
								<div class="space-y-1">
									<p class="font-medium">{workout.split.title} - {workout.day.name}</p>
									<p class="text-sm text-muted-foreground">
										{formatDate(workout.completedAt)}
									</p>
									<div class="flex gap-2 flex-wrap">
										{#each workout.exercises as exercise (exercise.id)}
											<Badge variant="secondary" class="text-xs">
												{exercise.exercise.name}
											</Badge>
										{/each}
									</div>
								</div>
								{#if workout.duration}
									<p class="text-sm text-muted-foreground whitespace-nowrap">
										{formatDuration(workout.duration)}
									</p>
								{/if}
							</div>
						{/each}
					</div>
				{/if}
			</CardContent>
		</Card>

		<!-- Personal Records -->
		<Card>
			<CardHeader class="flex flex-row items-center justify-between">
				<CardTitle>Personal Records</CardTitle>
				<Award class="h-5 w-5 text-yellow-500" />
			</CardHeader>
			<CardContent>
				{#if data.personalRecords.length === 0}
					<p class="text-muted-foreground text-sm">No personal records yet</p>
				{:else}
					<div class="space-y-4">
						{#each data.personalRecords.slice(0, 5) as pr (pr.id)}
							<div class="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
								<div class="space-y-1">
									<p class="font-medium">{pr.exercise.name}</p>
									<p class="text-sm text-muted-foreground">{pr.exercise.muscleGroup}</p>
								</div>
								<div class="text-right">
									<p class="font-bold">{pr.weight}kg × {pr.reps}</p>
									<p class="text-xs text-muted-foreground">
										Est. 1RM: {pr.oneRepMax.toFixed(1)}kg
									</p>
								</div>
							</div>
						{/each}
					</div>
				{/if}
			</CardContent>
		</Card>
	</div>
</div>
