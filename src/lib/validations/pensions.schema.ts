import { z } from 'zod';
import { PHONE_REGEX } from './auth.schema';

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

export const genderPreferenceEnum = z.enum(['ANY', 'FEMALE_ONLY', 'MALE_ONLY'], {
  message: 'Selecciona una preferencia de género válida',
});
export type GenderPreferenceEnum = z.infer<typeof genderPreferenceEnum>;

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

export const createPensionSchema = z.object({
  title: z
    .string()
    .trim()
    .min(3, 'El título debe tener al menos 3 caracteres')
    .max(120, 'El título no puede exceder 120 caracteres'),
  description: z
    .string()
    .trim()
    .min(10, 'La descripción debe tener al menos 10 caracteres')
    .max(2000, 'La descripción no puede exceder 2000 caracteres'),
  address: z.string().trim().min(3, 'La dirección debe tener al menos 3 caracteres'),
  city: z.string().trim().min(2, 'La ciudad debe tener al menos 2 caracteres'),
  neighborhood: z.string().trim().min(2, 'El barrio o comuna debe tener al menos 2 caracteres'),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  baseMonthlyPrice: z.number().min(0, 'El precio debe ser un valor positivo'),
  deposit: z.number().min(0, 'El depósito debe ser un valor positivo').optional(),
  waterIncluded: z.boolean().default(false),
  electricityIncluded: z.boolean().default(false),
  gasIncluded: z.boolean().default(false),
  internetIncluded: z.boolean().default(false),
  genderPreference: genderPreferenceEnum.default('ANY'),
  amenitySlugs: z.array(z.string()).default([]),
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

export const pensionEditorFormSchema = z.object({
  title: z
    .string()
    .trim()
    .min(3, 'El título de la pensión debe tener al menos 3 caracteres')
    .max(100, 'El título no puede superar los 100 caracteres'),
  description: z
    .string()
    .trim()
    .min(10, 'La descripción debe tener al menos 10 caracteres')
    .max(1500, 'La descripción no puede superar los 1500 caracteres'),
  address: z.string().trim().min(3, 'Ingresa una dirección válida (mín. 3 caracteres)'),
  city: z.string().trim().min(2, 'Selecciona o ingresa la ciudad donde se ubica'),
  neighborhood: z.string().trim().min(2, 'Ingresa la comuna o barrio (ej. San Joaquín, Centro)'),
  baseMonthlyPrice: z
    .string()
    .trim()
    .refine((val) => {
      const n = Number(val);
      return val.length > 0 && !Number.isNaN(n) && n > 0;
    }, 'Ingresa un valor mensual de arriendo base válido en CLP'),
  deposit: z
    .string()
    .trim()
    .optional()
    .refine((val) => {
      if (!val) return true;
      const n = Number(val);
      return !Number.isNaN(n) && n >= 0;
    }, 'El monto de garantía debe ser un número mayor o igual a 0'),
});

export const roomEditorFormSchema = z.object({
  title: z
    .string()
    .trim()
    .min(3, 'El nombre de la habitación debe tener al menos 3 caracteres')
    .max(80, 'El nombre de la habitación no puede superar los 80 caracteres'),
  roomNumber: z
    .string()
    .trim()
    .max(20, 'El número o identificador no puede superar los 20 caracteres')
    .optional(),
  description: z
    .string()
    .trim()
    .max(800, 'La descripción no puede superar los 800 caracteres')
    .optional(),
  monthlyPrice: z
    .string()
    .trim()
    .refine((val) => {
      const n = Number(val);
      return val.length > 0 && !Number.isNaN(n) && n > 0;
    }, 'Ingresa un valor mensual de arriendo válido en CLP'),
  deposit: z
    .string()
    .trim()
    .optional()
    .refine((val) => {
      if (!val) return true;
      const n = Number(val);
      return !Number.isNaN(n) && n >= 0;
    }, 'El depósito debe ser un número mayor o igual a 0'),
});

export const contactSettingsSchema = z.object({
  contactName: z
    .string()
    .trim()
    .min(2, 'Ingresa el nombre del anfitrión (mínimo 2 caracteres)')
    .max(70, 'El nombre no puede superar los 70 caracteres'),
  contactPhone: z
    .string()
    .trim()
    .min(1, 'Ingresa un WhatsApp o teléfono de contacto válido')
    .refine((val) => PHONE_REGEX.test(val), {
      message: 'Ingresa un número telefónico chileno válido (ej: +56 9 1234 5678)',
    }),
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
export type CreatePensionInput = z.infer<typeof createPensionSchema>;
export type PensionFilterInput = z.infer<typeof pensionFilterSchema>;
export type PensionEditorFormInput = z.infer<typeof pensionEditorFormSchema>;
export type RoomEditorFormInput = z.infer<typeof roomEditorFormSchema>;
export type ContactSettingsInput = z.infer<typeof contactSettingsSchema>;
export type SuggestEditFormInput = z.infer<typeof suggestEditFormSchema>;
