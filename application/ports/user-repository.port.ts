import type { User, UserId } from "~~/domain/user/user";
import type { RoleEnum } from "~~/shared/db-enums";

/** Row fields needed for password login (not part of the public `User` domain type). */
export type UserAuthCredentials = {
  id: UserId;
  email: string;
  name: string | null;
  roles: RoleEnum[];
  authenticated: boolean;
  passwordHash: string | null;
};

export type CreateUserInput = {
  email: string;
  name?: string | null;
  roles: RoleEnum[];
  authenticated?: boolean;
  password?: string | null;
};

export type UpdateUserInput = {
  email?: string;
  name?: string | null;
  roles?: RoleEnum[];
  authenticated?: boolean;
  password?: string | null;
};

/** Row for password-reset eligibility (same checks as login for “can sign in with password”). */
export type UserPasswordResetLookup = {
  id: UserId;
  email: string;
  name: string | null;
  authenticated: boolean;
  passwordHash: string | null;
};

export interface UserRepository {
  create: (input: CreateUserInput) => Promise<User>;
  findById: (id: UserId) => Promise<User | null>;
  findByEmailWithPasswordHash: (
    email: string,
  ) => Promise<UserAuthCredentials | null>;
  findByEmailForPasswordReset: (
    email: string,
  ) => Promise<UserPasswordResetLookup | null>;
  findMany: () => Promise<User[]>;
  update: (id: UserId, input: UpdateUserInput) => Promise<User | null>;
  delete: (id: UserId) => Promise<boolean>;
}
