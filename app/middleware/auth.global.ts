import { useAuthUser } from "~/composables/useAuthUser";

export default defineNuxtRouteMiddleware(async (to, _from) => {
  const { user, isAdmin, hydrateIfNeeded } = useAuthUser();

  const adminRoutes = ["/admin"];
  const needAuthRoutes = ["/competitions"];
  const authRequiredRoutes = [...adminRoutes, ...needAuthRoutes];
  const preventAuthRoutes = ["/login", "/reset-password"];

  const isAdminRoute =
    adminRoutes.includes(to.path) ||
    adminRoutes.some((route) => to.path.startsWith(`${route}/`));

  const isAuthRequiredRoute =
    authRequiredRoutes.includes(to.path) ||
    authRequiredRoutes.some((route) => to.path.startsWith(`${route}/`));

  const isPreventAuthRoute =
    preventAuthRoutes.includes(to.path) ||
    preventAuthRoutes.some((route) => to.path.startsWith(`${route}/`));

  try {
    await hydrateIfNeeded();
  } catch {
    // Continue as unauthenticated
  }

  // Prevent auth user from accessing key public routes
  if (user.value && isPreventAuthRoute) {
    return navigateTo("/");
  }

  // Global auth required routes
  if (!user.value && isAuthRequiredRoute) {
    return navigateTo("/");
  }

  // Admin routes require admin role
  if (!isAdmin.value && isAdminRoute) {
    return navigateTo("/");
  }
});
