import { z } from "zod";

export const ASSIGNABLE_CLUB_ROLES = ["member", "manager", "admin"] as const;

export const setUserRoleBodySchema = z.object({
  role: z.enum(ASSIGNABLE_CLUB_ROLES),
});

export type SetUserRoleBody = z.infer<typeof setUserRoleBodySchema>;
export type AssignableClubRole = SetUserRoleBody["role"];

export const parseSetUserRoleBody = (raw: unknown): SetUserRoleBody => {
  const record =
    typeof raw === "object" && raw !== null
      ? (raw as Record<string, unknown>)
      : {};
  return setUserRoleBodySchema.parse(record);
};
