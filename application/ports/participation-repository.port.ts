import type {
  Participation,
  ParticipationId,
} from "~~/domain/participations/participation";
import type {
  DistanceEnum,
  PayerEnum,
  PaymentStatusEnum,
  RegistrationStatusEnum,
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
};

export type UpdateParticipationInput = {
  registrationStatus?: RegistrationStatusEnum;
  paymentStatus?: PaymentStatusEnum;
  payer?: PayerEnum;
  distance?: DistanceEnum;
  target?: TargetEnum | null;
  weapon?: WeaponEnum | null;
};

export interface ParticipationRepository {
  create: (input: CreateParticipationInput) => Promise<Participation>;
  findById: (id: ParticipationId) => Promise<Participation | null>;
  findMany: () => Promise<Participation[]>;
  update: (
    id: ParticipationId,
    input: UpdateParticipationInput,
  ) => Promise<Participation | null>;
  delete: (id: ParticipationId) => Promise<boolean>;
}
