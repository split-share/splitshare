<script lang="ts">
	import { enhance } from '$app/forms';
	import { Button } from '$lib/components/ui/button';
	import {
		Card,
		CardContent,
		CardDescription,
		CardHeader,
		CardTitle
	} from '$lib/components/ui/card';
	import * as Tabs from '$lib/components/ui/tabs';
	import Badge from '$lib/components/ui/badge.svelte';
	import { Label } from '$lib/components/ui/label';
	import { Textarea } from '$lib/components/ui/textarea';
	import { Heart, MessageSquare, Trash2, Edit2, Share2, Play, Star } from 'lucide-svelte';
	import ExerciseGif from '$lib/components/exercise-gif.svelte';
	import ReviewForm from '$lib/components/split/review-form.svelte';
	import ReviewList from '$lib/components/split/review-list.svelte';
	import ReviewStats from '$lib/components/split/review-stats.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const split = $derived(data.split);
	const isOwner = $derived(data.user?.id === split.author.id);
	const isAuthenticated = $derived(!!data.user);

	let newComment = $state('');
	let editingCommentId = $state<string | null>(null);
	let editingCommentContent = $state('');

	function startEditing(commentId: string, currentContent: string) {
		editingCommentId = commentId;
		editingCommentContent = currentContent;
	}

	function cancelEditing() {
		editingCommentId = null;
		editingCommentContent = '';
	}

	function formatDate(date: Date): string {
		return new Date(date).toLocaleDateString('en-US', {
			month: 'short',
			day: 'numeric',
			year: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});
	}
</script>

