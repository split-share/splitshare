import { z } from 'zod';

export const createWeightEntrySchema = z.object({
	weight: z
		.number()
		.positive('Weight must be greater than 0')
		.max(999.99, 'Weight must be less than 1000 kg')
		.refine(
			(val) => Math.round(val * 100) / 100 === val,
			'Weight must have at most 2 decimal places'
		),
	recordedAt: z.date().max(new Date(), 'Recorded date cannot be in the future'),
	notes: z.string().max(500, 'Notes are too long').optional()
});

export const updateWeightEntrySchema = createWeightEntrySchema.partial();

export type CreateWeightEntryInput = z.infer<typeof createWeightEntrySchema>;
export type UpdateWeightEntryInput = z.infer<typeof updateWeightEntrySchema>;
