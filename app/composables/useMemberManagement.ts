import type { InviteMemberResponseDto } from "~~/shared/invitation/invite-member.dto";
import type { UserDto } from "~~/shared/user/user.dto";

export const useMemberManagement = () => {
  const isLoading = ref(false);
  const isInviting = ref(false);
  const users = ref<UserDto[]>([]);

  const list = async (): Promise<UserDto[]> => {
    isLoading.value = true;
    try {
      const response = await $fetch<{ users: UserDto[] }>("/api/users", {
        credentials: "include",
      });
      users.value = response.users;
      return response.users;
    } finally {
      isLoading.value = false;
    }
  };

  const invite = async (body: {
    name: string;
    email: string;
  }): Promise<InviteMemberResponseDto> => {
    isInviting.value = true;
    try {
      const response = await $fetch<InviteMemberResponseDto>(
        "/api/invitations",
        {
          method: "POST",
          credentials: "include",
          body,
        },
      );
      return response;
    } finally {
      isInviting.value = false;
    }
  };

  return {
    users,
    isLoading,
    isInviting,
    list,
    invite,
  };
};
