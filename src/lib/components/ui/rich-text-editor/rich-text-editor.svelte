<script lang="ts">
	import { Tipex } from '@friendofsvelte/tipex';
	import type { TipexEditor } from '@friendofsvelte/tipex';
	import '@friendofsvelte/tipex/styles/index.css';
	import { cn } from '$lib/utils.js';

	interface Props {
		value?: string;
		placeholder?: string;
		class?: string;
		minHeight?: string;
		disabled?: boolean;
		floating?: boolean;
		focal?: boolean;
		onUpdate?: (html: string) => void;
	}

	let {
		value = $bindable(''),
		placeholder = 'Write something...',
		class: className,
		minHeight = '120px',
		disabled = false,
		floating = true,
		focal = true,
		onUpdate
	}: Props = $props();

	let editor = $state<TipexEditor | undefined>(undefined);

	// Update value when editor content changes
	$effect(() => {
		if (editor) {
			const updateHandler = () => {
				const html = editor?.getHTML() || '';
				if (onUpdate) {
					onUpdate(html);
				}
			};
			editor.on('update', updateHandler);
			return () => {
				editor?.off('update', updateHandler);
			};
		}
	});
</script>

<div class={cn('rounded-md border', className)}>
	<Tipex
		body={value}
		{floating}
		{focal}
		bind:tipex={editor}
		style="min-height: {minHeight};"
		class="prose prose-sm max-w-none p-3 focus:outline-none"
	/>
</div>
