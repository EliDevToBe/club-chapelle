import type {
  CompetitionRepository,
  CreateCompetitionInput,
} from "~~/application/ports/competition-repository.port";

export class CreateCompetition {
  constructor(private readonly competitions: CompetitionRepository) {}

  public create = async (input: CreateCompetitionInput) =>
    this.competitions.create(input);
}
