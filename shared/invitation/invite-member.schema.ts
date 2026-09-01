import { z } from "zod";

export const inviteMemberBodySchema = z.object({
  name: z.string().min(1),
  email: z.email(),
});

export const prepareInviteMemberBody = (
  raw: Record<string, unknown>,
): Record<string, unknown> => {
  return {
    name: typeof raw.name === "string" ? raw.name.trim() : raw.name,
    email:
      typeof raw.email === "string"
        ? raw.email.trim().toLowerCase()
        : raw.email,
  };
};

export const parseInviteMemberBody = (
  raw: unknown,
): { name: string; email: string } => {
  const record =
    typeof raw === "object" && raw !== null
      ? (raw as Record<string, unknown>)
      : {};
  return inviteMemberBodySchema.parse(prepareInviteMemberBody(record));
};
