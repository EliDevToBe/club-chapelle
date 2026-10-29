import type { NavigationMenuItem } from "@nuxt/ui";
import { useAuthUser } from "./useAuthUser";

export const useSiteNavItems = () => {
  const route = useRoute();
  const { isAdmin, user } = useAuthUser();
  const { isEnabled } = useFeatureFlags();

  const competitionFlag = isEnabled("competition_dashboard");
  const facebookFeedFlag = isEnabled("facebook_feed");

  /** Public links; the logo is the way home and the account menu holds member links. */
  const baseNavItems = computed<NavigationMenuItem[]>(() => {
    const items: NavigationMenuItem[] = [];

    if (facebookFeedFlag.value) {
      items.push({
        label: "Actualités",
        to: "/feed",
        active: route.path.startsWith("/feed"),
      });
    }

    items.push(
      {
        label: "Infos",
        to: { path: "/", hash: "#informations" },
        active: false,
      },
      {
        label: "Contact",
        to: { path: "/", hash: "#contact" },
        active: false,
      },
    );

    return items;
  });

  /** Member links shown in the mobile drawer and desktop account dropdown. */
  const accountNavItems = computed<NavigationMenuItem[]>(() => {
    if (!user.value) {
      return [];
    }

    const items: NavigationMenuItem[] = [];

    if (competitionFlag.value) {
      items.push({
        label: "Compétitions",
        to: "/competitions",
        active: route.path.startsWith("/competitions"),
        icon: "i-ph-target-duotone",
      });
    }

    if (isAdmin.value) {
      items.push({
        label: "Admin",
        to: "/admin",
        active: route.path.startsWith("/admin"),
        color: "info",
        icon: "i-ph-shield-check-duotone",
      });
    }

    items.push({
      label: "Paramètres",
      to: "/settings",
      active: route.path.startsWith("/settings"),
      icon: "i-ph-gear-six-duotone",
    });

    return items;
  });

  const navItems = computed<NavigationMenuItem[][]>(() => {
    return [baseNavItems.value];
  });

  const drawerNavItems = computed<NavigationMenuItem[][]>(() => {
    const groups: NavigationMenuItem[][] = [baseNavItems.value];

    if (accountNavItems.value.length > 0) {
      groups.push(accountNavItems.value);
    }

    return groups;
  });

  return {
    navItems,
    drawerNavItems,
    accountNavItems,
  };
};
