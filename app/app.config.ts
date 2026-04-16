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

    toast: {
      slots: {
        root: "relative group overflow-hidden bg-default shadow-lg rounded-lg ring ring-default p-4 flex gap-2.5 focus:outline-none",
        wrapper: "w-0 flex-1 flex flex-col",
        title: "text-sm font-medium text-highlighted",
        description: "text-sm text-muted",
        icon: "shrink-0 size-5",
        avatar: "shrink-0",
        avatarSize: "2xl",
        actions: "flex gap-1.5 shrink-0",
        progress: "absolute inset-x-0 bottom-0",
        close: "p-0",
      },
      variants: {
        color: {
          primary: {
            root: "ring ring-inset ring-primary/25 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary",
            icon: "text-primary",
            title: "text-primary font-semibold",
          },
          secondary: {
            root: "ring ring-inset ring-secondary/25 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-secondary",
            icon: "text-secondary",
            title: "text-secondary font-semibold",
          },
          success: {
            root: "ring ring-inset ring-success/25 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-success",
            icon: "text-success",
            title: "text-success font-semibold",
          },
          info: {
            root: "ring ring-inset ring-info/25 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-info",
            icon: "text-info",
            title: "text-info font-semibold",
          },
          warning: {
            root: "ring ring-inset ring-warning/25 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-warning",
            icon: "text-warning",
            title: "text-warning font-semibold",
          },
          error: {
            root: "ring ring-inset ring-error/25 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-error",
            icon: "text-error",
            title: "text-error font-semibold",
          },
          neutral: {
            root: "ring ring-inset ring-inverted/25 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-inverted",
            icon: "text-highlighted",
            title: "text-highlighted font-semibold",
          },
        },
        orientation: {
          horizontal: {
            root: "items-center",
            actions: "items-center",
          },
          vertical: {
            root: "items-start",
            actions: "items-start mt-2.5",
          },
        },
        title: {
          true: {
            description: "mt-1",
          },
        },
      },
    },
  },
});
