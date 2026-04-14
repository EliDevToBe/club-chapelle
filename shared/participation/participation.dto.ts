import type {
  DistanceEnum,
  PayerEnum,
  PaymentStatusEnum,
  RegistrationStatusEnum,
  TargetEnum,
  WeaponEnum,
} from "~~/shared/db-enums";

/** Full `participation` row shape (dates as ISO `YYYY-MM-DD`). */
export type ParticipationDto = {
  id: string;
  archer_id: string;
  competition_id: string;
  registration_status: RegistrationStatusEnum;
  payment_status: PaymentStatusEnum;
  payer: PayerEnum;
  distance: DistanceEnum;
  target: TargetEnum | null;
  weapon: WeaponEnum | null;
  created_at: string;
};

export type ParticipationCreateDto = {
  archer_id: string;
  competition_id: string;
  registration_status?: RegistrationStatusEnum;
  payment_status?: PaymentStatusEnum;
  payer?: PayerEnum;
  distance: DistanceEnum;
  target?: TargetEnum | null;
  weapon?: WeaponEnum | null;
};

export type ParticipationUpdateDto = Partial<
  Omit<ParticipationCreateDto, "archer_id" | "competition_id">
>;
