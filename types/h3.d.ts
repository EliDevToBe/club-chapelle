import type { RoleEnum } from "~~/shared/db-enums";

declare module "h3" {
  interface H3EventContext {
    authUser?: {
      id: string;
      name: string | null;
      roles: RoleEnum[];
      authenticated: boolean;
    };
  }
}
