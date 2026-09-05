import { beforeEach, describe, expect, it, vi } from "vitest";
import { OffboardArcherShell } from "~~/application/archer/offboard-archer-shell.use-case";
import type { OffboardArcherShellPersistence } from "~~/application/ports/offboard-archer-shell-persistence.port";
import { API_ERROR_REASON } from "~~/shared/api-error-reasons";

describe("OffboardArcherShell", () => {
  let persistence: OffboardArcherShellPersistence;

  beforeEach(() => {
    persistence = {
      offboardShell: vi.fn().mockResolvedValue({ ok: true }),
    };
  });

  it("delegates to persistence and returns success", async () => {
    const handler = new OffboardArcherShell(persistence);
    const result = await handler.offboard("a-shell");

    expect(result).toEqual({ ok: true });
    expect(persistence.offboardShell).toHaveBeenCalledWith("a-shell");
  });

  it("returns not_found from persistence", async () => {
    persistence.offboardShell = vi.fn().mockResolvedValue({
      ok: false,
      reason: API_ERROR_REASON.common.not_found,
    });
    const handler = new OffboardArcherShell(persistence);
    const result = await handler.offboard("missing");

    expect(result).toEqual({
      ok: false,
      reason: API_ERROR_REASON.common.not_found,
    });
  });

  it("returns archer_linked from persistence", async () => {
    persistence.offboardShell = vi.fn().mockResolvedValue({
      ok: false,
      reason: API_ERROR_REASON.archer.linked,
    });
    const handler = new OffboardArcherShell(persistence);
    const result = await handler.offboard("a-linked");

    expect(result).toEqual({
      ok: false,
      reason: API_ERROR_REASON.archer.linked,
    });
  });

  it("returns already_offboarded from persistence", async () => {
    persistence.offboardShell = vi.fn().mockResolvedValue({
      ok: false,
      reason: API_ERROR_REASON.archer.already_offboarded,
    });
    const handler = new OffboardArcherShell(persistence);
    const result = await handler.offboard("a-archived");

    expect(result).toEqual({
      ok: false,
      reason: API_ERROR_REASON.archer.already_offboarded,
    });
  });
});
