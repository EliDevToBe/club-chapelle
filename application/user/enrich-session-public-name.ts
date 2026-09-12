import type { ArcherRepository } from "~~/application/ports/archer-repository.port";
import type { SessionUser } from "~~/shared/auth/session-user";

export const enrichSessionPublicName = async (
  session: SessionUser,
  archers: ArcherRepository,
): Promise<SessionUser> => {
  const archer = await archers.findLinkedByAuthUserId(session.id);
  return {
    ...session,
    public_name: archer?.publicName ?? null,
  };
};
