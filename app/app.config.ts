export default defineAppConfig({
  ui: {
    colors: {
      primary: "arc-orange",
      secondary: "arc-grey",
      neutral: "arc-grey",
    },

    container: {
      // Each breakpoint is restated so tailwind-merge drops the theme's `sm:px-6 lg:px-8`.
      base: [
        "w-full max-w-(--ui-container) mx-auto",
        "px-(--container-gutter) sm:px-(--container-gutter) lg:px-(--container-gutter)",
      ],
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

    footer: {
      slots: {
        root: "",
        top: "py-8 lg:py-12",
        bottom: "py-8 lg:py-12",
        container:
          "py-8 lg:py-4 lg:flex lg:items-center lg:justify-between lg:gap-x-3",
        left: "flex items-center justify-center lg:justify-start lg:flex-1 gap-x-1.5 mt-1 lg:mt-0 lg:order-1",
        center: "mt-1 lg:mt-0 lg:order-2 flex items-center justify-center",
        right:
          "lg:flex-1 flex items-center justify-center lg:justify-end gap-x-1.5 lg:order-3",
      },
    },

    navigationMenu: {
      compoundVariants: [
        {
          disabled: false,
          active: false,
          variant: "link",
          class: {
            base: "group transition-colors",
            linkLeadingIcon:
              "group-hover:text-primary group-active:text-primary-800!",
            link: [
              "hover:text-primary active:text-primary-800!",
              "transition-colors",
            ],
          },
        },
        {
          active: true,
          variant: "link",
          class: {
            link: [
              "text-primary underline underline-offset-6 decoration-2",
              "active:text-primary-800!",
            ],
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
        {
          // The label's default `truncate` (overflow: hidden) clips the offset underline.
          variant: "link",
          class: {
            linkLabel: "overflow-visible",
          },
        },
      ],
    },

    carousel: {
      slots: {
        dots: "absolute inset-x-0 -bottom-7 flex flex-wrap items-center justify-center gap-3",
        dot: [
          "cursor-pointer size-3 bg-primary-500/30 rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-primary",
          "transition",
        ],
      },
      variants: {
        active: {
          true: {
            dot: "data-[state=active]:bg-primary-500",
          },
        },
      },
    },

    button: {
      slots: {
        base: [
          "cursor-pointer justify-center font-label font-semibold uppercase tracking-wide inline-flex items-center disabled:cursor-not-allowed aria-disabled:cursor-not-allowed disabled:opacity-75 aria-disabled:opacity-75",
          "transition-colors",
        ],
      },
      compoundVariants: [
        {
          loading: true,
          class: { base: "cursor-not-allowed bg-neutral-600! " },
        },
        {
          color: "primary",
          variant: "solid",
          class: {
            base: [
              "cursor-pointer text-arc-grey-950 bg-primary-500",
              "hover:bg-primary-600",
              "active:bg-primary-600",
              "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
              "disabled:bg-accented! aria-disabled:bg-primary-500",
            ],
          },
        },
        {
          color: "secondary",
          variant: "solid",
          class: {
            base: [
              "cursor-pointer text-inverted bg-secondary",
              "hover:bg-secondary-700",
              "active:bg-secondary-800",
              "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary",
              "disabled:bg-accented aria-disabled:bg-secondary",
            ],
          },
        },
        {
          color: "secondary",
          variant: "outline",
          class: {
            base: [
              "cursor-pointer",
              "active:bg-secondary/7 active:text-secondary-800",
            ],
          },
        },
        {
          color: "primary",
          variant: "outline",
          class: {
            base: [
              "ring ring-inset ring-primary/50 text-primary",
              "hover:bg-primary/10",
              "active:bg-primary/7 active:ring-primary/30 active:text-primary-800",
              "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary",
              "disabled:bg-transparent aria-disabled:bg-transparent",
              "dark:disabled:bg-transparent dark:aria-disabled:bg-transparent",
            ],
          },
        },
        {
          color: "secondary",
          variant: "outline",
          class: {
            base: [
              "ring ring-inset ring-secondary/50 text-secondary",
              "hover:bg-secondary/10",
              "active:bg-secondary/7 active:ring-secondary/30 active:text-secondary-800",
              "focus:outline-none focus-visible:ring-2 focus-visible:ring-secondary",
              "disabled:bg-transparent aria-disabled:bg-transparent",
              "dark:disabled:bg-transparent dark:aria-disabled:bg-transparent",
            ],
          },
        },
        {
          variant: "link",
          color: "primary",
          class: {
            base: [
              "cursor-pointer",
              "text-primary hover:text-primary-800 hover:underline hover:underline-offset-4",
            ],
          },
        },
        {
          color: "secondary",
          variant: "ghost",
          class: {
            base: [
              "text-secondary",
              "hover:bg-secondary/10 hover:text-highlighted",
              "active:bg-secondary/7 active:text-highlighted",
              "focus:outline-none focus-visible:bg-secondary/10",
              "disabled:bg-transparent aria-disabled:bg-transparent",
              "dark:disabled:bg-transparent dark:aria-disabled:bg-transparent",
            ],
          },
        },
        {
          color: "error",
          variant: "ghost",
          class: {
            base: [
              "text-error-500 cursor-pointer",
              "hover:bg-error/10 hover:text-error-400",
              "active:bg-error/7 active:text-error-700",
              "focus:outline-none focus-visible:bg-error/10",
              "disabled:bg-transparent aria-disabled:bg-transparent",
              "dark:disabled:bg-transparent dark:aria-disabled:bg-transparent",
            ],
          },
        },
      ],
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

    progress: {
      slots: {
        root: "gap-0",
      },
    },

    inputMenu: {
      slots: {
        trailingIcon:
          "group-data-[state=open]:rotate-90 transition-transform duration-200",
        item: "hover:cursor-pointer",
      },
    },

    selectMenu: {
      slots: {
        item: "hover:cursor-pointer",
        arrow: "i-ph-caret-right-duotone",
        trailingIcon:
          "group-data-[state=open]:rotate-90 transition-transform duration-200",
      },
    },

    tabs: {
      slots: {
        // Long uppercase labels wrap on phones instead of being cut ("GESTION DU C…").
        label: "whitespace-normal text-center leading-tight",
        trigger: [
          "font-label uppercase tracking-wide",
          "data-[state=inactive]:text-muted",
          "hover:data-[state=inactive]:not-disabled:text-highlighted",
          "hover:data-[state=inactive]:not-disabled:cursor-pointer",
        ],
      },
    },

    card: {
      slots: {
        root: "border border-default ring-transparent!",
        header: "bg-muted",
      },
    },

    calendar: {
      slots: {
        cellTrigger: "data-disabled:text-dimmed!",
      },
    },

    drawer: {
      compoundVariants: [
        {
          direction: ["right", "left"],
          class: {
            content: "w-auto max-w-[calc(100%-2rem)]",
            handle: "h-12! w-1! bg-transparent!",
          },
        },
      ],
    },

    pagination: {
      slots: {
        prev: [
          "disabled:text-dimmed! aria-disabled:text-dimmed!",
          "disabled:opacity-100 aria-disabled:opacity-100",
        ],
        next: [
          "disabled:text-dimmed! aria-disabled:text-dimmed!",
          "disabled:opacity-100 aria-disabled:opacity-100",
        ],
        first: [
          "disabled:text-dimmed! aria-disabled:text-dimmed!",
          "disabled:opacity-100 aria-disabled:opacity-100",
        ],
        last: [
          "disabled:text-dimmed! aria-disabled:text-dimmed!",
          "disabled:opacity-100 aria-disabled:opacity-100",
        ],
      },
    },
  },
});
