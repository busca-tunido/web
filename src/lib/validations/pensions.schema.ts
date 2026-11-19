import { z } from 'zod';

export const reportReasonEnum = z.enum(
  [
    'FRAUD_OR_SCAM',
    'INACCURATE_PRICE',
    'MISLEADING_PHOTOS',
    'HOUSE_RULES_VIOLATION',
    'PROPERTY_UNAVAILABLE',
    'INAPPROPRIATE_CONTENT',
  ],
  {
    message: 'Selecciona un motivo de reporte válido',
  },
);
export type ReportReasonEnum = z.infer<typeof reportReasonEnum>;

export const proposalTypeEnum = z.enum(
  ['AMENITIES_UPDATE', 'BASIC_INFO', 'LOCATION_UPDATE', 'FULL_UPDATE'],
  {
    message: 'Selecciona un tipo de propuesta válido',
  },
);
export type ProposalTypeEnum = z.infer<typeof proposalTypeEnum>;

export const flagReportSchema = z.object({
  category: reportReasonEnum,
  reason: z
    .string()
    .trim()
    .min(10, 'El motivo del reporte debe tener al menos 10 caracteres')
    .max(1000, 'El motivo no puede exceder 1000 caracteres'),
  description: z
    .string()
    .trim()
    .min(10, 'La descripción debe tener al menos 10 caracteres')
    .optional(),
  pensionId: z.string().uuid('ID de pensión inválido').optional(),
});

export const editProposalSchema = z.object({
  proposedChanges: z
    .record(z.string(), z.unknown())
    .refine((data) => Object.keys(data).length > 0, 'Debes incluir al menos un cambio sugerido'),
  justification: z
    .string()
    .trim()
    .min(10, 'La justificación debe tener al menos 10 caracteres')
    .max(1000, 'La justificación no puede exceder 1000 caracteres'),
  submissionNotes: z
    .string()
    .trim()
    .min(10, 'Las notas de envío deben tener al menos 10 caracteres')
    .optional(),
  type: proposalTypeEnum.default('BASIC_INFO'),
  pensionId: z.string().uuid('ID de pensión inválido').optional(),
});

export const pensionFilterSchema = z.object({
  query: z.string().trim().optional(),
  city: z.string().trim().optional(),
  universityId: z.string().uuid('ID de universidad inválido').optional(),
  minPriceClp: z.number().min(0).optional(),
  maxPriceClp: z.number().min(0).optional(),
  genderPreference: z.enum(['ANY', 'FEMALE_ONLY', 'MALE_ONLY', 'MIXED', 'ALL']).optional(),
  hasPrivateBathroom: z.boolean().optional(),
  includesMeals: z.boolean().optional(),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20),
});

export const suggestEditFormSchema = z.object({
  submissionNotes: z
    .string()
    .trim()
    .min(5, 'Por favor incluye una breve explicación (mínimo 5 caracteres)')
    .max(500, 'Las notas no pueden superar los 500 caracteres'),
});

export type FlagReportInput = z.infer<typeof flagReportSchema>;
export type EditProposalInput = z.infer<typeof editProposalSchema>;
export type PensionFilterInput = z.infer<typeof pensionFilterSchema>;
export type SuggestEditFormInput = z.infer<typeof suggestEditFormSchema>;
