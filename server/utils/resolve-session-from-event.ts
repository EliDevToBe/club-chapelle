import type { H3Event } from "h3";
import type { SessionUser } from "~~/shared/auth/session-user";

/** Builds the public session snapshot from middleware `event.context.authUser`. */
export const resolveSessionFromEvent = (
  event: H3Event,
): { session: SessionUser | null } => {
  const authUser = event.context.authUser;
  if (!authUser?.authenticated) {
    return { session: null };
  }

  const session: SessionUser = {
    id: authUser.id,
    name: authUser.name,
    public_name: null,
    roles: authUser.roles,
  };
  return { session };
};
