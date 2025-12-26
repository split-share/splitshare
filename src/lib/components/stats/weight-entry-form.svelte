<script lang="ts">
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Textarea } from '$lib/components/ui/textarea';
	import { enhance } from '$app/forms';

	interface Props {
		error?: string;
	}

	let { error }: Props = $props();

	let weight = $state('');
	let notes = $state('');
	let isSubmitting = $state(false);
</script>

<Card class="border-none shadow-none bg-card/50">
	<CardHeader class="p-3 pb-2 sm:p-6 sm:pb-3">
		<CardTitle class="text-sm sm:text-base">Add Entry</CardTitle>
	</CardHeader>
	<CardContent class="p-3 pt-0 sm:p-6 sm:pt-0">
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
			<div class="space-y-3 sm:space-y-4">
				<div class="space-y-1.5 sm:space-y-2">
					<Label for="weight" class="text-xs sm:text-sm">Weight (kg) *</Label>
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
						class="h-9 sm:h-10"
					/>
				</div>

				<div class="space-y-1.5 sm:space-y-2">
					<Label for="notes" class="text-xs sm:text-sm">Notes (optional)</Label>
					<Textarea
						id="notes"
						name="notes"
						bind:value={notes}
						placeholder="Add notes..."
						class="min-h-[50px] sm:min-h-[60px] text-sm"
						disabled={isSubmitting}
					/>
				</div>

				{#if error}
					<p class="text-xs text-destructive sm:text-sm">{error}</p>
				{/if}

				<Button type="submit" class="w-full h-9 sm:h-10" disabled={isSubmitting}>
					{isSubmitting ? 'Adding...' : 'Add Entry'}
				</Button>
			</div>
		</form>
	</CardContent>
</Card>
