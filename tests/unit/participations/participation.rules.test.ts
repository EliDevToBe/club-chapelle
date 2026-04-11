import { describe, expect, it } from "vitest";
import {
  type ParticipationRuleInput,
  validateParticipationRules,
} from "~~/domain/participations/participation.rules";

const base = (): ParticipationRuleInput => ({
  category: "indoor",
  type: "olympic",
  payer: "archer",
  paymentStatus: "to_pay",
  distance: "m18",
  target: "trispot",
});

describe("validateParticipationRules", () => {
  it("accepts indoor olympic with m18 and target", () => {
    expect(validateParticipationRules(base()).valid).toBe(true);
  });

  it("accepts indoor olympic with beginner and null target", () => {
    expect(
      validateParticipationRules({
        ...base(),
        distance: "beginner",
        target: null,
      }).valid,
    ).toBe(true);
  });

  it("accepts indoor d3 with other and no target", () => {
    expect(
      validateParticipationRules({
        ...base(),
        type: "d3",
        distance: "other",
        target: null,
      }).valid,
    ).toBe(true);
  });

  it("accepts outdoor olympic with m70", () => {
    expect(
      validateParticipationRules({
        ...base(),
        category: "outdoor",
        type: "olympic",
        distance: "m70",
        target: null,
      }).valid,
    ).toBe(true);
  });

  it("accepts outdoor beursault with m50", () => {
    expect(
      validateParticipationRules({
        ...base(),
        category: "outdoor",
        type: "beursault",
        distance: "m50",
        target: null,
      }).valid,
    ).toBe(true);
  });

  it("accepts outdoor field with other", () => {
    expect(
      validateParticipationRules({
        ...base(),
        category: "outdoor",
        type: "field",
        distance: "other",
        target: null,
      }).valid,
    ).toBe(true);
  });

  it("accepts club payer when payment is not pending_reimbursement", () => {
    expect(
      validateParticipationRules({
        ...base(),
        payer: "club",
        paymentStatus: "paid",
      }).valid,
    ).toBe(true);
  });

  it("rejects club payer with pending_reimbursement", () => {
    const r = validateParticipationRules({
      ...base(),
      payer: "club",
      paymentStatus: "pending_reimbursement",
    });
    expect(r.valid).toBe(false);
    if (!r.valid) {
      expect(r.reason).toContain("club");
    }
  });

  it("rejects indoor beursault", () => {
    const r = validateParticipationRules({ ...base(), type: "beursault" });
    expect(r.valid).toBe(false);
  });

  it("rejects indoor olympic with wrong distance", () => {
    const r = validateParticipationRules({
      ...base(),
      distance: "m50",
    });
    expect(r.valid).toBe(false);
  });

  it("rejects outdoor with m18", () => {
    const r = validateParticipationRules({
      ...base(),
      category: "outdoor",
      type: "olympic",
      distance: "m18",
      target: null,
    });
    expect(r.valid).toBe(false);
  });

  it("rejects outdoor beursault without m50", () => {
    const r = validateParticipationRules({
      ...base(),
      category: "outdoor",
      type: "beursault",
      distance: "m60",
      target: null,
    });
    expect(r.valid).toBe(false);
  });

  it("rejects outdoor olympic with distance other", () => {
    const r = validateParticipationRules({
      ...base(),
      category: "outdoor",
      type: "olympic",
      distance: "other",
      target: null,
    });
    expect(r.valid).toBe(false);
  });

  it("rejects outdoor field without other", () => {
    const r = validateParticipationRules({
      ...base(),
      category: "outdoor",
      type: "field",
      distance: "m50",
      target: null,
    });
    expect(r.valid).toBe(false);
  });

  it("rejects target on outdoor competition", () => {
    const r = validateParticipationRules({
      ...base(),
      category: "outdoor",
      type: "olympic",
      distance: "m60",
      target: "spot40",
    });
    expect(r.valid).toBe(false);
  });

  it("rejects target on indoor d3", () => {
    const r = validateParticipationRules({
      ...base(),
      type: "d3",
      distance: "other",
      target: "trispot",
    });
    expect(r.valid).toBe(false);
  });
});
