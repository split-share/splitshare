<script lang="ts">
	/**
	 * YouTube Embed Component
	 * Extracts video ID from various YouTube URL formats and displays an embed
	 */
	let { url, title = 'YouTube video' }: { url: string; title?: string } = $props();

	/**
	 * Extract YouTube video ID from various URL formats:
	 * - https://www.youtube.com/watch?v=VIDEO_ID
	 * - https://youtu.be/VIDEO_ID
	 * - https://www.youtube.com/embed/VIDEO_ID
	 */
	function getYouTubeVideoId(url: string): string | null {
		try {
			const urlObj = new URL(url);

			// youtube.com/watch?v=VIDEO_ID
			if (urlObj.hostname.includes('youtube.com')) {
				const videoId = urlObj.searchParams.get('v');
				if (videoId) return videoId;

				// youtube.com/embed/VIDEO_ID
				const embedMatch = urlObj.pathname.match(/\/embed\/([^/?]+)/);
				if (embedMatch) return embedMatch[1];
			}

			// youtu.be/VIDEO_ID
			if (urlObj.hostname === 'youtu.be') {
				const videoId = urlObj.pathname.slice(1).split('?')[0];
				if (videoId) return videoId;
			}

			return null;
		} catch {
			return null;
		}
	}

	const videoId = $derived(getYouTubeVideoId(url));
</script>

{#if videoId}
	<div class="relative w-full overflow-hidden rounded-lg" style="padding-bottom: 56.25%;">
		<iframe
			class="absolute top-0 left-0 w-full h-full border-0"
			src="https://www.youtube.com/embed/{videoId}"
			{title}
			allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
			allowfullscreen
		></iframe>
	</div>
{:else}
	<div class="rounded-lg border border-dashed p-8 text-center">
		<p class="text-sm text-muted-foreground">Invalid video URL</p>
		<a
			href={url}
			target="_blank"
			rel="noopener noreferrer"
			class="mt-2 text-sm text-primary hover:underline"
		>
			Open link →
		</a>
	</div>
{/if}
