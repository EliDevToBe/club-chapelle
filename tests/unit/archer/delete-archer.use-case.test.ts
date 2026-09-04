import { beforeEach, describe, expect, it, vi } from "vitest";
import { DeleteArcher } from "~~/application/archer/delete-archer.use-case";
import type { DeleteArcherPersistence } from "~~/application/ports/delete-archer-persistence.port";

describe("DeleteArcher", () => {
  let persistence: DeleteArcherPersistence;

  beforeEach(() => {
    persistence = {
      deleteShell: vi.fn().mockResolvedValue({ ok: true }),
    };
  });

  it("delegates to persistence and returns success", async () => {
    const handler = new DeleteArcher(persistence);
    const result = await handler.delete("a-shell");

    expect(result).toEqual({ ok: true });
    expect(persistence.deleteShell).toHaveBeenCalledWith("a-shell");
  });

  it("returns not_found from persistence", async () => {
    persistence.deleteShell = vi.fn().mockResolvedValue({
      ok: false,
      reason: "not_found",
    });
    const handler = new DeleteArcher(persistence);
    const result = await handler.delete("missing");

    expect(result).toEqual({ ok: false, reason: "not_found" });
  });

  it("returns archer_linked from persistence", async () => {
    persistence.deleteShell = vi.fn().mockResolvedValue({
      ok: false,
      reason: "archer_linked",
    });
    const handler = new DeleteArcher(persistence);
    const result = await handler.delete("a-linked");

    expect(result).toEqual({ ok: false, reason: "archer_linked" });
  });
});
