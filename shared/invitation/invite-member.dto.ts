import type { UserDto } from "~~/shared/user/user.dto";

export type InviteMemberBodyDto = {
  name: string;
  email: string;
  /**
   * When true, an existing pending invite may be resent.
   * Create-from-modal must leave this false; row “re-invite” sets it true.
   */
  allow_resent?: boolean;
};

export type InviteMemberResponseDto = {
  user: UserDto;
  mail_sent: boolean;
  resent: boolean;
};
