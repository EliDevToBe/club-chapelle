import type { SetUserRoleBody } from "~~/shared/user/set-user-role.schema";
import type { UserDto } from "~~/shared/user/user.dto";

export type SetUserRoleBodyDto = SetUserRoleBody;

export type SetUserRoleResponseDto = {
  user: UserDto;
};
