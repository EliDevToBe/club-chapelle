import type { ArcherId } from "~~/domain/archer/archer";

export type OffboardArcherShellResult =
  | { ok: true }
  | {
      ok: false;
      reason: "not_found" | "archer_linked" | "already_offboarded";
    };

export interface OffboardArcherShellPersistence {
  /**
   * Marks an unlinked archer shell as offboarded (archived).
   * Rejects when the archer is linked to an auth account or already offboarded.
   */
  offboardShell: (id: ArcherId) => Promise<OffboardArcherShellResult>;
}
