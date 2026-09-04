import type { ArcherDto } from "~~/shared/archer/archer.dto";
import type { InviteArcherShellResponseDto } from "~~/shared/invitation/invite-archer-shell.dto";
import type { InviteMemberResponseDto } from "~~/shared/invitation/invite-member.dto";
import type { MemberRosterItemDto } from "~~/shared/member/member-roster.dto";

export const useMemberManagement = () => {
  const isLoading = ref(false);
  const isInviting = ref(false);
  const isRevoking = ref(false);
  const isDeleting = ref(false);
  const isUpdatingPublicName = ref(false);
  const items = ref<MemberRosterItemDto[]>([]);

  const listRoster = async (): Promise<MemberRosterItemDto[]> => {
    isLoading.value = true;
    try {
      const response = await $fetch<{ items: MemberRosterItemDto[] }>(
        "/api/members/roster",
        {
          credentials: "include",
        },
      );
      items.value = response.items;
      return response.items;
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

  return {
    items,
    isLoading,
    isInviting,
    isRevoking,
    isDeleting,
    isUpdatingPublicName,
    listRoster,
    invite,
    inviteShell,
    revoke,
    deleteArcher,
    updatePublicName,
  };
};
