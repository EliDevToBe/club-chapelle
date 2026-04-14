import type { UserRepository } from "~~/application/ports/user-repository.port";
import type { UserId } from "~~/domain/user/user";

export class FindUserById {
  constructor(private readonly users: UserRepository) {}

  public findById = async (id: UserId) => this.users.findById(id);
}
