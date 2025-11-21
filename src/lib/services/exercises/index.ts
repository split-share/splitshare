import { db } from '$lib/server/db';
import { ExerciseRepository } from './exercise.repository';
import { ExerciseService } from './exercise.service';

export const exerciseRepository = new ExerciseRepository(db);
export const exerciseService = new ExerciseService(exerciseRepository);

export { ExerciseRepository, ExerciseService };
export type * from './types';
