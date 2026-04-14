import type { ParticipationRepository } from "~~/application/ports/participation-repository.port";
import type { ParticipationId } from "~~/domain/participations/participation";

export class DeleteParticipation {
  constructor(private readonly participations: ParticipationRepository) {}

  public delete = async (id: ParticipationId) => this.participations.delete(id);
}
