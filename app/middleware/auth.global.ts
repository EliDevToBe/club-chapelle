import { useAuthUser } from "~/composables/useAuthUser";

export default defineNuxtRouteMiddleware(async (to, _from) => {
  const { user, isAdmin } = useAuthUser();

  const adminRoutes = ["/club"];
  const authRequiredRoutes = [...adminRoutes];

  // Global auth required routes
  if (!user.value && authRequiredRoutes.includes(to.path)) {
    return navigateTo("/");
  }

  // Admin routes require admin role
  if (!isAdmin.value && adminRoutes.includes(to.path)) {
    return navigateTo("/");
  }
});
