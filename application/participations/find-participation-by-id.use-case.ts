import type { ParticipationRepository } from "~~/application/ports/participation-repository.port";
import type { ParticipationId } from "~~/domain/participations/participation";

export class FindParticipationById {
  constructor(private readonly participations: ParticipationRepository) {}

  public findById = async (id: ParticipationId) =>
    this.participations.findById(id);
}
