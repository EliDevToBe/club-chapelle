import type { RoleEnum } from "~~/shared/db-enums";

/** Public session payload returned to frontend auth composables. */
export type SessionUser = {
  id: string;
  name: string | null;
  roles: RoleEnum[];
};
