import { z } from "zod";

export const contactFormSchema = z.object({
  name: z.string().min(1, { message: "Le nom est manquant" }),
  email: z.email({ message: "L'email est invalide" }),
  subject: z.string().min(3, { message: "L'objet du mail est trop court" }),
  message: z
    .string()
    .min(20, { message: "L'email est trop court" })
    .max(3000, { message: "L'email est trop long" }),
});
