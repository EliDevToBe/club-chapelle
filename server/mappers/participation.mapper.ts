import type {
  CreateParticipationInput,
  UpdateParticipationInput,
} from "~~/application/ports/participation-repository.port";
import type { Participation } from "~~/domain/participations/participation";
import type {
  ParticipationCreateDto,
  ParticipationDto,
  ParticipationUpdateDto,
} from "~~/shared/participation/participation.dto";
import { formatDateForDb } from "~~/shared/utils/dates";

export const toParticipationDto = (
  participation: Participation,
): ParticipationDto => ({
  id: participation.id,
  archer_id: participation.archerId,
  competition_id: participation.competitionId,
  registration_status: participation.registrationStatus,
  payment_status: participation.paymentStatus,
  payer: participation.payer,
  distance: participation.distance,
  target: participation.target,
  weapon: participation.weapon,
  created_at: formatDateForDb(participation.createdAt),
});

export const toCreateParticipationInput = (
  dto: ParticipationCreateDto,
): CreateParticipationInput => ({
  archerId: dto.archer_id,
  competitionId: dto.competition_id,
  registrationStatus: dto.registration_status,
  paymentStatus: dto.payment_status,
  payer: dto.payer,
  distance: dto.distance,
  target: dto.target,
  weapon: dto.weapon,
});

export const toUpdateParticipationInput = (
  dto: ParticipationUpdateDto,
): UpdateParticipationInput => ({
  registrationStatus: dto.registration_status,
  paymentStatus: dto.payment_status,
  payer: dto.payer,
  distance: dto.distance,
  target: dto.target,
  weapon: dto.weapon,
});
