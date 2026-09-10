import type { H3Event } from "h3";
import { defineEventHandler } from "h3";
import { enrichSessionPublicName } from "~~/application/user/enrich-session-public-name";
import { getRepositories } from "~~/infrastructure/persistence/repositories.provider";
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
    public_name: null,
    roles: authUser.roles,
  };
  return { session };
};

export default defineEventHandler(async (event) => {
  const snapshot = resolveSessionFromEvent(event);
  if (!snapshot.session) {
    return snapshot;
  }

  const { archerRepository } = getRepositories();
  return {
    session: await enrichSessionPublicName(snapshot.session, archerRepository),
  };
});
