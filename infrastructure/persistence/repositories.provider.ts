import { PrismaArcherRepository } from "./archer/prisma-archer.repository";
import { PrismaDeleteArcherPersistence } from "./archer/prisma-delete-archer.persistence";
import { PrismaOffboardArcherShellPersistence } from "./archer/prisma-offboard-archer-shell.persistence";
import { PrismaCompetitionRepository } from "./competitions/prisma-competition.repository";
import { PrismaAcceptInvitationPersistence } from "./invitation/prisma-accept-invitation.persistence";
import { PrismaInviteMemberPersistence } from "./invitation/prisma-invite-member.persistence";
import { PrismaParticipationRepository } from "./participations/prisma-participation.repository";
import { PrismaPasswordResetPersistence } from "./password-reset/prisma-password-reset.persistence";
import { PrismaTokenRepository } from "./token/prisma-token.repository";
import { PrismaMemberRosterQuery } from "./user/prisma-member-roster.query";
import { PrismaRevokeMemberAccessPersistence } from "./user/prisma-revoke-member-access.persistence";
import { PrismaUserRepository } from "./user/prisma-user.repository";
import { PrismaWebsiteConfigRepository } from "./website/prisma-website-config.repository";

const createRepositories = () => ({
  // Entities
  userRepository: new PrismaUserRepository(),
  tokenRepository: new PrismaTokenRepository(),
  archerRepository: new PrismaArcherRepository(),
  competitionRepository: new PrismaCompetitionRepository(),
  participationRepository: new PrismaParticipationRepository(),
  websiteConfigRepository: new PrismaWebsiteConfigRepository(),

  // Flows
  deleteArcherPersistence: new PrismaDeleteArcherPersistence(),
  offboardArcherShellPersistence: new PrismaOffboardArcherShellPersistence(),
  inviteMemberPersistence: new PrismaInviteMemberPersistence(),
  passwordResetPersistence: new PrismaPasswordResetPersistence(),
  acceptInvitationPersistence: new PrismaAcceptInvitationPersistence(),
  revokeMemberAccessPersistence: new PrismaRevokeMemberAccessPersistence(),
  memberRosterQuery: new PrismaMemberRosterQuery(),
});

export type Repositories = ReturnType<typeof createRepositories>;

export const getRepositories = (): Repositories => {
  return createRepositories();
};
