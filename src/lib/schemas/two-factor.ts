import { z } from 'zod';

export const totpCodeSchema = z.object({
	code: z
		.string()
		.length(6, 'Code must be exactly 6 digits')
		.regex(/^\d+$/, 'Code must contain only numbers')
});

export const backupCodeSchema = z.object({
	code: z
		.string()
		.length(8, 'Backup code must be exactly 8 characters')
		.regex(/^[A-Z0-9]+$/, 'Invalid backup code format')
});

export const enableTwoFactorSchema = z.object({
	password: z.string().min(1, 'Password is required')
});

export const disableTwoFactorSchema = z.object({
	password: z.string().min(1, 'Password is required')
});

export type TotpCodeInput = z.input<typeof totpCodeSchema>;
export type TotpCodeOutput = z.output<typeof totpCodeSchema>;
export type BackupCodeInput = z.input<typeof backupCodeSchema>;
export type BackupCodeOutput = z.output<typeof backupCodeSchema>;
export type EnableTwoFactorInput = z.input<typeof enableTwoFactorSchema>;
export type DisableTwoFactorInput = z.input<typeof disableTwoFactorSchema>;
