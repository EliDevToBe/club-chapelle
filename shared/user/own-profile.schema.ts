import { z } from "zod";
import {
  asStringOrEmpty,
  asTrimmedString,
} from "~~/shared/utils/base-string.helper";

/** Same strength rules as invitation / reset-password (after trim). */
const passwordPolicySchema = z
  .string()
  .regex(/[0-9]/, {
    message: "Le mot de passe doit contenir au moins un chiffre",
  })
  .min(8, { message: "Le mot de passe doit contenir au moins 8 caractères" })
  .regex(/[A-Z]/, {
    message: "Le mot de passe doit contenir au moins une majuscule",
  })
  .regex(/[^A-Za-z0-9]/, {
    message: "Le mot de passe doit contenir au moins un caractère spécial",
  });

export const OWN_PROFILE_NAME_MAX_LENGTH = 40;

export const ownProfileNameSchema = z.object({
  name: z.string().min(1).max(OWN_PROFILE_NAME_MAX_LENGTH),
});

export const ownChangePasswordSchema = z.object({
  current_password: z.string().min(1),
  new_password: passwordPolicySchema,
});

export const ownChangeEmailSchema = z.object({
  current_password: z.string().min(1),
  email: z.email(),
});

export const ownConfirmEmailChangeSchema = z.object({
  otp: z.string().regex(/^\d{6}$/),
});

export const ownRevokeSchema = z.object({
  current_password: z.string().min(1),
});

export type OwnProfileNameBody = z.infer<typeof ownProfileNameSchema>;
export type OwnChangePasswordBody = z.infer<typeof ownChangePasswordSchema>;
export type OwnChangeEmailBody = z.infer<typeof ownChangeEmailSchema>;
export type OwnConfirmEmailChangeBody = z.infer<
  typeof ownConfirmEmailChangeSchema
>;
export type OwnRevokeBody = z.infer<typeof ownRevokeSchema>;

export const prepareOwnProfileNameBody = (
  raw: Record<string, unknown>,
): Record<string, unknown> => {
  return {
    name: asTrimmedString(raw.name),
  };
};

export const prepareOwnChangePasswordBody = (
  raw: Record<string, unknown>,
): Record<string, unknown> => {
  return {
    current_password: asStringOrEmpty(raw.current_password).trim(),
    new_password: asStringOrEmpty(raw.new_password).trim(),
  };
};

export const prepareOwnChangeEmailBody = (
  raw: Record<string, unknown>,
): Record<string, unknown> => {
  return {
    current_password: asStringOrEmpty(raw.current_password).trim(),
    email: asTrimmedString(raw.email).toLowerCase(),
  };
};

export const prepareOwnConfirmEmailChangeBody = (
  raw: Record<string, unknown>,
): Record<string, unknown> => {
  return {
    otp: asTrimmedString(raw.otp),
  };
};

export const prepareOwnRevokeBody = (
  raw: Record<string, unknown>,
): Record<string, unknown> => {
  return {
    current_password: asStringOrEmpty(raw.current_password).trim(),
  };
};

export const parseOwnProfileNameBody = (raw: unknown): OwnProfileNameBody => {
  const record =
    typeof raw === "object" && raw !== null
      ? (raw as Record<string, unknown>)
      : {};
  return ownProfileNameSchema.parse(prepareOwnProfileNameBody(record));
};

export const parseOwnChangePasswordBody = (
  raw: unknown,
): OwnChangePasswordBody => {
  const record =
    typeof raw === "object" && raw !== null
      ? (raw as Record<string, unknown>)
      : {};
  return ownChangePasswordSchema.parse(prepareOwnChangePasswordBody(record));
};

export const parseOwnChangeEmailBody = (raw: unknown): OwnChangeEmailBody => {
  const record =
    typeof raw === "object" && raw !== null
      ? (raw as Record<string, unknown>)
      : {};
  return ownChangeEmailSchema.parse(prepareOwnChangeEmailBody(record));
};

export const parseOwnConfirmEmailChangeBody = (
  raw: unknown,
): OwnConfirmEmailChangeBody => {
  const record =
    typeof raw === "object" && raw !== null
      ? (raw as Record<string, unknown>)
      : {};
  return ownConfirmEmailChangeSchema.parse(
    prepareOwnConfirmEmailChangeBody(record),
  );
};

export const parseOwnRevokeBody = (raw: unknown): OwnRevokeBody => {
  const record =
    typeof raw === "object" && raw !== null
      ? (raw as Record<string, unknown>)
      : {};
  return ownRevokeSchema.parse(prepareOwnRevokeBody(record));
};
