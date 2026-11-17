import { z } from 'zod';

export const PHONE_REGEX = /^(\+?56\s?9\s?\d{4}[\s-]?\d{4}|\+(?!56\b)[1-9](?:[\s-]?\d){7,14})$/;

export const emailCheckSchema = z.object({
  email: z.string().trim().email('Ingresa un correo electrónico válido'),
});

export const loginSchema = z.object({
  email: z.string().trim().email('Ingresa un correo electrónico válido'),
  password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres'),
});

export const studentRegisterSchema = z.object({
  email: z.string().trim().email('Ingresa un correo electrónico válido'),
  password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres'),
  firstName: z.string().trim().min(2, 'El nombre debe tener al menos 2 caracteres'),
  lastName: z.string().trim().min(2, 'El apellido debe tener al menos 2 caracteres'),
  phone: z
    .string()
    .trim()
    .optional()
    .refine((val) => !val || PHONE_REGEX.test(val), {
      message: 'Ingresa un número telefónico válido (ej: +56912345678)',
    }),
  universityId: z.string().trim().min(1, 'Selecciona una universidad válida'),
  termsAccepted: z.boolean().refine((val) => val === true, {
    message: 'Debes aceptar los términos y condiciones',
  }),
});

export const landlordRegisterSchema = z.object({
  firstName: z.string().trim().min(2, 'El nombre debe tener al menos 2 caracteres'),
  lastName: z.string().trim().min(2, 'El apellido debe tener al menos 2 caracteres'),
  email: z.string().trim().email('Ingresa un correo electrónico válido'),
  phone: z
    .string()
    .trim()
    .optional()
    .refine((val) => !val || PHONE_REGEX.test(val), {
      message: 'Ingresa un número telefónico válido (ej: +56 9 1234 5678)',
    }),
  password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres'),
});

export type EmailCheckInput = z.infer<typeof emailCheckSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type StudentRegisterInput = z.infer<typeof studentRegisterSchema>;
export type LandlordRegisterInput = z.infer<typeof landlordRegisterSchema>;
