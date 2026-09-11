import { z } from 'zod';

export const roomTypeEnum = z.enum(['SINGLE', 'SHARED', 'STUDIO'], {
  message: 'Selecciona un tipo de habitación válido',
});
export type RoomTypeEnum = z.infer<typeof roomTypeEnum>;

export const stayDurationCategoryEnum = z.enum(
  ['FEW_DAYS', 'FEW_WEEKS', 'ONE_SEMESTER', 'ONE_YEAR', 'MORE_THAN_A_YEAR'],
  {
    message: 'Selecciona una duración de estancia válida',
  },
);
export type StayDurationCategoryEnum = z.infer<typeof stayDurationCategoryEnum>;

export const createReviewSchema = z.object({
  rating: z
    .number({ message: 'La calificación es requerida' })
    .int('La calificación debe ser un número entero')
    .min(1, 'La calificación mínima es 1')
    .max(5, 'La calificación máxima es 5'),
  overallRating: z
    .number()
    .int('La calificación debe ser un número entero')
    .min(1, 'La calificación mínima es 1')
    .max(5, 'La calificación máxima es 5')
    .optional(),
  comment: z
    .string()
    .trim()
    .min(15, 'La reseña debe tener al menos 15 caracteres')
    .max(1000, 'La reseña no puede exceder 1000 caracteres'),
  roomType: roomTypeEnum,
  images: z
    .array(z.string().url('Cada imagen debe ser una URL válida'))
    .max(3, 'Máximo 3 imágenes permitidas')
    .default([]),
  cleanlinessRating: z
    .number()
    .int()
    .min(1, 'La calificación mínima es 1')
    .max(5, 'La calificación máxima es 5')
    .optional(),
  landlordRating: z
    .number()
    .int()
    .min(1, 'La calificación mínima es 1')
    .max(5, 'La calificación máxima es 5')
    .optional(),
  quietnessRating: z
    .number()
    .int()
    .min(1, 'La calificación mínima es 1')
    .max(5, 'La calificación máxima es 5')
    .optional(),
  wifiRating: z
    .number()
    .int()
    .min(1, 'La calificación mínima es 1')
    .max(5, 'La calificación máxima es 5')
    .optional(),
  stayDurationCategory: stayDurationCategoryEnum.optional(),
  pensionId: z.string().uuid('ID de pensión inválido').optional(),
});

export const updateReviewSchema = createReviewSchema.partial();

export type CreateReviewInput = z.infer<typeof createReviewSchema>;
export type UpdateReviewInput = z.infer<typeof updateReviewSchema>;
