import { describe, expect, it } from "vitest";
import {
  OWN_PROFILE_NAME_MAX_LENGTH,
  parseOwnChangeEmailBody,
  parseOwnChangePasswordBody,
  parseOwnConfirmEmailChangeBody,
  parseOwnProfileNameBody,
} from "~~/shared/user/own-profile.schema";

describe("own-profile schemas", () => {
  it("trims the account name", () => {
    expect(parseOwnProfileNameBody({ name: "  Sam  " })).toEqual({
      name: "Sam",
    });
  });

  it("rejects an empty name", () => {
    expect(() => {
      parseOwnProfileNameBody({ name: "   " });
    }).toThrow();
  });

  it("accepts a name of 40 characters", () => {
    const name = "A".repeat(OWN_PROFILE_NAME_MAX_LENGTH);
    expect(parseOwnProfileNameBody({ name })).toEqual({ name });
  });

  it("rejects a name longer than 40 characters", () => {
    expect(() => {
      parseOwnProfileNameBody({
        name: "A".repeat(OWN_PROFILE_NAME_MAX_LENGTH + 1),
      });
    }).toThrow();
  });

  it("normalises the new e-mail", () => {
    expect(
      parseOwnChangeEmailBody({
        current_password: "Secret1!",
        email: "  New@Club.Test  ",
      }),
    ).toEqual({
      current_password: "Secret1!",
      email: "new@club.test",
    });
  });

  it("accepts a six-digit OTP", () => {
    expect(parseOwnConfirmEmailChangeBody({ otp: " 123456 " })).toEqual({
      otp: "123456",
    });
  });

  it("rejects a weak new password", () => {
    expect(() => {
      parseOwnChangePasswordBody({
        current_password: "old",
        new_password: "short",
      });
    }).toThrow();
  });
});
