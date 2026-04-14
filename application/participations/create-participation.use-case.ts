import type {
  CreateParticipationInput,
  ParticipationRepository,
} from "~~/application/ports/participation-repository.port";

export class CreateParticipation {
  constructor(private readonly participations: ParticipationRepository) {}

  public create = async (input: CreateParticipationInput) =>
    this.participations.create(input);
}
