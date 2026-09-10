import type { RoleEnum } from "~~/shared/db-enums";

export type OwnProfileDto = {
  id: string;
  name: string | null;
  email: string;
  public_name: string | null;
  roles: RoleEnum[];
  pending_email: string | null;
};
