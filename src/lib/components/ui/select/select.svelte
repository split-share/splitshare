<script lang="ts">
	import { Select as SelectPrimitive } from 'bits-ui';

	let {
		open = $bindable(false),
		value = $bindable(),
		onValueChange,
		...restProps
	}: SelectPrimitive.RootProps & {
		onValueChange?: (value: string | undefined) => void;
	} = $props();
</script>

<SelectPrimitive.Root
	bind:open
	bind:value={value as never}
	onValueChange={onValueChange as never}
	{...restProps}
/>
