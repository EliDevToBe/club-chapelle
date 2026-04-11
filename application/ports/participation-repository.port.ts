import type {
  Participation,
  ParticipationId,
} from "~~/domain/participations/participation";

export interface ParticipationRepository {
  findById: (id: ParticipationId) => Promise<Participation | null>;
}
