import type { ArcherId } from "~~/domain/archer/archer";
import type { API_ERROR_REASON } from "~~/shared/api-error-reasons";

export type DeleteArcherShellResult =
  | { ok: true }
  | {
      ok: false;
      reason:
        | typeof API_ERROR_REASON.common.not_found
        | typeof API_ERROR_REASON.archer.linked
        | typeof API_ERROR_REASON.archer.not_offboarded;
    };

export interface DeleteArcherPersistence {
  /**
   * Deletes an offboarded unlinked archer shell and its participations in one transaction.
   * Rejects when the archer is linked to an auth account or not yet archived.
   */
  deleteShell: (id: ArcherId) => Promise<DeleteArcherShellResult>;
}
