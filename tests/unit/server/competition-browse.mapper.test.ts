import { describe, expect, it } from "vitest";
import type { ParticipationWithArcherSummary } from "~~/application/ports/participation-repository.port";
import {
  toParticipationBrowseRowDto,
  viewerIsAdminForBrowse,
} from "~~/server/mappers/competition-listing.mapper";

const baseRow = (): ParticipationWithArcherSummary => ({
  id: "p1",
  archerId: "ar1",
  competitionId: "c1",
  registrationStatus: "registered",
  paymentStatus: "to_pay",
  payer: "archer",
  distance: "m18",
  target: null,
  weapon: null,
  createdAt: new Date("2026-02-01T00:00:00.000Z"),
  archerPublicName: "Jean",
  archerAuthUserId: "user-1",
});

describe("viewerIsAdminForBrowse", () => {
  it("returns true for admin", () => {
    expect(viewerIsAdminForBrowse(["member", "admin"])).toBe(true);
  });

  it("returns true for developer", () => {
    expect(viewerIsAdminForBrowse(["developer"])).toBe(true);
  });

  it("returns false for member only", () => {
    expect(viewerIsAdminForBrowse(["member"])).toBe(false);
  });
});

describe("toParticipationBrowseRowDto", () => {
  it("includes statuses for admin viewer", () => {
    const row = baseRow();
    const dto = toParticipationBrowseRowDto(row, {
      userId: "someone-else",
      roles: ["admin"],
    });
    expect(dto.registration_status).toBe("registered");
    expect(dto.payment_status).toBe("to_pay");
  });

  it("includes statuses for developer viewer", () => {
    const row = baseRow();
    const dto = toParticipationBrowseRowDto(row, {
      userId: "someone-else",
      roles: ["developer"],
    });
    expect(dto.payment_status).toBe("to_pay");
  });

  it("includes statuses when archer is linked to viewer", () => {
    const row = baseRow();
    const dto = toParticipationBrowseRowDto(row, {
      userId: "user-1",
      roles: ["member"],
    });
    expect(dto.registration_status).toBe("registered");
    expect(dto.payment_status).toBe("to_pay");
  });

  it("redacts statuses for other members", () => {
    const row = baseRow();
    const dto = toParticipationBrowseRowDto(row, {
      userId: "other-user",
      roles: ["member"],
    });
    expect(dto.registration_status).toBeNull();
    expect(dto.payment_status).toBeNull();
    expect(dto.distance).toBe("m18");
    expect(dto.archer_public_name).toBe("Jean");
  });

  it("redacts when archer has no linked user", () => {
    const row: ParticipationWithArcherSummary = {
      ...baseRow(),
      archerAuthUserId: null,
    };
    const dto = toParticipationBrowseRowDto(row, {
      userId: "user-1",
      roles: ["member"],
    });
    expect(dto.registration_status).toBeNull();
    expect(dto.payment_status).toBeNull();
  });
});
