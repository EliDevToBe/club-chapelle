import type { ArcherDto } from "~~/shared/archer/archer.dto";
import type { InviteArcherShellResponseDto } from "~~/shared/invitation/invite-archer-shell.dto";
import type { InviteMemberResponseDto } from "~~/shared/invitation/invite-member.dto";
import type { MemberRosterResponseDto } from "~~/shared/member/member-roster.dto";
import type { MemberRosterListQuery } from "~~/shared/member/member-roster-list.schema";
import type { SetUserRoleResponseDto } from "~~/shared/user/set-user-role.dto";
import type { AssignableClubRole } from "~~/shared/user/set-user-role.schema";

export const useMemberManagement = () => {
  const isLoading = ref(false);
  const isInviting = ref(false);
  const isRevoking = ref(false);
  const isDeleting = ref(false);
  const isUpdatingPublicName = ref(false);
  const isSettingRole = ref(false);
  const items = ref<MemberRosterResponseDto["items"]>([]);
  const total = ref(0);

  const listRoster = async (
    query: MemberRosterListQuery,
  ): Promise<MemberRosterResponseDto> => {
    isLoading.value = true;
    try {
      const response = await $fetch<MemberRosterResponseDto>(
        "/api/members/roster",
        {
          credentials: "include",
          query,
        },
      );
      items.value = response.items;
      total.value = response.total;
      return response;
    } finally {
      isLoading.value = false;
    }
  };

  const invite = async (body: {
    name: string;
    email: string;
    allow_resent?: boolean;
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

  const inviteShell = async (body: {
    archer_id: string;
    email: string;
  }): Promise<InviteArcherShellResponseDto> => {
    isInviting.value = true;
    try {
      const response = await $fetch<InviteArcherShellResponseDto>(
        "/api/invitations/bind-archer",
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

  const revoke = async (userId: string): Promise<void> => {
    isRevoking.value = true;
    try {
      await $fetch(`/api/users/${userId}/revoke`, {
        method: "POST",
        credentials: "include",
      });
    } finally {
      isRevoking.value = false;
    }
  };

  const deleteArcher = async (archerId: string): Promise<void> => {
    isDeleting.value = true;
    try {
      await $fetch(`/api/archers/${archerId}`, {
        method: "DELETE",
        credentials: "include",
      });
    } finally {
      isDeleting.value = false;
    }
  };

  const updatePublicName = async (
    archerId: string,
    publicName: string,
  ): Promise<ArcherDto> => {
    isUpdatingPublicName.value = true;
    try {
      const response = await $fetch<{ archer: ArcherDto }>(
        `/api/archers/${archerId}`,
        {
          method: "PATCH",
          credentials: "include",
          body: { public_name: publicName },
        },
      );
      return response.archer;
    } finally {
      isUpdatingPublicName.value = false;
    }
  };

  const setRole = async (
    userId: string,
    role: AssignableClubRole,
  ): Promise<SetUserRoleResponseDto["user"]> => {
    isSettingRole.value = true;
    try {
      const response = await $fetch<SetUserRoleResponseDto>(
        `/api/users/${userId}/role`,
        {
          method: "PATCH",
          credentials: "include",
          body: { role },
        },
      );
      return response.user;
    } finally {
      isSettingRole.value = false;
    }
  };

  return {
    items,
    total,
    isLoading,
    isInviting,
    isRevoking,
    isDeleting,
    isUpdatingPublicName,
    isSettingRole,
    listRoster,
    invite,
    inviteShell,
    revoke,
    deleteArcher,
    updatePublicName,
    setRole,
  };
};
