import { z } from 'zod';

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
    .regex(
      /^(\+?56\s?9?\s?[\d\s-]{8,12}|\+[1-9][\d\s-]{7,15})$/,
      'Ingresa un número telefónico válido (ej: +56912345678)',
    ),
  universityId: z.string().uuid('Selecciona una universidad válida'),
  termsAccepted: z.literal(true, {
    message: 'Debes aceptar los términos y condiciones',
  }),
});

export type EmailCheckInput = z.infer<typeof emailCheckSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type StudentRegisterInput = z.infer<typeof studentRegisterSchema>;
