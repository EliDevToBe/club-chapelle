import type { ArcherId } from "../archer/archer";
import type { CompetitionId } from "../competitions/competition";

export type ParticipationId = string;

export type FeeStatus = "unpaid" | "pending" | "paid";

export type Participation = {
  id: ParticipationId;
  archerId: ArcherId;
  competitionId: CompetitionId;
  feeStatus: FeeStatus;
};
