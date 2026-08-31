import type { SessionUser } from "~~/shared/auth/session-user";

type AuthSessionResponse = {
  session: SessionUser | null;
};

/** Client-only: dedupe concurrent hydrations in the same tab. Never share across SSR requests. */
let clientHydration: Promise<SessionUser | null> | null = null;

export const useAuthUser = () => {
  const user = useState<SessionUser | null>("auth-user", () => {
    return null;
  });
  const hydrated = useState<boolean>("auth-user-hydrated", () => {
    return false;
  });

  const isDeveloper = computed(() => {
    return user.value?.roles.includes("developer");
  });
  const isAdmin = computed(() => {
    if (isDeveloper.value) {
      return true;
    }

    return user.value?.roles.includes("admin") ?? false;
  });

  const setUser = (sessionSnapshot: SessionUser | null) => {
    user.value = sessionSnapshot;
    hydrated.value = true;
  };

  const clearSession = () => {
    setUser(null);
  };

  /**
   * Fetches the current session snapshot for both SSR and client navigation.
   *
   * On SSR, we forward the incoming `cookie` header to the same-origin
   * `/api/auth/session` endpoint so the layout can render the real auth state
   * (avoids a logged-out flash on refresh). This does not expose cookies to
   * the browser or third parties.
   */
  const fetchSession = async () => {
    const headers = import.meta.server
      ? useRequestHeaders(["cookie"])
      : undefined;

    const response = await $fetch<AuthSessionResponse>("/api/auth/session", {
      credentials: "include",
      headers,
    });
    setUser(response.session);
    return response.session;
  };

  const hydrateIfNeeded = async () => {
    if (hydrated.value) {
      return user.value;
    }

    if (import.meta.server) {
      return fetchSession();
    }

    if (clientHydration) {
      return clientHydration;
    }

    clientHydration = (async () => {
      try {
        return await fetchSession();
      } finally {
        clientHydration = null;
      }
    })();

    return clientHydration;
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
    hydrated: computed(() => {
      return hydrated.value;
    }),
    hydrateIfNeeded,
    fetchSession,
    setUser,
    clearSession,
    login,
    logout,
  };
};
