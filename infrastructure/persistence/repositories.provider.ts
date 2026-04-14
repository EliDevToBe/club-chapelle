import { PrismaArcherRepository } from "./archer/prisma-archer.repository";
import { PrismaCompetitionRepository } from "./competitions/prisma-competition.repository";
import { PrismaParticipationRepository } from "./participations/prisma-participation.repository";
import { PrismaUserRepository } from "./user/prisma-user.repository";

export const createRepositories = () => ({
  userRepository: new PrismaUserRepository(),
  archerRepository: new PrismaArcherRepository(),
  competitionRepository: new PrismaCompetitionRepository(),
  participationRepository: new PrismaParticipationRepository(),
});

export type Repositories = ReturnType<typeof createRepositories>;
