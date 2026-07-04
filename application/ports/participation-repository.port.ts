import type {
  Participation,
  ParticipationId,
} from "~~/domain/participations/participation";
import type {
  DistanceEnum,
  PayerEnum,
  PaymentStatusEnum,
  RegistrationStatusEnum,
  SessionEnum,
  TargetEnum,
  WeaponEnum,
} from "~~/shared/db-enums";

export type CreateParticipationInput = {
  archerId: string;
  competitionId: string;
  registrationStatus?: RegistrationStatusEnum;
  paymentStatus?: PaymentStatusEnum;
  payer?: PayerEnum;
  distance: DistanceEnum;
  target?: TargetEnum | null;
  weapon?: WeaponEnum | null;
  session?: SessionEnum | null;
};

export type UpdateParticipationInput = {
  registrationStatus?: RegistrationStatusEnum;
  paymentStatus?: PaymentStatusEnum;
  payer?: PayerEnum;
  distance?: DistanceEnum;
  target?: TargetEnum | null;
  weapon?: WeaponEnum | null;
  session?: SessionEnum | null;
};

/** Participation plus archer fields for browse / roster reads. */
export type ParticipationWithArcherSummary = Participation & {
  archerPublicName: string;
  archerAuthUserId: string | null;
};

export interface ParticipationRepository {
  create: (input: CreateParticipationInput) => Promise<Participation>;
  findById: (id: ParticipationId) => Promise<Participation | null>;
  findMany: () => Promise<Participation[]>;
  findManyWithArcherSummary: (
    competitionIds?: readonly string[],
  ) => Promise<ParticipationWithArcherSummary[]>;
  update: (
    id: ParticipationId,
    input: UpdateParticipationInput,
  ) => Promise<Participation | null>;
  delete: (id: ParticipationId) => Promise<boolean>;
}
