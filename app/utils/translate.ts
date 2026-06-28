import type {
  CompetitionCategoryEnum,
  CompetitionTypeEnum,
  DistanceEnum,
  PaymentStatusEnum,
  RegistrationStatusEnum,
  TargetEnum,
} from "~~/shared/db-enums";

export const translateRegistrationStatus: Record<
  RegistrationStatusEnum,
  string
> = {
  to_register: "À inscrire",
  pending: "En attente",
  waiting_list: "Liste d’attente",
  registered: "Inscrit·e",
  cancelled: "Annulé·e",
} as const;

export const translateDistance: Record<DistanceEnum, string> = {
  m18: "18 m",
  m50: "50 m",
  m60: "60 m",
  m70: "70 m",
  beginner: "Débutant·e",
  other: "Autre distance",
} as const;

export const translatePaymentStatus: Record<PaymentStatusEnum, string> = {
  to_pay: "À payer",
  pending_reimbursement: "Remboursement",
  paid: "Payé",
  cancelled: "Annulé",
} as const;

export const translateTarget: Record<TargetEnum, string> = {
  trispot: "Trispot",
  spot40: "Spot 40",
} as const;

export const translateCompetitionCategory: Record<
  CompetitionCategoryEnum,
  string
> = {
  indoor: "Salle",
  outdoor: "Extérieur",
} as const;

export const translateCompetitionType: Record<CompetitionTypeEnum, string> = {
  olympic: "Olympique",
  beursault: "Beursault",
  field: "Field",
  nature: "Nature",
  d3: "D3",
} as const;
