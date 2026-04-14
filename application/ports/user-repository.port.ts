import type { User, UserId } from "~~/domain/user/user";
import type { RoleEnum } from "~~/shared/db-enums";

export type CreateUserInput = {
  email: string;
  role: RoleEnum;
  authenticated?: boolean;
  password?: string | null;
};

export type UpdateUserInput = {
  email?: string;
  role?: RoleEnum;
  authenticated?: boolean;
  password?: string | null;
};

export interface UserRepository {
  create: (input: CreateUserInput) => Promise<User>;
  findById: (id: UserId) => Promise<User | null>;
  findMany: () => Promise<User[]>;
  update: (id: UserId, input: UpdateUserInput) => Promise<User | null>;
  delete: (id: UserId) => Promise<boolean>;
}
