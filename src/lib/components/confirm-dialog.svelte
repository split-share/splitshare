<script lang="ts">
	import * as AlertDialog from '$lib/components/ui/alert-dialog';
	import type { Snippet } from 'svelte';

	interface Props {
		title?: string;
		description?: string;
		confirmLabel?: string;
		cancelLabel?: string;
		variant?: 'destructive' | 'default';
		trigger: Snippet;
		onConfirm: () => void;
	}

	let {
		title = 'Are you sure?',
		description = 'This action cannot be undone.',
		confirmLabel = 'Continue',
		cancelLabel = 'Cancel',
		variant = 'destructive',
		trigger,
		onConfirm
	}: Props = $props();
</script>

<AlertDialog.Root>
	<AlertDialog.Trigger>
		{@render trigger()}
	</AlertDialog.Trigger>
	<AlertDialog.Content>
		<AlertDialog.Header>
			<AlertDialog.Title>{title}</AlertDialog.Title>
			<AlertDialog.Description>{description}</AlertDialog.Description>
		</AlertDialog.Header>
		<AlertDialog.Footer>
			<AlertDialog.Cancel>{cancelLabel}</AlertDialog.Cancel>
			<AlertDialog.Action
				class={variant === 'destructive' ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90' : ''}
				onclick={onConfirm}
			>
				{confirmLabel}
			</AlertDialog.Action>
		</AlertDialog.Footer>
	</AlertDialog.Content>
</AlertDialog.Root>
