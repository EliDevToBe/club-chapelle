import { PrismaArcherRepository } from "./archer/prisma-archer.repository";
import { PrismaDeleteArcherPersistence } from "./archer/prisma-delete-archer.persistence";
import { PrismaCompetitionRepository } from "./competitions/prisma-competition.repository";
import { PrismaAcceptInvitationPersistence } from "./invitation/prisma-accept-invitation.persistence";
import { PrismaInviteMemberPersistence } from "./invitation/prisma-invite-member.persistence";
import { PrismaParticipationRepository } from "./participations/prisma-participation.repository";
import { PrismaPasswordResetPersistence } from "./password-reset/prisma-password-reset.persistence";
import { PrismaTokenRepository } from "./token/prisma-token.repository";
import { PrismaRevokeMemberAccessPersistence } from "./user/prisma-revoke-member-access.persistence";
import { PrismaUserRepository } from "./user/prisma-user.repository";
import { PrismaWebsiteConfigRepository } from "./website/prisma-website-config.repository";

const createRepositories = () => ({
  userRepository: new PrismaUserRepository(),
  tokenRepository: new PrismaTokenRepository(),
  passwordResetPersistence: new PrismaPasswordResetPersistence(),
  inviteMemberPersistence: new PrismaInviteMemberPersistence(),
  acceptInvitationPersistence: new PrismaAcceptInvitationPersistence(),
  revokeMemberAccessPersistence: new PrismaRevokeMemberAccessPersistence(),
  deleteArcherPersistence: new PrismaDeleteArcherPersistence(),
  archerRepository: new PrismaArcherRepository(),
  competitionRepository: new PrismaCompetitionRepository(),
  participationRepository: new PrismaParticipationRepository(),
  websiteConfigRepository: new PrismaWebsiteConfigRepository(),
});

export type Repositories = ReturnType<typeof createRepositories>;

let repositories: Repositories | null = null;

export const getRepositories = () => {
  if (repositories) {
    return repositories;
  }
  repositories = createRepositories();
  return repositories;
};
