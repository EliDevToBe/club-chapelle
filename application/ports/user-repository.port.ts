import type { User, UserId } from "~~/domain/user/user";

export interface UserRepository {
  findById: (id: UserId) => Promise<User | null>;
}
