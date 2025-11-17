import { Share } from '@capacitor/share';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { StatusBar, Style } from '@capacitor/status-bar';
import { Preferences } from '@capacitor/preferences';
import { Capacitor } from '@capacitor/core';

// Check if running on native mobile platform
export const isNativePlatform = Capacitor.isNativePlatform();

// Share functionality
export async function shareSplit(splitTitle: string, splitUrl: string) {
	if (!isNativePlatform) {
		// Fallback to Web Share API
		if (navigator.share) {
			await navigator.share({
				title: splitTitle,
				text: `Check out this workout split: ${splitTitle}`,
				url: splitUrl
			});
		} else {
			// Copy to clipboard as fallback
			await navigator.clipboard.writeText(splitUrl);
			return 'Link copied to clipboard!';
		}
	} else {
		await Share.share({
			title: splitTitle,
			text: `Check out this workout split: ${splitTitle}`,
			url: splitUrl,
			dialogTitle: 'Share Split'
		});
	}
}

// Haptic feedback
export async function hapticImpact(style: 'light' | 'medium' | 'heavy' = 'light') {
	if (!isNativePlatform) return;

	const styles = {
		light: ImpactStyle.Light,
		medium: ImpactStyle.Medium,
		heavy: ImpactStyle.Heavy
	};

	await Haptics.impact({ style: styles[style] });
}

export async function hapticNotification(type: 'success' | 'warning' | 'error' = 'success') {
	if (!isNativePlatform) return;

	// Map types to impact styles
	const typeToStyle = {
		success: ImpactStyle.Light,
		warning: ImpactStyle.Medium,
		error: ImpactStyle.Heavy
	};

	await Haptics.impact({ style: typeToStyle[type] });
}

// Status bar
export async function setStatusBarStyle(isDark: boolean) {
	if (!isNativePlatform) return;

	await StatusBar.setStyle({
		style: isDark ? Style.Dark : Style.Light
	});
}

// Preferences (local storage)
export async function setPreference(key: string, value: string) {
	await Preferences.set({ key, value });
}

export async function getPreference(key: string): Promise<string | null> {
	const { value } = await Preferences.get({ key });
	return value;
}

export async function removePreference(key: string) {
	await Preferences.remove({ key });
}
