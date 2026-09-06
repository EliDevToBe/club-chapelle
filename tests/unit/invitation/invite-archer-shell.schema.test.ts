import { describe, expect, it } from "vitest";
import {
  inviteArcherShellBodySchema,
  prepareInviteArcherShellBody,
} from "~~/shared/invitation/invite-archer-shell.schema";
import {
  clampMemberRosterPage,
  getMemberRosterPageSlice,
} from "~~/shared/member/member-roster-pagination";

describe("prepareInviteArcherShellBody", () => {
  it("trims archer_id and normalises email", () => {
    expect(
      prepareInviteArcherShellBody({
        archer_id: "  a-1  ",
        email: "  Robin@Club.Test ",
      }),
    ).toEqual({
      archer_id: "a-1",
      email: "robin@club.test",
    });
  });

  it("validates with the schema", () => {
    const parsed = inviteArcherShellBodySchema.parse(
      prepareInviteArcherShellBody({
        archer_id: "a-1",
        email: "robin@club.test",
      }),
    );
    expect(parsed).toEqual({
      archer_id: "a-1",
      email: "robin@club.test",
    });
  });
});

describe("member roster pagination helpers", () => {
  it("slices the current page", () => {
    const items = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
    expect(getMemberRosterPageSlice(items, 1, 10)).toEqual([
      1, 2, 3, 4, 5, 6, 7, 8, 9, 10,
    ]);
    expect(getMemberRosterPageSlice(items, 2, 10)).toEqual([11]);
  });

  it("clamps the page when the page size changes", () => {
    expect(clampMemberRosterPage(3, 11, 10)).toBe(2);
    expect(clampMemberRosterPage(1, 0, 8)).toBe(1);
  });
});
