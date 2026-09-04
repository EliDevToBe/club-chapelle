import type { ArcherId } from "~~/domain/archer/archer";

export type DeleteArcherShellResult =
  | { ok: true }
  | { ok: false; reason: "not_found" | "archer_linked" };

export interface DeleteArcherPersistence {
  /**
   * Deletes an unlinked archer shell and its participations in one transaction.
   * Rejects when the archer is linked to an auth account.
   */
  deleteShell: (id: ArcherId) => Promise<DeleteArcherShellResult>;
}
