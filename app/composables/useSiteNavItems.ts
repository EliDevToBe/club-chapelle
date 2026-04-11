import type { NavigationMenuItem } from "@nuxt/ui";

export const useSiteNavItems = () => {
  const route = useRoute();

  return computed<NavigationMenuItem[]>(() => [
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
  ]);
};
