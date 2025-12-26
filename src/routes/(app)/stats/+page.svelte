<script lang="ts">
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
	import * as Tabs from '$lib/components/ui/tabs';
	import {
		Scale,
		TrendingDown,
		TrendingUp,
		BarChart3,
		Dumbbell,
		Flame,
		Clock,
		Trophy,
		Target
	} from 'lucide-svelte';
	import WeightChart from './weight-chart.svelte';
	import {
		StatCard,
		RecentWorkoutsList,
		RecentPRsList,
		WeightEntryForm,
		WeightHistoryList,
		WorkoutHistoryList,
		PersonalRecordsList
	} from '$lib/components/stats';

	let { data, form } = $props();

	let activeTab = $state('overview');

	function formatWeight(w: number): string {
		return `${w.toFixed(1)} kg`;
	}

	function formatTotalDuration(minutes: number): string {
		const hours = Math.floor(minutes / 60);
		if (hours === 0) return `${minutes} min`;
		return `${hours} hrs`;
	}

	function formatDuration(minutes: number): string {
		if (minutes < 60) return `${minutes}m`;
		const hours = Math.floor(minutes / 60);
		const mins = minutes % 60;
		return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
	}

	function formatDate(date: Date): string {
		return new Date(date).toLocaleDateString('en-US', {
			month: 'short',
			day: 'numeric',
			year: 'numeric'
		});
	}

	function formatChange(change: number | null): { text: string; class: string } {
		if (change === null) return { text: 'N/A', class: 'text-muted-foreground' };
		const absChange = Math.abs(change);
		const sign = change > 0 ? '+' : '';
		if (change > 0) return { text: `${sign}${absChange.toFixed(1)} kg`, class: 'text-orange-500' };
		if (change < 0) return { text: `${change.toFixed(1)} kg`, class: 'text-emerald-500' };
		return { text: '0.0 kg', class: 'text-muted-foreground' };
	}
</script>

