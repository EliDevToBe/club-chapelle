import type { RoleEnum } from "~~/shared/db-enums";

declare module "h3" {
  interface H3EventContext {
    authUser?: {
      id: string;
      role: RoleEnum;
      authenticated: boolean;
    };
  }
}
