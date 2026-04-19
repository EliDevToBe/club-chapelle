import type { SessionUser } from "~~/shared/auth/session-user";

type AuthSessionResponse = {
  session: SessionUser | null;
};

let hydration: Promise<SessionUser | null> | null = null;

export const useAuthUser = () => {
  const user = useState<SessionUser | null>("auth-user", () => null);
  const hydrated = useState<boolean>("auth-user-hydrated", () => false);

  const isDeveloper = computed(() => user.value?.roles.includes("developer"));
  const isAdmin = computed(() => {
    if (isDeveloper.value) return true;
    return user.value?.roles.includes("admin");
  });

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

    if (hydration) {
      return hydration;
    }

    hydration = (async () => {
      try {
        const session = await fetchSession();
        return session;
      } finally {
        hydration = null;
      }
    })();
    return hydration;
  };

  const login = async (email: string, password: string) => {
    const response = await $fetch<{ ok: true; session: SessionUser }>(
      "/api/auth/login",
      {
        method: "POST",
        body: {
          email: email,
          password: password,
        },
        credentials: "include",
      },
    );
    setUser(response.session);
  };

  const logout = async () => {
    await $fetch("/api/auth/logout", {
      method: "POST",
      credentials: "include",
    });
    clearSession();
  };

  return {
    user,
    isDeveloper,
    isAdmin,
    hydrated: computed(() => hydrated.value),
    hydrateIfNeeded,
    fetchSession,
    setUser,
    clearSession,
    login,
    logout,
  };
};
