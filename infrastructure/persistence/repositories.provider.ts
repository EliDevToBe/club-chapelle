import { PrismaArcherRepository } from "./archer/prisma-archer.repository";
import { PrismaCompetitionRepository } from "./competitions/prisma-competition.repository";
import { PrismaParticipationRepository } from "./participations/prisma-participation.repository";
import { PrismaPasswordResetPersistence } from "./password-reset/prisma-password-reset.persistence";
import { PrismaTokenRepository } from "./token/prisma-token.repository";
import { PrismaUserRepository } from "./user/prisma-user.repository";

const createRepositories = () => ({
  userRepository: new PrismaUserRepository(),
  tokenRepository: new PrismaTokenRepository(),
  passwordResetPersistence: new PrismaPasswordResetPersistence(),
  archerRepository: new PrismaArcherRepository(),
  competitionRepository: new PrismaCompetitionRepository(),
  participationRepository: new PrismaParticipationRepository(),
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
