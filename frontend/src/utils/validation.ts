import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Email invalide"),
  password: z.string().min(6, "Le mot de passe doit contenir au moins 6 caractères"),
});

export const registerSchema = z.object({
  name: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  email: z.string().email("Email invalide"),
  password: z.string().min(6, "Le mot de passe doit contenir au moins 6 caractères"),
});

export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;

export const createEventSchema = z.object({
  title: z.string().min(3, "Le titre doit contenir au moins 3 caractères"),
  description: z
    .string()
    .min(10, "La description doit contenir au moins 10 caractères"),
  date: z.string().refine(
    (date) => new Date(date) > new Date(),
    "La date doit être dans le futur"
  ),
  location: z.string().min(3, "Le lieu doit contenir au moins 3 caractères"),
  price: z.coerce.number().min(0, "Le prix doit être positif"),
  capacity: z.coerce.number().min(1, "La capacité doit être au moins 1"),
});

export type CreateEventFormData = z.infer<typeof createEventSchema>;
