import { SUPABASE_URL, SUPABASE_ANON_KEY } from '$env/static/private';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export async function uploadImage(file: File, bucket: string, userId: string): Promise<string> {
	const fileExt = file.name.split('.').pop();
	const fileName = `${userId}/${Date.now()}.${fileExt}`;

	const { data, error } = await supabase.storage.from(bucket).upload(fileName, file, {
		cacheControl: '3600',
		upsert: false
	});

	if (error) {
		throw new Error(`Failed to upload image: ${error.message}`);
	}

	const {
		data: { publicUrl }
	} = supabase.storage.from(bucket).getPublicUrl(data.path);

	return publicUrl;
}

export async function uploadVideo(file: File, bucket: string, userId: string): Promise<string> {
	const fileExt = file.name.split('.').pop();
	const fileName = `${userId}/videos/${Date.now()}.${fileExt}`;

	const { data, error } = await supabase.storage.from(bucket).upload(fileName, file, {
		cacheControl: '3600',
		upsert: false
	});

	if (error) {
		throw new Error(`Failed to upload video: ${error.message}`);
	}

	const {
		data: { publicUrl }
	} = supabase.storage.from(bucket).getPublicUrl(data.path);

	return publicUrl;
}

export async function deleteMedia(url: string, bucket: string): Promise<void> {
	const path = url.split(`${bucket}/`)[1];

	const { error } = await supabase.storage.from(bucket).remove([path]);

	if (error) {
		throw new Error(`Failed to delete media: ${error.message}`);
	}
}

export function validateImageFile(file: File): { valid: boolean; error?: string } {
	const maxSize = 5 * 1024 * 1024; // 5MB
	const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

	if (!allowedTypes.includes(file.type)) {
		return { valid: false, error: 'Only JPEG, PNG, and WebP images are allowed' };
	}

	if (file.size > maxSize) {
		return { valid: false, error: 'Image size must be less than 5MB' };
	}

	return { valid: true };
}

export function validateVideoFile(file: File): { valid: boolean; error?: string } {
	const maxSize = 50 * 1024 * 1024; // 50MB
	const allowedTypes = ['video/mp4', 'video/webm', 'video/quicktime'];

	if (!allowedTypes.includes(file.type)) {
		return { valid: false, error: 'Only MP4, WebM, and MOV videos are allowed' };
	}

	if (file.size > maxSize) {
		return { valid: false, error: 'Video size must be less than 50MB' };
	}

	return { valid: true };
}
