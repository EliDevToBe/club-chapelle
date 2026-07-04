import type {
  CompetitionCategoryEnum,
  CompetitionTypeEnum,
  DistanceEnum,
  PayerEnum,
  PaymentStatusEnum,
  TargetEnum,
} from "~~/shared/db-enums";

/** Inputs needed to validate participation rows against club business rules. */
export type ParticipationRuleInput = {
  category: CompetitionCategoryEnum;
  type: CompetitionTypeEnum;
  payer: PayerEnum;
  paymentStatus: PaymentStatusEnum;
  distance: DistanceEnum;
  target: TargetEnum | null;
};

const INDOOR_FORBIDDEN_TYPES: readonly CompetitionTypeEnum[] = [
  "beursault",
  "field",
  "nature",
];

const OUTDOOR_FIELD_NATURE_D3: readonly CompetitionTypeEnum[] = [
  "field",
  "nature",
  "d3",
];

const OUTDOOR_OLYMPIC_DISTANCES: readonly DistanceEnum[] = [
  "m50",
  "m60",
  "m70",
  "beginner",
];

const INDOOR_OLYMPIC_DISTANCES: readonly DistanceEnum[] = ["m18", "beginner"];

export const ALLOWED_TARGETS: readonly TargetEnum[] = ["trispot", "spot40"];

export const allowedDistancesForCompetition = (
  category: CompetitionCategoryEnum,
  type: CompetitionTypeEnum,
): DistanceEnum[] => {
  if (category === "indoor") {
    if (INDOOR_FORBIDDEN_TYPES.includes(type)) {
      return [];
    }
    if (type === "olympic") {
      return [...INDOOR_OLYMPIC_DISTANCES];
    }
    if (type === "d3") {
      return ["other"];
    }
    return [];
  }

  if (category === "outdoor") {
    if (OUTDOOR_FIELD_NATURE_D3.includes(type)) {
      return ["other"];
    }
    if (type === "beursault") {
      return ["m50"];
    }
    if (type === "olympic") {
      return [...OUTDOOR_OLYMPIC_DISTANCES];
    }
  }

  return [];
};

export const isTargetRequiredForCompetition = (
  category: CompetitionCategoryEnum,
  type: CompetitionTypeEnum,
): boolean => {
  return category === "indoor" && type === "olympic";
};

export const validateParticipationRules = (
  input: ParticipationRuleInput,
): { valid: true } | { valid: false; reason: string } => {
  if (
    input.payer === "club" &&
    input.paymentStatus === "pending_reimbursement"
  ) {
    return {
      valid: false,
      reason:
        "payment_status cannot be pending_reimbursement when payer is club",
    };
  }

  if (
    input.target !== null &&
    (input.category !== "indoor" || input.type !== "olympic")
  ) {
    return {
      valid: false,
      reason: "target is only used for indoor olympic competitions",
    };
  }

  if (input.category === "indoor") {
    if (INDOOR_FORBIDDEN_TYPES.includes(input.type)) {
      return {
        valid: false,
        reason:
          "indoor competition cannot use beursault, field, or nature type",
      };
    }

    if (input.type !== "olympic" && input.type !== "d3") {
      return {
        valid: false,
        reason: "indoor competition type must be olympic or d3",
      };
    }

    if (input.type === "olympic") {
      if (input.distance !== "m18" && input.distance !== "beginner") {
        return {
          valid: false,
          reason:
            "indoor olympic participation distance must be m18 or beginner",
        };
      }
    }

    if (input.type === "d3") {
      if (input.distance !== "other") {
        return {
          valid: false,
          reason: "indoor d3 participation distance must be other",
        };
      }
    }

    return { valid: true };
  }

  if (input.category === "outdoor") {
    if (input.distance === "m18") {
      return {
        valid: false,
        reason: "outdoor participation cannot use distance m18",
      };
    }

    if (OUTDOOR_FIELD_NATURE_D3.includes(input.type)) {
      if (input.distance !== "other") {
        return {
          valid: false,
          reason:
            "outdoor field, nature, and d3 participations must use distance other",
        };
      }
    }

    if (input.type === "beursault") {
      if (input.distance !== "m50") {
        return {
          valid: false,
          reason: "outdoor beursault participation distance must be m50",
        };
      }
    }

    if (input.type === "olympic") {
      if (!OUTDOOR_OLYMPIC_DISTANCES.includes(input.distance)) {
        return {
          valid: false,
          reason:
            "outdoor olympic participation distance must be m50, m60, m70, or beginner",
        };
      }
    }

    return { valid: true };
  }

  return { valid: false, reason: "unknown category" };
};
