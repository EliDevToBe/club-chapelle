import { describe, expect, it } from "vitest";
import type { MemberRosterItem } from "~~/domain/user/member-roster-item";
import { toMemberRosterItemDto } from "~~/server/mappers/member-roster.mapper";

const invitedAt = new Date("2026-03-15T10:00:00.000Z");

describe("toMemberRosterItemDto", () => {
  it("serialises invited_at as ISO for pending invites", () => {
    const item: MemberRosterItem = {
      status: "invited",
      userId: "u-invited",
      archerId: "a-invited",
      email: "invited@club.test",
      publicName: "Pat Pending",
      roles: ["member"],
      invitedAt,
      offboardedAt: null,
    };

    expect(toMemberRosterItemDto(item).invited_at).toBe(invitedAt.toISOString());
    expect(toMemberRosterItemDto(item).offboarded_at).toBeNull();
  });

  it("serialises offboarded_at as ISO for archived rows", () => {
    const offboardedAt = new Date("2026-01-01T00:00:00.000Z");
    const item: MemberRosterItem = {
      status: "archived",
      userId: null,
      archerId: "a-archived",
      email: null,
      publicName: "Archived Archer",
      roles: [],
      invitedAt: null,
      offboardedAt,
    };

    expect(toMemberRosterItemDto(item).offboarded_at).toBe(
      offboardedAt.toISOString(),
    );
  });

  it("keeps invited_at null for non-invited rows", () => {
    const item: MemberRosterItem = {
      status: "active",
      userId: "u-active",
      archerId: "a-active",
      email: "active@club.test",
      publicName: "Robin H.",
      roles: ["member"],
      invitedAt: null,
      offboardedAt: null,
    };

    expect(toMemberRosterItemDto(item).invited_at).toBeNull();
    expect(toMemberRosterItemDto(item).offboarded_at).toBeNull();
  });
});
