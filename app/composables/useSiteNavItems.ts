import type { NavigationMenuItem } from "@nuxt/ui";
import { useAuthUser } from "./useAuthUser";

export const useSiteNavItems = () => {
  const route = useRoute();
  const { isAdmin, user } = useAuthUser();

  const navItems = computed<NavigationMenuItem[][]>(() => {
    const baseItems: NavigationMenuItem[] = [];
    baseItems.push(
      {
        label: "Accueil",
        to: "/",
        active: route.path === "/" || route.path === "",
      },
      {
        label: "Infos",
        to: "/infos",
        active: route.path.startsWith("/infos"),
      },
      {
        label: "Contact",
        to: "/contact",
        active: route.path.startsWith("/contact"),
      },
    );

    if (user.value) {
      baseItems.push({
        label: "Compétitions",
        to: "/competitions",
        active: route.path.startsWith("/competitions"),
      });
    }

    // This serves as a spacer between the base items and the admin items
    baseItems.push({});

    const adminItems: NavigationMenuItem[] = [];

    if (isAdmin.value) {
      adminItems.push({
        label: "Admin",
        to: "/admin",
        active: route.path.startsWith("/admin"),
      });
    }

    const finalItems = [baseItems, ...(isAdmin.value ? [adminItems] : [])];
    return finalItems;
  });

  return {
    navItems,
  };
};
