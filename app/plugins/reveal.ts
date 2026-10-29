/**
 * `v-reveal`: fades a block in the first time it scrolls into view (the design's "apparition au scroll").
 * Blocks already on screen at mount, and visitors who prefer reduced motion, are left untouched so
 * server-rendered content never flashes or disappears.
 */
const REVEAL_CLASS = "reveal";
const REVEAL_PENDING_CLASS = "reveal-pending";

const observers = new WeakMap<HTMLElement, IntersectionObserver>();

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.directive<HTMLElement>("reveal", {
    getSSRProps: () => {
      return {};
    },

    mounted: (element) => {
      const prefersReducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;
      const isAlreadyVisible =
        element.getBoundingClientRect().top < window.innerHeight;

      if (
        prefersReducedMotion ||
        isAlreadyVisible ||
        !("IntersectionObserver" in window)
      ) {
        return;
      }

      element.classList.add(REVEAL_CLASS, REVEAL_PENDING_CLASS);

      const observer = new IntersectionObserver(
        (entries) => {
          const isIntersecting = entries.some((entry) => {
            return entry.isIntersecting;
          });

          if (!isIntersecting) {
            return;
          }

          element.classList.remove(REVEAL_PENDING_CLASS);
          observer.disconnect();
          observers.delete(element);
        },
        { rootMargin: "0px 0px -10% 0px" },
      );

      observer.observe(element);
      observers.set(element, observer);
    },

    beforeUnmount: (element) => {
      observers.get(element)?.disconnect();
      observers.delete(element);
    },
  });
});
