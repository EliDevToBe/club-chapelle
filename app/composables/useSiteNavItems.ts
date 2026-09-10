import type { NavigationMenuItem } from "@nuxt/ui";
import { useAuthUser } from "./useAuthUser";

export const useSiteNavItems = () => {
  const route = useRoute();
  const { isAdmin, user } = useAuthUser();
  const { isEnabled } = useFeatureFlags();

  const competitionFlag = isEnabled("competition_dashboard");
  const facebookFeedFlag = isEnabled("facebook_feed");

  const navItems = computed<NavigationMenuItem[][]>(() => {
    const baseItems: NavigationMenuItem[] = [];

    baseItems.push({
      label: "Accueil",
      to: "/",
      active: route.path === "/" || route.path === "",
    });

    if (facebookFeedFlag.value) {
      baseItems.push({
        label: "Actualités",
        to: "/feed",
        active: route.path.startsWith("/feed"),
      });
    }

    baseItems.push(
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

    if (user.value && competitionFlag.value) {
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
        class: "text-info",
      });
    }

    const finalItems = [baseItems, ...(isAdmin.value ? [adminItems] : [])];
    return finalItems;
  });

  const drawerNavItems = computed<NavigationMenuItem[][]>(() => {
    const items = navItems.value.map((group) => {
      return [...group];
    });

    if (!user.value) {
      return items;
    }

    const settingsItem: NavigationMenuItem = {
      label: "Paramètres",
      to: "/settings",
      active: route.path.startsWith("/settings"),
    };

    const lastGroup = items[items.length - 1];
    if (isAdmin.value && lastGroup) {
      lastGroup.push(settingsItem);
      return items;
    }

    return [...items, [settingsItem]];
  });

  return {
    navItems,
    drawerNavItems,
  };
};
