import { defineEventHandler } from "h3";
import { enrichSessionPublicName } from "~~/application/user/enrich-session-public-name";
import { getRepositories } from "~~/infrastructure/persistence/repositories.provider";
import { resolveSessionFromEvent } from "~~/server/utils/resolve-session-from-event";

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
