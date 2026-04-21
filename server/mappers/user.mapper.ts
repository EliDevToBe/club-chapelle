import type {
  CreateUserInput,
  UpdateUserInput,
} from "~~/application/ports/user-repository.port";
import type { User } from "~~/domain/user/user";
import type {
  UserCreateDto,
  UserDto,
  UserUpdateDto,
} from "~~/shared/user/user.dto";
import { formatDateForDb } from "~~/shared/utils/dates";

export const toUserDto = (user: User): UserDto => ({
  id: user.id,
  email: user.email,
  name: user.name,
  roles: user.roles,
  authenticated: user.authenticated,
  created_at: formatDateForDb(user.createdAt),
});

export const toCreateUserInput = (dto: UserCreateDto): CreateUserInput => ({
  email: dto.email,
  name: dto.name,
  roles: dto.roles,
  authenticated: dto.authenticated,
  password: dto.password,
});

export const toUpdateUserInput = (dto: UserUpdateDto): UpdateUserInput => ({
  email: dto.email,
  name: dto.name,
  roles: dto.roles,
  authenticated: dto.authenticated,
  password: dto.password,
});
