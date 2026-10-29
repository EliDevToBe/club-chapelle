import { z } from "zod";

export const contactFormSchema = z.object({
  name: z.string().min(1, { message: "Le nom est manquant" }),
  email: z.email({ message: "L'email est invalide" }),
  message: z
    .string()
    .min(20, { message: "Le message est trop court" })
    .max(3000, { message: "Le message est trop long" }),
});
