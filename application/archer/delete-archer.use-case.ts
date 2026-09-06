import type {
  DeleteArcherPersistence,
  DeleteArcherShellResult,
} from "~~/application/ports/delete-archer-persistence.port";
import type { ArcherId } from "~~/domain/archer/archer";

export class DeleteArcher {
  constructor(private readonly persistence: DeleteArcherPersistence) {}

  public delete = async (id: ArcherId): Promise<DeleteArcherShellResult> => {
    return this.persistence.deleteShell(id);
  };
}
