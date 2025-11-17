/**
 * Media optimization utilities for images and videos
 * Supabase provides automatic image optimization via transformation API
 */

interface ImageTransformOptions {
	width?: number;
	height?: number;
	quality?: number;
	format?: 'webp' | 'avif' | 'jpeg' | 'png';
	resize?: 'cover' | 'contain' | 'fill';
}

/**
 * Generate optimized image URL using Supabase Image Transformation
 * https://supabase.com/docs/guides/storage/image-transformations
 */
export function getOptimizedImageUrl(
	originalUrl: string,
	options: ImageTransformOptions = {}
): string {
	const { width, height, quality = 80, format = 'webp', resize = 'cover' } = options;

	// Parse the URL to extract bucket and path
	const url = new URL(originalUrl);
	const pathParts = url.pathname.split('/storage/v1/object/public/');

	if (pathParts.length < 2) {
		return originalUrl;
	}

	const [bucket, ...pathSegments] = pathParts[1].split('/');
	const path = pathSegments.join('/');

	// Build transformation parameters
	const params = new URLSearchParams();
	if (width) params.set('width', width.toString());
	if (height) params.set('height', height.toString());
	params.set('quality', quality.toString());
	params.set('format', format);
	params.set('resize', resize);

	// Return transformed URL
	return `${url.origin}/storage/v1/render/image/public/${bucket}/${path}?${params.toString()}`;
}

/**
 * Generate responsive image srcset
 */
export function getResponsiveImageSrcSet(originalUrl: string): string {
	const sizes = [320, 640, 768, 1024, 1280, 1920];
	return sizes
		.map((width) => {
			const url = getOptimizedImageUrl(originalUrl, { width, format: 'webp' });
			return `${url} ${width}w`;
		})
		.join(', ');
}

/**
 * Get thumbnail URL for images
 */
export function getThumbnailUrl(
	originalUrl: string,
	size: 'small' | 'medium' | 'large' = 'medium'
): string {
	const sizes = {
		small: 150,
		medium: 300,
		large: 600
	};

	return getOptimizedImageUrl(originalUrl, {
		width: sizes[size],
		height: sizes[size],
		quality: 75,
		resize: 'cover'
	});
}

/**
 * Get video thumbnail from Supabase
 * Note: This requires video thumbnail generation to be set up in Supabase
 */
export function getVideoThumbnail(videoUrl: string, timeInSeconds: number = 0): string {
	const url = new URL(videoUrl);
	const pathParts = url.pathname.split('/storage/v1/object/public/');

	if (pathParts.length < 2) {
		return videoUrl;
	}

	const [bucket, ...pathSegments] = pathParts[1].split('/');
	const path = pathSegments.join('/');

	// Use Supabase video preview endpoint (if available)
	return `${url.origin}/storage/v1/render/video/thumbnail/public/${bucket}/${path}?time=${timeInSeconds}`;
}

/**
 * Calculate video aspect ratio from dimensions
 */
export function getVideoAspectRatio(width: number, height: number): string {
	const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));
	const divisor = gcd(width, height);
	return `${width / divisor}:${height / divisor}`;
}

/**
 * Format file size to human readable format
 */
export function formatFileSize(bytes: number): string {
	if (bytes === 0) return '0 Bytes';

	const k = 1024;
	const sizes = ['Bytes', 'KB', 'MB', 'GB'];
	const i = Math.floor(Math.log(bytes) / Math.log(k));

	return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

/**
 * Format video duration to human readable format (MM:SS)
 */
export function formatVideoDuration(seconds: number): string {
	const minutes = Math.floor(seconds / 60);
	const remainingSeconds = Math.floor(seconds % 60);
	return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

/**
 * Preload image for better performance
 */
export async function preloadImage(url: string): Promise<void> {
	return new Promise((resolve, reject) => {
		const img = new Image();
		img.onload = () => resolve();
		img.onerror = reject;
		img.src = url;
	});
}

/**
 * Extract video metadata from File object
 */
export async function getVideoMetadata(
	file: File
): Promise<{ duration: number; width: number; height: number }> {
	return new Promise((resolve, reject) => {
		const video = document.createElement('video');
		video.preload = 'metadata';

		video.onloadedmetadata = () => {
			window.URL.revokeObjectURL(video.src);
			resolve({
				duration: video.duration,
				width: video.videoWidth,
				height: video.videoHeight
			});
		};

		video.onerror = () => {
			window.URL.revokeObjectURL(video.src);
			reject(new Error('Failed to load video metadata'));
		};

		video.src = URL.createObjectURL(file);
	});
}

/**
 * Extract image dimensions from File object
 */
export async function getImageDimensions(file: File): Promise<{ width: number; height: number }> {
	return new Promise((resolve, reject) => {
		const img = new Image();

		img.onload = () => {
			URL.revokeObjectURL(img.src);
			resolve({
				width: img.width,
				height: img.height
			});
		};

		img.onerror = () => {
			URL.revokeObjectURL(img.src);
			reject(new Error('Failed to load image'));
		};

		img.src = URL.createObjectURL(file);
	});
}

/**
 * Check if browser supports a specific video codec
 */
export function canPlayVideoType(type: string): boolean {
	const video = document.createElement('video');
	return video.canPlayType(type) !== '';
}

/**
 * Get optimal video format based on browser support
 */
export function getOptimalVideoFormat(): 'webm' | 'mp4' {
	if (canPlayVideoType('video/webm; codecs="vp9"')) {
		return 'webm';
	}
	return 'mp4';
}
