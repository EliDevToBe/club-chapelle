import type {
  CompetitionRepository,
  UpdateCompetitionInput,
} from "~~/application/ports/competition-repository.port";
import type { CompetitionId } from "~~/domain/competitions/competition";

export class UpdateCompetition {
  constructor(private readonly competitions: CompetitionRepository) {}

  public update = async (id: CompetitionId, input: UpdateCompetitionInput) =>
    this.competitions.update(id, input);
}
