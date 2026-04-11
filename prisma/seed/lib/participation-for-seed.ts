import type {
  CompetitionCategoryEnum,
  CompetitionTypeEnum,
  DistanceEnum,
  PayerEnum,
  PaymentStatusEnum,
  RegistrationStatusEnum,
  TargetEnum,
  WeaponEnum,
} from "../../../shared/db-enums";

export const distanceAndTargetForSeed = (
  category: CompetitionCategoryEnum,
  type: CompetitionTypeEnum,
  salt: number,
): { distance: DistanceEnum; target: TargetEnum | null } => {
  if (category === "indoor" && type === "olympic") {
    const distances: DistanceEnum[] = ["m18", "beginner"];
    const targets: TargetEnum[] = ["trispot", "spot40"];
    return {
      distance: distances[salt % 2] as DistanceEnum,
      target: targets[salt % 2] as TargetEnum,
    };
  }
  if (category === "indoor" && type === "d3") {
    return { distance: "other", target: null };
  }

  if (category === "outdoor") {
    if (type === "field" || type === "nature" || type === "d3") {
      return { distance: "other", target: null };
    }
    if (type === "beursault") {
      return { distance: "m50", target: null };
    }
    if (type === "olympic") {
      const distances: DistanceEnum[] = ["m50", "m60", "m70", "beginner"];
      return { distance: distances[salt % 4] as DistanceEnum, target: null };
    }
  }
  throw new Error(`Unsupported competition shape: ${category} ${type}`);
};

export const payerPaymentForSeed = (
  salt: number,
): { payer: PayerEnum; paymentStatus: PaymentStatusEnum } => {
  const rows: { payer: PayerEnum; paymentStatus: PaymentStatusEnum }[] = [
    { payer: "archer", paymentStatus: "to_pay" },
    { payer: "archer", paymentStatus: "pending_reimbursement" },
    { payer: "archer", paymentStatus: "paid" },
    { payer: "club", paymentStatus: "paid" },
    { payer: "club", paymentStatus: "to_pay" },
    { payer: "archer", paymentStatus: "cancelled" },
    { payer: "club", paymentStatus: "cancelled" },
  ];
  return rows[salt % rows.length] as {
    payer: PayerEnum;
    paymentStatus: PaymentStatusEnum;
  };
};

export const registrationStatusForSeed = (
  salt: number,
): RegistrationStatusEnum => {
  const r: readonly RegistrationStatusEnum[] = [
    "to_register",
    "pending",
    "waiting_list",
    "registered",
    "cancelled",
  ];
  return r[salt % r.length] as RegistrationStatusEnum;
};

export const weaponForSeed = (salt: number): WeaponEnum | null => {
  const weapons: readonly WeaponEnum[] = [
    "recurve",
    "barebow",
    "longbow",
    "compound",
  ];
  return salt % 7 === 0
    ? null
    : (weapons[salt % weapons.length] as WeaponEnum | null);
};
