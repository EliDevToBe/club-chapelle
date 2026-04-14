import type { ParticipationRepository } from "~~/application/ports/participation-repository.port";

export class ListParticipations {
  constructor(private readonly participations: ParticipationRepository) {}

  public findMany = async () => this.participations.findMany();
}
