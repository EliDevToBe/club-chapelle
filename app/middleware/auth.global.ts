import { useAuthUser } from "~/composables/useAuthUser";

export default defineNuxtRouteMiddleware(async (to, from) => {
  const { user } = useAuthUser();

  console.log(to, from);

  const adminRoutes = ["/club"];
  const authRequiredRoutes = [...adminRoutes];

  // Global auth required routes
  if (!user.value && authRequiredRoutes.includes(to.path)) {
    return navigateTo("/");
  }
});
