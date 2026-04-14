import type {
  ParticipationRepository,
  UpdateParticipationInput,
} from "~~/application/ports/participation-repository.port";
import type { ParticipationId } from "~~/domain/participations/participation";

export class UpdateParticipation {
  constructor(private readonly participations: ParticipationRepository) {}

  public update = async (
    id: ParticipationId,
    input: UpdateParticipationInput,
  ) => this.participations.update(id, input);
}
