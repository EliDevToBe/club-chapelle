import { describe, expect, it } from "vitest";

describe("nuxt test environment", () => {
  it("runs with the Nuxt Vitest environment", () => {
    expect(import.meta.env).toBeDefined();
  });
});
