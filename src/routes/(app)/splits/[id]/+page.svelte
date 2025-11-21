<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import {
		Card,
		CardContent,
		CardDescription,
		CardHeader,
		CardTitle
	} from '$lib/components/ui/card';
	import Badge from '$lib/components/ui/badge.svelte';
	import { Label } from '$lib/components/ui/label';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const { split } = data;
	const isOwner = $derived(data.user?.id === split.author.id);
</script>

<div class="container mx-auto px-4 py-8 max-w-6xl">
	<!-- Header -->
	<div class="mb-8">
		<div class="flex items-start justify-between gap-4">
			<div class="flex-1">
				<div class="flex items-center gap-3 mb-2">
					<h1 class="text-4xl font-bold">{split.split.title}</h1>
					<Badge variant={split.split.isPublic ? 'default' : 'secondary'}>
						{split.split.isPublic ? 'Public' : 'Private'}
					</Badge>
				</div>
				{#if split.split.description}
					<p class="text-lg text-muted-foreground mb-4">{split.split.description}</p>
				{/if}
				<div class="flex items-center gap-4 text-sm text-muted-foreground">
					<span>By {split.author.name}</span>
					<span>•</span>
					<Badge variant="outline">{split.split.difficulty}</Badge>
					{#if split.split.duration}
						<span>•</span>
						<span>{split.split.duration} min</span>
					{/if}
				</div>
			</div>

			{#if isOwner}
				<div class="flex gap-2">
					<Button variant="outline" href="/splits/{split.split.id}/edit">Edit</Button>
					<Button variant="destructive">Delete</Button>
				</div>
			{/if}
		</div>

		<!-- Tags -->
		{#if split.split.tags && split.split.tags.length > 0}
			<div class="mt-4 flex flex-wrap gap-2">
				{#each split.split.tags as tag (tag)}
					<Badge variant="secondary">{tag}</Badge>
				{/each}
			</div>
		{/if}

		<!-- Image -->
		{#if split.split.imageUrl}
			<div class="mt-6 rounded-lg overflow-hidden border">
				<img src={split.split.imageUrl} alt={split.split.title} class="w-full h-64 object-cover" />
			</div>
		{/if}
	</div>

	<!-- Stats -->
	<div class="grid grid-cols-3 gap-4 mb-8">
		<Card>
			<CardContent class="pt-6">
				<div class="text-center">
					<div class="text-3xl font-bold">{split.days.length}</div>
					<div class="text-sm text-muted-foreground">Days</div>
				</div>
			</CardContent>
		</Card>
		<Card>
			<CardContent class="pt-6">
				<div class="text-center">
					<div class="text-3xl font-bold">{split.likesCount}</div>
					<div class="text-sm text-muted-foreground">Likes</div>
				</div>
			</CardContent>
		</Card>
		<Card>
			<CardContent class="pt-6">
				<div class="text-center">
					<div class="text-3xl font-bold">{split.commentsCount}</div>
					<div class="text-sm text-muted-foreground">Comments</div>
				</div>
			</CardContent>
		</Card>
	</div>

	<!-- Workout Days -->
	<div class="space-y-6">
		<h2 class="text-2xl font-bold">Workout Schedule</h2>

		{#each split.days as day (day.id)}
			<Card>
				<CardHeader>
					<div class="flex items-center justify-between">
						<div>
							<CardTitle>{day.name}</CardTitle>
							<CardDescription>Day {day.dayNumber}</CardDescription>
						</div>
						{#if day.isRestDay}
							<Badge variant="secondary">Rest Day</Badge>
						{:else}
							<Badge variant="outline">{day.exercises.length} exercises</Badge>
						{/if}
					</div>
				</CardHeader>
				{#if !day.isRestDay && day.exercises.length > 0}
					<CardContent>
						<div class="space-y-4">
							{#each day.exercises as dayExercise (dayExercise.id)}
								<div class="rounded-lg border p-4 hover:bg-muted/50 transition-colors">
									<div class="flex items-start justify-between gap-4">
										<div class="flex-1">
											<div class="flex items-start gap-3">
												<div
													class="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-medium"
												>
													{dayExercise.order + 1}
												</div>
												<div class="flex-1">
													<h4 class="font-semibold text-lg mb-1">
														{dayExercise.exercise.name}
													</h4>
													{#if dayExercise.exercise.description}
														<p class="text-sm text-muted-foreground mb-3">
															{dayExercise.exercise.description}
														</p>
													{/if}

													<div class="flex flex-wrap gap-3 mb-3">
														<div class="flex items-center gap-1.5">
															<span class="text-sm font-medium">Sets:</span>
															<Badge variant="secondary">{dayExercise.sets}</Badge>
														</div>
														<div class="flex items-center gap-1.5">
															<span class="text-sm font-medium">Reps:</span>
															<Badge variant="secondary">{dayExercise.reps}</Badge>
														</div>
														{#if dayExercise.restTime}
															<div class="flex items-center gap-1.5">
																<span class="text-sm font-medium">Rest:</span>
																<Badge variant="secondary">{dayExercise.restTime}s</Badge>
															</div>
														{/if}
													</div>

													<div class="flex flex-wrap gap-2">
														<Badge variant="outline">{dayExercise.exercise.muscleGroup}</Badge>
														<Badge variant="outline">{dayExercise.exercise.equipmentType}</Badge>
														<Badge variant="outline">{dayExercise.exercise.difficulty}</Badge>
													</div>

													{#if dayExercise.notes}
														<div class="mt-3 rounded bg-muted p-2">
															<Label class="text-xs text-muted-foreground">Notes</Label>
															<p class="text-sm">{dayExercise.notes}</p>
														</div>
													{/if}
												</div>
											</div>
										</div>

										{#if dayExercise.exercise.imageUrl}
											<div class="rounded overflow-hidden border w-24 h-24">
												<img
													src={dayExercise.exercise.imageUrl}
													alt={dayExercise.exercise.name}
													class="w-full h-full object-cover"
												/>
											</div>
										{/if}
									</div>

									{#if dayExercise.exercise.videoUrl}
										<div class="mt-3 pt-3 border-t">
											<a
												href={dayExercise.exercise.videoUrl}
												target="_blank"
												rel="noopener noreferrer"
												class="text-sm text-primary hover:underline flex items-center gap-1"
											>
												<svg
													xmlns="http://www.w3.org/2000/svg"
													width="16"
													height="16"
													viewBox="0 0 24 24"
													fill="none"
													stroke="currentColor"
													stroke-width="2"
													stroke-linecap="round"
													stroke-linejoin="round"
												>
													<path d="m22 2-7 20-4-9-9-4Z" />
													<path d="M22 2 11 13" />
												</svg>
												Watch video demonstration
											</a>
										</div>
									{/if}
								</div>
							{/each}
						</div>
					</CardContent>
				{/if}
			</Card>
		{/each}
	</div>

	<!-- Action Buttons -->
	<div class="mt-8 flex justify-center gap-4">
		<Button href="/splits">Back to Splits</Button>
		{#if split.split.isPublic}
			<Button variant="outline">Clone Split</Button>
		{/if}
	</div>
</div>
