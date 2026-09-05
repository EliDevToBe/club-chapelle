import type {
  OffboardArcherShellPersistence,
  OffboardArcherShellResult,
} from "~~/application/ports/offboard-archer-shell-persistence.port";
import type { ArcherId } from "~~/domain/archer/archer";

export class OffboardArcherShell {
  constructor(private readonly persistence: OffboardArcherShellPersistence) {}

  public offboard = async (
    id: ArcherId,
  ): Promise<OffboardArcherShellResult> => {
    return this.persistence.offboardShell(id);
  };
}
