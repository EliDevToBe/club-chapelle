import type { SessionUser } from "~~/shared/auth/session-user";
import type { OwnProfileDto } from "~~/shared/user/own-profile.dto";

export const useOwnProfile = () => {
  const fetchProfile = async () => {
    return $fetch<OwnProfileDto>("/api/me", {
      credentials: "include",
    });
  };

  const updateName = async (name: string) => {
    return $fetch<{ ok: true; session: SessionUser }>("/api/me", {
      method: "PATCH",
      body: { name },
      credentials: "include",
    });
  };

  const changePassword = async (input: {
    currentPassword: string;
    newPassword: string;
  }) => {
    return $fetch<{ ok: true }>("/api/me/change-password", {
      method: "POST",
      body: {
        current_password: input.currentPassword,
        new_password: input.newPassword,
      },
      credentials: "include",
    });
  };

  const requestEmailChange = async (input: {
    currentPassword: string;
    email: string;
  }) => {
    return $fetch<{ ok: true }>("/api/me/change-email", {
      method: "POST",
      body: {
        current_password: input.currentPassword,
        email: input.email,
      },
      credentials: "include",
    });
  };

  const confirmEmailChange = async (otp: string) => {
    return $fetch<{ ok: true; email: string }>("/api/me/confirm-email-change", {
      method: "POST",
      body: { otp },
      credentials: "include",
    });
  };

  const resendEmailChange = async () => {
    return $fetch<{ ok: true }>("/api/me/resend-email-change", {
      method: "POST",
      credentials: "include",
    });
  };

  const cancelEmailChange = async () => {
    return $fetch<{ ok: true }>("/api/me/cancel-email-change", {
      method: "POST",
      credentials: "include",
    });
  };

  const revokeAccess = async (currentPassword: string) => {
    return $fetch<{ ok: true }>("/api/me/revoke", {
      method: "POST",
      body: { current_password: currentPassword },
      credentials: "include",
    });
  };

  return {
    fetchProfile,
    updateName,
    changePassword,
    requestEmailChange,
    confirmEmailChange,
    resendEmailChange,
    cancelEmailChange,
    revokeAccess,
  };
};
