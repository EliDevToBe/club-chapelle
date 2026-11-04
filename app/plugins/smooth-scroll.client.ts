/**
 * Enables `scroll-behavior: smooth` (see `html.smooth-scroll` in main.css) only once the page has
 * loaded. On refresh the browser restores the previous scroll position itself; if smooth scrolling
 * is already on, that restore is animated and the page visibly re-scrolls from the top.
 */
export default defineNuxtPlugin(() => {
  const enableSmoothScroll = (): void => {
    requestAnimationFrame(() => {
      document.documentElement.classList.add("smooth-scroll");
    });
  };

  if (document.readyState === "complete") {
    enableSmoothScroll();
    return;
  }

  window.addEventListener("load", enableSmoothScroll, { once: true });
});
