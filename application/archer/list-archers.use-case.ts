import type {
  ArcherRepository,
  FindArchersPageInput,
} from "~~/application/ports/archer-repository.port";

export class ListArchers {
  constructor(private readonly archers: ArcherRepository) {}

  public findMany = async () => {
    return this.archers.findMany();
  };

  public findPage = async (input: FindArchersPageInput) => {
    return this.archers.findPage({
      ...input,
      includeOffboarded: input.includeOffboarded ?? false,
    });
  };
}
