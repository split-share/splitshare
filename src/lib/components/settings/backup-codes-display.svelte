<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Checkbox } from '$lib/components/ui/checkbox';
	import { Copy, Download, AlertTriangle } from 'lucide-svelte';

	type Props = {
		codes: string[];
		onConfirm: () => void;
	};

	let { codes, onConfirm }: Props = $props();

	let confirmed = $state(false);
	let copied = $state(false);

	async function copyToClipboard() {
		const text = codes.join('\n');
		await navigator.clipboard.writeText(text);
		copied = true;
		setTimeout(() => {
			copied = false;
		}, 2000);
	}

	function downloadCodes() {
		const text = `SplitShare Backup Codes\n${'='.repeat(30)}\n\nStore these codes securely. Each code can only be used once.\n\n${codes.join('\n')}\n\nGenerated: ${new Date().toISOString()}`;
		const blob = new Blob([text], { type: 'text/plain' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = 'splitshare-backup-codes.txt';
		a.click();
		URL.revokeObjectURL(url);
	}
</script>

<div class="space-y-6">
	<div class="rounded-lg border border-yellow-500/50 bg-yellow-500/10 p-4">
		<div class="flex gap-3">
			<AlertTriangle class="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
			<div class="space-y-1">
				<p class="font-medium text-yellow-600">Save your backup codes</p>
				<p class="text-sm text-yellow-600/80">
					These codes will only be shown once. Store them in a secure location. Each code can only
					be used once.
				</p>
			</div>
		</div>
	</div>

	<div class="grid grid-cols-2 gap-2 p-4 bg-muted rounded-lg font-mono text-sm">
		{#each codes as code (code)}
			<div class="px-3 py-2 bg-background rounded border text-center">{code}</div>
		{/each}
	</div>

	<div class="flex gap-2">
		<Button variant="outline" size="sm" onclick={copyToClipboard}>
			<Copy class="mr-2 h-4 w-4" />
			{copied ? 'Copied!' : 'Copy All'}
		</Button>
		<Button variant="outline" size="sm" onclick={downloadCodes}>
			<Download class="mr-2 h-4 w-4" />
			Download
		</Button>
	</div>

	<div class="border-t pt-4">
		<label class="flex items-start gap-3 cursor-pointer">
			<Checkbox bind:checked={confirmed} class="mt-0.5" />
			<span class="text-sm">
				I have saved my backup codes in a secure location and understand that I won't be able to see
				them again.
			</span>
		</label>
	</div>

	<Button onclick={onConfirm} disabled={!confirmed} class="w-full">Continue</Button>
</div>
