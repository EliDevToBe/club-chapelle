export default defineAppConfig({
  ui: {
    colors: {
      primary: "brand-carrot",
      secondary: "brand-greenblue",
    },

    header: {
      slots: {
        center: "hidden md:flex",
        toggle: "md:hidden",
        content: "md:hidden",
        overlay: "md:hidden",
        left: "md:flex-1 flex items-center gap-1.5",
        right: "md:flex-1 flex items-center justify-end gap-1.5",
      },
    },

    navigationMenu: {
      compoundVariants: [
        {
          disabled: false,
          active: false,
          variant: "link",
          class: {
            link: ["hover:text-secondary", "transition-colors"],
          },
        },
        {
          variant: "link",
          orientation: "vertical",
          class: {
            list: "flex flex-col gap-4",
            link: "justify-end",
          },
        },
        {
          variant: "link",
          orientation: "horizontal",
          class: {
            list: "gap-2",
          },
        },
      ],
    },
  },
});
