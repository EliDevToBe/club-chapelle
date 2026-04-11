import type { UserRepository } from "~~/application/ports/user-repository.port";
import type { UserId } from "~~/domain/user/user";

export class StubUserRepository implements UserRepository {
  findById = async (_id: UserId) => null;
}
