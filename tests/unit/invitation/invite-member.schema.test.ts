import { describe, expect, it } from "vitest";
import {
  inviteMemberBodySchema,
  parseInviteMemberBody,
  prepareInviteMemberBody,
} from "~~/shared/invitation/invite-member.schema";

describe("prepareInviteMemberBody", () => {
  it("trims the name and lowercases the email", () => {
    expect(
      prepareInviteMemberBody({
        name: "  Alex Archer  ",
        email: "Alex@Club.Test",
      }),
    ).toEqual({
      name: "Alex Archer",
      email: "alex@club.test",
      allow_resent: false,
    });
  });

  it("keeps allow_resent when provided", () => {
    expect(
      prepareInviteMemberBody({
        name: "Alex",
        email: "alex@club.test",
        allow_resent: true,
      }),
    ).toEqual({
      name: "Alex",
      email: "alex@club.test",
      allow_resent: true,
    });
  });
});

describe("parseInviteMemberBody", () => {
  it("parses a valid payload", () => {
    expect(
      parseInviteMemberBody({
        name: "Alex",
        email: "alex@club.test",
      }),
    ).toEqual({
      name: "Alex",
      email: "alex@club.test",
      allow_resent: false,
    });
  });

  it("rejects an empty name", () => {
    expect(() => {
      parseInviteMemberBody({ name: "   ", email: "alex@club.test" });
    }).toThrow();
  });

  it("rejects an invalid email", () => {
    const prepared = prepareInviteMemberBody({
      name: "Alex",
      email: "not-an-email",
    });
    expect(inviteMemberBodySchema.safeParse(prepared).success).toBe(false);
  });
});
