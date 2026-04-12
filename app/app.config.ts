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
            link: [
              "hover:text-secondary active:text-secondary-600!",
              "transition-colors",
            ],
          },
        },
        {
          active: true,
          variant: "link",
          class: { link: ["active:text-primary-600!"] },
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

    carousel: {
      slots: {
        dots: "absolute inset-x-0 -bottom-7 flex flex-wrap items-center justify-center gap-3",
        dot: [
          "cursor-pointer size-3 bg-secondary-800 rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-primary",
          "transition",
        ],
      },
      variants: {
        active: {
          true: {
            dot: "data-[state=active]:bg-secondary",
          },
        },
      },
    },

    button: {
      slots: {
        base: [
          "justify-center rounded-lg font-medium inline-flex items-center disabled:cursor-not-allowed aria-disabled:cursor-not-allowed disabled:opacity-75 aria-disabled:opacity-75",
          "transition-colors",
        ],
      },
    },
  },
});
