import type { ParticipationRepository } from "~~/application/ports/participation-repository.port";
import type { ParticipationId } from "~~/domain/participations/participation";

export class StubParticipationRepository implements ParticipationRepository {
  findById = async (_id: ParticipationId) => null;
}
