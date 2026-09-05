import type { ArcherId } from "~~/domain/archer/archer";
import type { API_ERROR_REASON } from "~~/shared/api-error-reasons";

export type OffboardArcherShellResult =
  | { ok: true }
  | {
      ok: false;
      reason:
        | typeof API_ERROR_REASON.common.not_found
        | typeof API_ERROR_REASON.archer.linked
        | typeof API_ERROR_REASON.archer.already_offboarded;
    };

export interface OffboardArcherShellPersistence {
  /**
   * Marks an unlinked archer shell as offboarded (archived).
   * Rejects when the archer is linked to an auth account or already offboarded.
   */
  offboardShell: (id: ArcherId) => Promise<OffboardArcherShellResult>;
}
