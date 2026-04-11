import type {
  DistanceEnum,
  PayerEnum,
  PaymentStatusEnum,
  RegistrationStatusEnum,
  TargetEnum,
  WeaponEnum,
} from "~~/shared/db-enums";

/** Archer registration for a competition (matches `participation` table). */
export type Participation = {
  id: string;
  archerId: string;
  competitionId: string;
  registrationStatus: RegistrationStatusEnum;
  paymentStatus: PaymentStatusEnum;
  payer: PayerEnum;
  distance: DistanceEnum;
  target: TargetEnum | null;
  weapon: WeaponEnum | null;
  createdAt: Date;
};
