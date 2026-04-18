import type { SessionUser } from "~~/shared/auth/session-user";

type AuthSessionResponse = {
  session: SessionUser | null;
};

export const useAuthUser = () => {
  const user = useState<SessionUser | null>("auth-user", () => null);
  const hydrated = useState<boolean>("auth-user-hydrated", () => false);

  const setUser = (sessionSnapshot: SessionUser | null) => {
    user.value = sessionSnapshot;
    hydrated.value = true;
  };

  const clearSession = () => {
    setUser(null);
  };

  const fetchSession = async () => {
    const response = await $fetch<AuthSessionResponse>("/api/auth/session", {
      credentials: "include",
    });
    setUser(response.session);
    return response.session;
  };

  const hydrateIfNeeded = async () => {
    if (hydrated.value || user.value !== null) {
      return user.value;
    }
    try {
      return await fetchSession();
    } catch {
      setUser(null);
      return null;
    }
  };

  if (import.meta.client) {
    onMounted(() => {
      void hydrateIfNeeded();
    });
  }

  return {
    user,
    hydrated: computed(() => hydrated.value),
    fetchSession,
    setUser,
    clearSession,
  };
};
