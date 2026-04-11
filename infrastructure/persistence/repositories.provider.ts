import { StubArcherRepository } from "./archer/stub-archer.repository";
import { StubCompetitionRepository } from "./competitions/stub-competition.repository";
import { StubParticipationRepository } from "./participations/stub-participation.repository";
import { StubUserRepository } from "./user/stub-user.repository";

export const createRepositories = () => ({
  userRepository: new StubUserRepository(),
  archerRepository: new StubArcherRepository(),
  competitionRepository: new StubCompetitionRepository(),
  participationRepository: new StubParticipationRepository(),
});

export type Repositories = ReturnType<typeof createRepositories>;
