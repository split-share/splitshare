<script lang="ts">
	import { Wifi, WifiOff, RefreshCw, AlertCircle } from 'lucide-svelte';
	import { connectionState, syncState } from '$lib/stores/connection.svelte';
	import { Button } from '$lib/components/ui/button';
	import Badge from '$lib/components/ui/badge.svelte';
	import { syncPendingData } from '$lib/services/sync.service';

	// Derived values using Svelte 5 runes
	const isOnline = $derived(connectionState.online);
	const hasPendingSyncs = $derived(syncState.pendingCount > 0);

	/**
	 * Props for the OfflineIndicator component
	 */
	interface Props {
		/** Whether to show the sync button */
		showSyncButton?: boolean;
		/** Whether to show the compact version */
		compact?: boolean;
		/** Custom class for styling */
		class?: string;
	}

	let { showSyncButton = true, compact = false, class: className = '' }: Props = $props();

	let isSyncing = $state(false);
	let syncError: string | null = $state(null);
	let showErrorTooltip = $state(false);
	let errorTooltipRef = $state<HTMLDivElement | null>(null);

	/**
	 * Handle manual sync trigger
	 */
	async function handleSync() {
		if (isSyncing) return;

		isSyncing = true;
		syncError = null;

		try {
			await syncPendingData();
		} catch (error) {
			syncError = error instanceof Error ? error.message : 'Sync failed';
		} finally {
			isSyncing = false;
		}
	}

	/**
	 * Format the connection type for display
	 */
	function formatConnectionType(type: string | null): string {
		if (!type) return 'Unknown';
		const typeMap: Record<string, string> = {
			wifi: 'Wi-Fi',
			cellular: 'Cellular',
			ethernet: 'Ethernet',
			bluetooth: 'Bluetooth',
			none: 'None',
			unknown: 'Unknown'
		};
		return typeMap[type.toLowerCase()] || type.charAt(0).toUpperCase() + type.slice(1);
	}

	/**
	 * Toggle error tooltip
	 */
	function toggleErrorTooltip() {
		showErrorTooltip = !showErrorTooltip;
	}

	/**
	 * Handle keyboard interaction for error button
	 */
	function handleErrorKeydown(event: KeyboardEvent) {
		if (event.key === 'Enter' || event.key === ' ') {
			event.preventDefault();
			toggleErrorTooltip();
		}
		if (event.key === 'Escape' && showErrorTooltip) {
			showErrorTooltip = false;
		}
	}

	/**
	 * Click outside handler to close tooltip
	 */
	function handleClickOutside(event: MouseEvent) {
		if (errorTooltipRef && !errorTooltipRef.contains(event.target as Node)) {
			showErrorTooltip = false;
		}
	}
</script>

<svelte:window onclick={handleClickOutside} />

{#if compact}
	<div
		class="inline-flex items-center gap-2 {className}"
		role="status"
		aria-label={isOnline ? 'Online' : 'Offline'}
	>
		{#if !isOnline}
			<Badge variant="destructive" class="gap-1">
				<WifiOff class="h-3 w-3" aria-hidden="true" />
				<span>Offline</span>
			</Badge>
		{:else if hasPendingSyncs}
			<Badge variant="outline" class="gap-1 border-orange-500 text-orange-600">
				<RefreshCw class="h-3 w-3 {isSyncing ? 'animate-spin' : ''}" aria-hidden="true" />
				<span>{syncState.pendingCount} pending</span>
			</Badge>
		{:else}
			<Badge variant="secondary" class="gap-1">
				<Wifi class="h-3 w-3" aria-hidden="true" />
				<span>Online</span>
			</Badge>
		{/if}
	</div>
{:else}
	<div
		class="flex items-center gap-3 rounded-lg border p-3 {className}"
		role="status"
		aria-label={`Connection status: ${isOnline ? 'Online' : 'Offline'}`}
	>
		<div class="flex items-center gap-2">
			{#if isOnline}
				<Wifi class="h-5 w-5 text-green-500" aria-hidden="true" />
			{:else}
				<WifiOff class="h-5 w-5 text-red-500" aria-hidden="true" />
			{/if}
			<div class="flex flex-col">
				<span class="font-medium">
					{isOnline ? 'Online' : 'Offline'}
				</span>
				{#if isOnline && connectionState.effectiveType}
					<span class="text-xs text-muted-foreground">
						{formatConnectionType(connectionState.effectiveType)} connection
					</span>
				{/if}
			</div>
		</div>

		{#if showSyncButton && hasPendingSyncs}
			<div class="ml-auto flex items-center gap-2">
				{#if syncError}
					<div class="relative" bind:this={errorTooltipRef}>
						<button
							type="button"
							class="text-red-500 hover:text-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 rounded"
							onclick={toggleErrorTooltip}
							onkeydown={handleErrorKeydown}
							aria-expanded={showErrorTooltip}
							aria-label="View sync error details"
						>
							<AlertCircle class="h-4 w-4" aria-hidden="true" />
						</button>
						{#if showErrorTooltip}
							<div
								id="sync-error-tooltip"
								class="absolute right-0 top-full z-50 mt-2 w-48 rounded-md border bg-popover p-2 text-xs text-popover-foreground shadow-md"
								role="tooltip"
							>
								{syncError}
							</div>
						{/if}
					</div>
				{/if}
				<Button
					variant="outline"
					size="sm"
					onclick={handleSync}
					disabled={isSyncing || !isOnline}
					aria-label={isSyncing ? 'Syncing data' : `Sync ${syncState.pendingCount} pending items`}
				>
					<RefreshCw class="mr-2 h-4 w-4 {isSyncing ? 'animate-spin' : ''}" aria-hidden="true" />
					{isSyncing ? 'Syncing...' : `Sync ${syncState.pendingCount} items`}
				</Button>
			</div>
		{:else if hasPendingSyncs}
			<Badge variant="outline" class="ml-auto">
				{syncState.pendingCount} pending
			</Badge>
		{/if}
	</div>
{/if}
