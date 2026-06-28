import type { CompetitionDto } from "~~/shared/competitions/competition.dto";
import type {
  DistanceEnum,
  PayerEnum,
  PaymentStatusEnum,
  RegistrationStatusEnum,
  TargetEnum,
  WeaponEnum,
} from "~~/shared/db-enums";

/**
 * One participation row for competition browse APIs.
 * `registration_status` / `payment_status` may be null when redacted for non-admin viewers.
 */
export type ParticipationBrowseRowDto = {
  id: string;
  archer_id: string;
  archer_public_name: string;
  archer_auth_user_id: string | null;
  competition_id: string;
  registration_status: RegistrationStatusEnum | null;
  payment_status: PaymentStatusEnum | null;
  payer: PayerEnum;
  distance: DistanceEnum;
  target: TargetEnum | null;
  weapon: WeaponEnum | null;
  created_at: string;
};

export type CompetitionListingDto = CompetitionDto & {
  participations: ParticipationBrowseRowDto[];
};