<div class="container mx-auto px-4 py-4 space-y-4 sm:px-6 sm:py-6 sm:space-y-6">
	<div>
		<h1 class="text-2xl font-bold sm:text-3xl">Stats & Progress</h1>
		<p class="text-sm text-muted-foreground sm:text-base">Track your fitness journey</p>
	</div>

	<Tabs.Root bind:value={activeTab}>
		<Tabs.List class="w-full grid grid-cols-4 h-auto">
			<Tabs.Trigger value="overview" class="text-xs px-1 py-2 sm:text-sm sm:px-2">
				<span class="hidden sm:inline">Overview</span>
				<span class="sm:hidden">Stats</span>
			</Tabs.Trigger>
			<Tabs.Trigger value="weight" class="text-xs px-1 py-2 sm:text-sm sm:px-2">
				<span class="hidden sm:inline">Body Weight</span>
				<span class="sm:hidden">Weight</span>
			</Tabs.Trigger>
			<Tabs.Trigger value="workouts" class="text-xs px-1 py-2 sm:text-sm sm:px-2">
				Workouts
			</Tabs.Trigger>
			<Tabs.Trigger value="strength" class="text-xs px-1 py-2 sm:text-sm sm:px-2">
				Strength
			</Tabs.Trigger>
		</Tabs.List>

		<!-- Overview Tab -->
		<Tabs.Content value="overview" class="space-y-4 mt-4 sm:space-y-6 sm:mt-6">
			<div class="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
				<StatCard title="Workouts" value={data.workoutStats.totalWorkouts} subtitle="sessions">
					{#snippet icon()}
						<Dumbbell class="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
					{/snippet}
				</StatCard>
				<StatCard
					title="Streak"
					value={data.workoutStats.currentStreak}
					subtitle={data.workoutStats.currentStreak === 1 ? 'day' : 'days'}
				>
					{#snippet icon()}
						<Flame class="h-3 w-3 sm:h-4 sm:w-4 text-orange-500" />
					{/snippet}
				</StatCard>
				<StatCard
					title="Time"
					value={formatTotalDuration(data.workoutStats.totalDuration)}
					subtitle="total"
				>
					{#snippet icon()}
						<Clock class="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
					{/snippet}
				</StatCard>
				<StatCard title="PRs" value={data.personalRecords.length} subtitle="achieved">
					{#snippet icon()}
						<Trophy class="h-3 w-3 sm:h-4 sm:w-4 text-yellow-500" />
					{/snippet}
				</StatCard>
			</div>

			<div class="grid gap-4 sm:gap-6 md:grid-cols-2">
				<RecentWorkoutsList workouts={data.recentWorkouts} />
				<RecentPRsList records={data.personalRecords} />
			</div>

			{#if data.weightStats.currentWeight}
				<Card class="border-none shadow-none bg-card/50">
					<CardHeader class="p-3 pb-2 sm:p-6 sm:pb-3">
						<CardTitle class="flex items-center gap-2 text-sm sm:text-base">
							<Scale class="h-4 w-4 sm:h-5 sm:w-5" />
							Body Weight
						</CardTitle>
					</CardHeader>
					<CardContent class="p-3 pt-0 sm:p-6 sm:pt-0">
						<div class="flex items-center gap-6 sm:gap-8">
							<div>
								<p class="text-2xl font-bold sm:text-3xl">
									{formatWeight(data.weightStats.currentWeight)}
								</p>
								<p class="text-xs text-muted-foreground sm:text-sm">current</p>
							</div>
							{#if data.weightStats.totalChange !== null}
								{@const change = formatChange(data.weightStats.totalChange)}
								<div>
									<p class="text-lg font-bold {change.class} sm:text-xl">{change.text}</p>
									<p class="text-xs text-muted-foreground sm:text-sm">change</p>
								</div>
							{/if}
						</div>
					</CardContent>
				</Card>
			{/if}
		</Tabs.Content>

		<!-- Body Weight Tab -->
		<Tabs.Content value="weight" class="space-y-4 mt-4 sm:space-y-6 sm:mt-6">
			<div class="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
				<StatCard
					title="Current"
					value={data.weightStats.currentWeight
						? formatWeight(data.weightStats.currentWeight)
						: 'N/A'}
				>
					{#snippet icon()}
						<Scale class="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
					{/snippet}
				</StatCard>
				<Card class="border-none shadow-none bg-card/50">
					<CardHeader class="flex flex-row items-center justify-between p-3 pb-1 sm:p-6 sm:pb-2">
						<CardTitle class="text-xs font-medium sm:text-sm">Change</CardTitle>
						{#if data.weightStats.totalChange !== null}
							{#if data.weightStats.totalChange > 0}
								<TrendingUp class="h-3 w-3 sm:h-4 sm:w-4 text-orange-500" />
							{:else if data.weightStats.totalChange < 0}
								<TrendingDown class="h-3 w-3 sm:h-4 sm:w-4 text-emerald-500" />
							{:else}
								<BarChart3 class="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
							{/if}
						{:else}
							<BarChart3 class="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
						{/if}
					</CardHeader>
					<CardContent class="p-3 pt-0 sm:p-6 sm:pt-0">
						<div class="text-xl font-bold sm:text-2xl">
							{#if data.weightStats.totalChange !== null}
								{@const change = formatChange(data.weightStats.totalChange)}
								<span class={change.class}>{change.text}</span>
							{:else}
								N/A
							{/if}
						</div>
					</CardContent>
				</Card>
				<StatCard
					title="Average"
					value={data.weightStats.averageWeight
						? formatWeight(data.weightStats.averageWeight)
						: 'N/A'}
				>
					{#snippet icon()}
						<BarChart3 class="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
					{/snippet}
				</StatCard>
				<StatCard title="Entries" value={data.weightStats.totalEntries}>
					{#snippet icon()}
						<Scale class="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
					{/snippet}
				</StatCard>
			</div>

			<Card class="border-none shadow-none bg-card/50">
				<CardHeader class="p-3 pb-2 sm:p-6 sm:pb-3">
					<CardTitle class="text-sm sm:text-base">Weight Progress</CardTitle>
				</CardHeader>
				<CardContent class="p-3 pt-0 sm:p-6 sm:pt-0">
					{#if data.weightChartData.length === 0}
						<p class="text-muted-foreground text-xs sm:text-sm">
							No data to display yet. Add your first weight entry!
						</p>
					{:else}
						<div class="h-[200px] sm:h-[300px]">
							<WeightChart data={data.weightChartData} />
						</div>
					{/if}
				</CardContent>
			</Card>

			<div class="grid gap-4 sm:gap-6 md:grid-cols-2">
				<WeightEntryForm error={form?.error} />
				<WeightHistoryList entries={data.weightHistory} />
			</div>
		</Tabs.Content>

		<!-- Workouts Tab -->
		<Tabs.Content value="workouts" class="space-y-4 mt-4 sm:space-y-6 sm:mt-6">
			<div class="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
				<StatCard title="Total" value={data.workoutStats.totalWorkouts} subtitle="sessions">
					{#snippet icon()}
						<Dumbbell class="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
					{/snippet}
				</StatCard>
				<StatCard
					title="Time"
					value={formatTotalDuration(data.workoutStats.totalDuration)}
					subtitle="total"
				>
					{#snippet icon()}
						<Clock class="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
					{/snippet}
				</StatCard>
				<StatCard
					title="Average"
					value={data.workoutStats.averageDuration > 0
						? formatDuration(Math.round(data.workoutStats.averageDuration))
						: '--'}
					subtitle="per session"
				>
					{#snippet icon()}
						<Target class="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
					{/snippet}
				</StatCard>
				<StatCard
					title="Streak"
					value={data.workoutStats.currentStreak}
					subtitle={data.workoutStats.currentStreak === 1 ? 'day' : 'days'}
				>
					{#snippet icon()}
						<Flame class="h-3 w-3 sm:h-4 sm:w-4 text-orange-500" />
					{/snippet}
				</StatCard>
			</div>

			{#if data.workoutStats.lastWorkoutDate}
				<Card class="border-none shadow-none bg-card/50">
					<CardHeader class="p-3 pb-2 sm:p-6 sm:pb-3">
						<CardTitle class="text-sm sm:text-base">Last Workout</CardTitle>
					</CardHeader>
					<CardContent class="p-3 pt-0 sm:p-6 sm:pt-0">
						<p class="text-base sm:text-lg">
							{formatDate(data.workoutStats.lastWorkoutDate)}
						</p>
					</CardContent>
				</Card>
			{/if}

			<WorkoutHistoryList workouts={data.recentWorkouts} />
		</Tabs.Content>

		<!-- Strength Tab -->
		<Tabs.Content value="strength" class="space-y-4 mt-4 sm:space-y-6 sm:mt-6">
			<div class="grid grid-cols-3 gap-3 sm:gap-4">
				<StatCard title="PRs" value={data.personalRecords.length} subtitle="records">
					{#snippet icon()}
						<Trophy class="h-3 w-3 sm:h-4 sm:w-4 text-yellow-500" />
					{/snippet}
				</StatCard>
				{#if data.personalRecords.length > 0}
					{@const topPR = data.personalRecords.reduce((max, pr) =>
						pr.oneRepMax > max.oneRepMax ? pr : max
					)}
					<Card class="border-none shadow-none bg-card/50">
						<CardHeader class="flex flex-row items-center justify-between p-3 pb-1 sm:p-6 sm:pb-2">
							<CardTitle class="text-xs font-medium sm:text-sm">Best</CardTitle>
							<Dumbbell class="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
						</CardHeader>
						<CardContent class="p-3 pt-0 sm:p-6 sm:pt-0">
							<div class="text-xl font-bold sm:text-2xl">
								{Math.round(topPR.oneRepMax)}<span class="text-sm sm:text-base">kg</span>
							</div>
							<p class="text-[10px] text-muted-foreground truncate sm:text-xs">
								{topPR.exercise.name}
							</p>
						</CardContent>
					</Card>

					{@const muscleGroups = [
						...new Set(data.personalRecords.map((pr) => pr.exercise.muscleGroup))
					]}
					<StatCard title="Groups" value={muscleGroups.length} subtitle="muscles">
						{#snippet icon()}
							<Target class="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
						{/snippet}
					</StatCard>
				{/if}
			</div>

			<PersonalRecordsList records={data.personalRecords} />
		</Tabs.Content>
	</Tabs.Root>
</div>
