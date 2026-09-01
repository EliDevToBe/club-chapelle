import type { UserDto } from "~~/shared/user/user.dto";

export type InviteMemberBodyDto = {
  name: string;
  email: string;
};

export type InviteMemberResponseDto = {
  user: UserDto;
  mail_sent: boolean;
  resent: boolean;
};
