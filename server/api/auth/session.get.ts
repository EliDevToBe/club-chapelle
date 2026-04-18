import type { H3Event } from "h3";
import type { SessionUser } from "~~/shared/auth/session-user";

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
    roles: authUser.roles,
  };
  return { session };
};

export default defineEventHandler(async (event) =>
  resolveSessionFromEvent(event),
);
