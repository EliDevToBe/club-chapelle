import type { UserRepository } from "~~/application/ports/user-repository.port";
import type { UserId } from "~~/domain/user/user";

export class FindUserById {
  constructor(private readonly users: UserRepository) {}

  public async findById(id: UserId) {
    return this.users.findById(id);
  }
}
