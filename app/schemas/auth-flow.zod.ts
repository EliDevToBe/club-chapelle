import { z } from "zod";

const emailField = z
  .string()
  .transform((s) => s.trim())
  .pipe(z.email({ message: "L'adresse e-mail est invalide" }));

/** Password strength for invitation / set-password flows (after trim). */
export const passwordPolicySchema = z
  .string()
  .min(8, { message: "Le mot de passe doit contenir au moins 8 caractères" })
  .regex(/[A-Z]/, {
    message: "Le mot de passe doit contenir au moins une majuscule",
  })
  .regex(/[0-9]/, {
    message: "Le mot de passe doit contenir au moins un chiffre",
  })
  .regex(/[^A-Za-z0-9]/, {
    message: "Le mot de passe doit contenir au moins un caractère spécial",
  });

/** Login: trim passwords; no strength rules (legacy accounts). */
export const authLoginFormSchema = z.object({
  email: emailField,
  password: z
    .string()
    .transform((s) => s.trim())
    .pipe(z.string().min(1, { message: "Le mot de passe est requis" })),
});

/** Forgot-password step: email only. */
export const authForgotPasswordFormSchema = z.object({
  email: emailField,
});

/** Invitation register: strong password + confirmation (trimmed, must match). */
export const authInvitationRegisterFormSchema = z
  .object({
    password: z
      .string()
      .transform((s) => s.trim())
      .pipe(passwordPolicySchema),
    confirmPassword: z.string().transform((s) => s.trim()),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Les mots de passe ne correspondent pas.",
    path: ["confirmPassword"],
  });

export type AuthLoginFormInput = z.input<typeof authLoginFormSchema>;
export type AuthLoginFormValues = z.output<typeof authLoginFormSchema>;
export type AuthForgotPasswordFormValues = z.output<
  typeof authForgotPasswordFormSchema
>;
export type AuthInvitationRegisterFormValues = z.output<
  typeof authInvitationRegisterFormSchema
>;
