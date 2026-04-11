/** String unions aligned with Prisma / Postgres enums in prisma/schema.prisma. */

export type CompetitionCategoryEnum = "indoor" | "outdoor";

export type CompetitionTypeEnum =
  | "olympic"
  | "beursault"
  | "field"
  | "nature"
  | "d3";

export type RegistrationStatusEnum =
  | "to_register"
  | "pending"
  | "waiting_list"
  | "registered"
  | "cancelled";

export type PaymentStatusEnum =
  | "to_pay"
  | "pending_reimbursement"
  | "paid"
  | "cancelled";

export type PayerEnum = "archer" | "club";

export type DistanceEnum = "m18" | "m50" | "m60" | "m70" | "beginner" | "other";

export type TargetEnum = "trispot" | "spot40";

export type WeaponEnum = "recurve" | "barebow" | "longbow" | "compound";

export type TokenTypeEnum =
  | "invitation"
  | "forgot_password"
  | "reset_password"
  | "change_email";
