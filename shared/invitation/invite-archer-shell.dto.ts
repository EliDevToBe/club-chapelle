import type { UserDto } from "~~/shared/user/user.dto";

export type InviteArcherShellBodyDto = {
  archer_id: string;
  email: string;
};

export type InviteArcherShellResponseDto = {
  user: UserDto;
  mail_sent: boolean;
  resent: boolean;
};
