<script lang="ts">
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
	import type { Snippet } from 'svelte';

	interface Props {
		title: string;
		value: string | number;
		subtitle?: string;
		icon: Snippet;
	}

	let { title, value, subtitle, icon }: Props = $props();
</script>

<Card class="border-none shadow-none bg-card/50">
	<CardHeader class="flex flex-row items-center justify-between p-3 pb-1 sm:p-6 sm:pb-2">
		<CardTitle class="text-xs font-medium sm:text-sm">{title}</CardTitle>
		{@render icon()}
	</CardHeader>
	<CardContent class="p-3 pt-0 sm:p-6 sm:pt-0">
		<div class="text-xl font-bold sm:text-2xl">{value}</div>
		{#if subtitle}
			<p class="text-[10px] text-muted-foreground sm:text-xs">{subtitle}</p>
		{/if}
	</CardContent>
</Card>