<div class="container mx-auto px-4 py-4 sm:py-8 max-w-6xl">
	<!-- Header -->
	<div class="mb-4 sm:mb-6">
		<div class="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4">
			<div class="flex-1 min-w-0">
				<div class="flex items-start gap-2 sm:gap-3 mb-2">
					<h1 class="text-2xl sm:text-4xl font-bold">{split.split.title}</h1>
					<Badge
						variant={split.split.isPublic ? 'default' : 'secondary'}
						class="flex-shrink-0 mt-1"
					>
						{split.split.isPublic ? 'Public' : 'Private'}
					</Badge>
				</div>
				{#if split.split.description}
					<p class="text-sm sm:text-lg text-muted-foreground mb-2 sm:mb-3">
						{split.split.description}
					</p>
				{/if}
				<div
					class="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-muted-foreground"
				>
					<span>By {split.author.name}</span>
					<span>•</span>
					<Badge variant="outline" class="text-xs">{split.split.difficulty}</Badge>
					{#if split.split.duration}
						<span>•</span>
						<span>{split.split.duration} min</span>
					{/if}
				</div>
			</div>

			{#if isOwner}
				<div class="flex gap-2 w-full sm:w-auto">
					<Button
						variant="outline"
						href="/splits/{split.split.id}/edit"
						class="flex-1 sm:flex-none"
					>
						<Edit2 class="h-4 w-4 mr-2" />
						Edit
					</Button>
					<Button variant="destructive" class="flex-1 sm:flex-none">
						<Trash2 class="h-4 w-4 mr-2" />
						Delete
					</Button>
				</div>
			{/if}
		</div>

		<!-- Tags -->
		{#if split.split.tags && split.split.tags.length > 0}
			<div class="mt-3 flex flex-wrap gap-2">
				{#each split.split.tags as tag (tag)}
					<Badge variant="secondary" class="text-xs">{tag}</Badge>
				{/each}
			</div>
		{/if}
	</div>

	<!-- Engagement Stats -->
	<div class="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4 mb-4 sm:mb-6">
		<Card class="border-none shadow-none bg-card/50">
			<CardContent class="p-3 sm:pt-6">
				<div class="flex items-center gap-2 sm:gap-3">
					<Heart class="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground flex-shrink-0" />
					<div>
						<div class="text-xl sm:text-2xl font-bold">{data.likes.length}</div>
						<div class="text-[10px] sm:text-xs text-muted-foreground">Likes</div>
					</div>
				</div>
			</CardContent>
		</Card>
		<Card class="border-none shadow-none bg-card/50">
			<CardContent class="p-3 sm:pt-6">
				<div class="flex items-center gap-2 sm:gap-3">
					<MessageSquare class="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground flex-shrink-0" />
					<div>
						<div class="text-xl sm:text-2xl font-bold">{data.comments.length}</div>
						<div class="text-[10px] sm:text-xs text-muted-foreground">Comments</div>
					</div>
				</div>
			</CardContent>
		</Card>
		<Card class="border-none shadow-none bg-card/50">
			<CardContent class="p-3 sm:pt-6">
				<div class="flex items-center gap-2 sm:gap-3">
					<Star class="h-4 w-4 sm:h-5 sm:w-5 text-yellow-400 flex-shrink-0" />
					<div>
						<div class="text-xl sm:text-2xl font-bold">
							{data.reviewStats.averageRating.toFixed(1)}
						</div>
						<div class="text-[10px] sm:text-xs text-muted-foreground">Rating</div>
					</div>
				</div>
			</CardContent>
		</Card>
		<Card class="border-none shadow-none bg-card/50">
			<CardContent class="p-3 sm:pt-6">
				<div class="flex items-center gap-2 sm:gap-3">
					<Share2 class="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground flex-shrink-0" />
					<div>
						<div class="text-xl sm:text-2xl font-bold">{split.days.length}</div>
						<div class="text-[10px] sm:text-xs text-muted-foreground">Days</div>
					</div>
				</div>
			</CardContent>
		</Card>
	</div>

	<!-- Like Button -->
	{#if isAuthenticated}
		<div class="mb-4 sm:mb-6">
			<form method="POST" action={data.hasUserLiked ? '?/unlike' : '?/like'} use:enhance>
				<Button
					type="submit"
					variant={data.hasUserLiked ? 'default' : 'outline'}
					size="lg"
					class="w-full sm:w-auto"
				>
					<Heart class={data.hasUserLiked ? 'h-5 w-5 mr-2 fill-current' : 'h-5 w-5 mr-2'} />
					{data.hasUserLiked ? 'Unlike' : 'Like'} this Split
				</Button>
			</form>
		</div>
	{/if}

	<!-- Split Image -->
	{#if split.split.imageUrl}
		<div class="mb-6 rounded-lg overflow-hidden border">
			<img src={split.split.imageUrl} alt={split.split.title} class="w-full h-64 object-cover" />
		</div>
	{/if}

	<!-- Tabs: Workout, Reviews & Comments -->
	<Tabs.Root value="workout" class="w-full">
		<Tabs.List class="grid w-full grid-cols-3">
			<Tabs.Trigger value="workout">Workout</Tabs.Trigger>
			<Tabs.Trigger value="reviews">Reviews ({data.reviewStats.totalReviews})</Tabs.Trigger>
			<Tabs.Trigger value="comments">Comments ({data.comments.length})</Tabs.Trigger>
		</Tabs.List>

		<!-- Workout Tab -->
		<Tabs.Content value="workout" class="mt-4 sm:mt-6">
			<div class="space-y-4 sm:space-y-6">
				{#each split.days as day (day.id)}
					<Card>
						<CardHeader class="p-4 sm:p-6">
							<div
								class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4"
							>
								<div>
									<CardTitle class="text-lg sm:text-xl">{day.name}</CardTitle>
									<CardDescription class="text-xs sm:text-sm">Day {day.dayNumber}</CardDescription>
								</div>
								<div class="flex items-center gap-2 flex-wrap">
									{#if day.isRestDay}
										<Badge variant="secondary">Rest Day</Badge>
									{:else}
										<Badge variant="outline" class="text-xs">{day.exercises.length} exercises</Badge
										>
										{#if isAuthenticated}
											<Button
												size="sm"
												href="/workout?splitId={split.split.id}&dayId={day.id}"
												class="h-9"
											>
												<Play class="h-4 w-4 mr-1" />
												Start
											</Button>
										{/if}
									{/if}
								</div>
							</div>
						</CardHeader>
						{#if !day.isRestDay && day.exercises.length > 0}
							<CardContent class="p-3 sm:p-6">
								<div class="space-y-3 sm:space-y-4">
									{#each day.exercises as dayExercise (dayExercise.id)}
										<div class="rounded-lg border p-3 sm:p-4 hover:bg-muted/50 transition-colors">
											<div
												class="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4"
											>
												<div class="flex-1 min-w-0">
													<div class="flex items-start gap-2 sm:gap-3">
														<div
															class="flex h-6 w-6 sm:h-8 sm:w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs sm:text-sm font-medium shrink-0"
														>
															{dayExercise.order + 1}
														</div>
														<div class="flex-1 min-w-0">
															<h4 class="font-semibold text-base sm:text-lg mb-1">
																{dayExercise.exercise.name}
															</h4>
															{#if dayExercise.exercise.description}
																<p
																	class="text-xs sm:text-sm text-muted-foreground mb-2 sm:mb-3 line-clamp-2"
																>
																	{dayExercise.exercise.description}
																</p>
															{/if}

															<div class="flex flex-wrap gap-2 sm:gap-3 mb-2 sm:mb-3">
																<div class="flex items-center gap-1">
																	<Badge variant="secondary" class="text-xs"
																		>{dayExercise.sets}×{dayExercise.reps}</Badge
																	>
																</div>
																{#if dayExercise.weight}
																	<Badge variant="secondary" class="text-xs"
																		>{dayExercise.weight}kg</Badge
																	>
																{/if}
																{#if dayExercise.restTime}
																	<Badge variant="secondary" class="text-xs"
																		>{dayExercise.restTime}s rest</Badge
																	>
																{/if}
															</div>

															<div class="flex flex-wrap gap-1.5 sm:gap-2">
																<Badge variant="outline" class="text-xs"
																	>{dayExercise.exercise.muscleGroup}</Badge
																>
																<Badge variant="outline" class="text-xs"
																	>{dayExercise.exercise.equipmentType}</Badge
																>
															</div>

															{#if dayExercise.notes}
																<div class="mt-2 sm:mt-3 rounded bg-muted p-2">
																	<Label class="text-xs text-muted-foreground">Notes</Label>
																	<p class="text-xs sm:text-sm">{dayExercise.notes}</p>
																</div>
															{/if}
														</div>
													</div>
												</div>

												<ExerciseGif
													exerciseName={dayExercise.exercise.name}
													gifUrl={dayExercise.exercise.gifUrl}
													class="w-20 h-20 sm:w-24 sm:h-24 shrink-0 self-center sm:self-start"
												/>
											</div>
										</div>
									{/each}
								</div>
							</CardContent>
						{/if}
					</Card>
				{/each}
			</div>
		</Tabs.Content>

		<!-- Reviews Tab -->
		<Tabs.Content value="reviews" class="mt-6">
			<div class="space-y-6">
				<!-- Review Stats -->
				{#if data.reviewStats.totalReviews > 0}
					<ReviewStats stats={data.reviewStats} />
				{/if}

				<!-- Review Form -->
				{#if isAuthenticated && !data.userReview}
					<ReviewForm isEligible={data.isEligibleToReview} />
				{:else if isAuthenticated && data.userReview}
					<ReviewForm existingReview={data.userReview} isEligible={true} />
				{:else}
					<Card>
						<CardContent class="pt-6">
							<p class="text-muted-foreground text-center">
								<a href="/login" class="text-primary hover:underline">Sign in</a> to leave a review
							</p>
						</CardContent>
					</Card>
				{/if}

				<!-- Reviews List -->
				<ReviewList reviews={data.reviews} currentUserId={data.user?.id} />
			</div>
		</Tabs.Content>

		<!-- Comments Tab -->
		<Tabs.Content value="comments" class="mt-6">
			<div class="space-y-6">
				<!-- Add Comment Form -->
				{#if isAuthenticated}
					<Card>
						<CardContent class="pt-6">
							<form
								method="POST"
								action="?/addComment"
								use:enhance={() => {
									return async ({ update }) => {
										await update();
										newComment = '';
									};
								}}
							>
								<div class="space-y-4">
									<Textarea
										name="content"
										bind:value={newComment}
										placeholder="Write a comment..."
										class="min-h-[100px]"
										required
									/>
									<div class="flex justify-end">
										<Button type="submit" disabled={!newComment.trim()}>Post Comment</Button>
									</div>
								</div>
							</form>
						</CardContent>
					</Card>
				{:else}
					<Card>
						<CardContent class="pt-6">
							<p class="text-muted-foreground text-center">
								<a href="/login" class="text-primary hover:underline">Sign in</a> to leave a comment
							</p>
						</CardContent>
					</Card>
				{/if}

				<!-- Comments List -->
				{#if data.comments.length === 0}
					<Card>
						<CardContent class="pt-6">
							<p class="text-muted-foreground text-center">
								No comments yet. Be the first to comment!
							</p>
						</CardContent>
					</Card>
				{:else}
					<div class="space-y-4">
						{#each data.comments as comment (comment.id)}
							<Card>
								<CardContent class="pt-6">
									<div class="flex items-start gap-4">
										{#if comment.user.image}
											<img
												src={comment.user.image}
												alt={comment.user.name}
												class="h-10 w-10 rounded-full"
											/>
										{:else}
											<div
												class="h-10 w-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-semibold"
											>
												{comment.user.name.charAt(0).toUpperCase()}
											</div>
										{/if}

										<div class="flex-1 space-y-2">
											<div class="flex items-center justify-between">
												<div>
													<p class="font-semibold">{comment.user.name}</p>
													<p class="text-xs text-muted-foreground">
														{formatDate(comment.createdAt)}
													</p>
													{#if comment.updatedAt.getTime() !== comment.createdAt.getTime()}
														<p class="text-xs text-muted-foreground">(edited)</p>
													{/if}
												</div>

												{#if data.user?.id === comment.userId}
													<div class="flex gap-2">
														<Button
															variant="ghost"
															size="sm"
															onclick={() => startEditing(comment.id, comment.content)}
														>
															<Edit2 class="h-4 w-4" />
														</Button>
														<form method="POST" action="?/deleteComment" use:enhance>
															<input type="hidden" name="commentId" value={comment.id} />
															<Button type="submit" variant="ghost" size="sm">
																<Trash2 class="h-4 w-4" />
															</Button>
														</form>
													</div>
												{/if}
											</div>

											{#if editingCommentId === comment.id}
												<form
													method="POST"
													action="?/updateComment"
													use:enhance={() => {
														return async ({ update }) => {
															await update();
															cancelEditing();
														};
													}}
												>
													<input type="hidden" name="commentId" value={comment.id} />
													<div class="space-y-2">
														<Textarea
															name="content"
															bind:value={editingCommentContent}
															class="min-h-[80px]"
															required
														/>
														<div class="flex gap-2 justify-end">
															<Button
																type="button"
																variant="outline"
																size="sm"
																onclick={cancelEditing}
															>
																Cancel
															</Button>
															<Button type="submit" size="sm">Save</Button>
														</div>
													</div>
												</form>
											{:else}
												<p class="text-sm whitespace-pre-wrap">{comment.content}</p>
											{/if}
										</div>
									</div>
								</CardContent>
							</Card>
						{/each}
					</div>
				{/if}
			</div>
		</Tabs.Content>
	</Tabs.Root>

	<!-- Action Buttons -->
	<div class="mt-8 flex justify-center gap-4">
		<Button href="/discover" variant="outline">Back to Discover</Button>
		{#if split.split.isPublic}
			<Button variant="outline">Clone Split</Button>
		{/if}
	</div>
</div>
