import { z } from "zod";

export const inviteArcherShellBodySchema = z.object({
  archer_id: z.string().min(1),
  email: z.email(),
});

export const prepareInviteArcherShellBody = (
  raw: Record<string, unknown>,
): Record<string, unknown> => {
  return {
    archer_id:
      typeof raw.archer_id === "string" ? raw.archer_id.trim() : raw.archer_id,
    email:
      typeof raw.email === "string"
        ? raw.email.trim().toLowerCase()
        : raw.email,
  };
};

export const parseInviteArcherShellBody = (
  raw: unknown,
): { archer_id: string; email: string } => {
  const record =
    typeof raw === "object" && raw !== null
      ? (raw as Record<string, unknown>)
      : {};
  return inviteArcherShellBodySchema.parse(
    prepareInviteArcherShellBody(record),
  );
};
