// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  css: ["~/assets/css/main.css"],

  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },

  modules: ["@nuxt/ui", "@nuxt/test-utils/module"],

  runtimeConfig: {
    // Used for access and refresh, should be different from each other
    authJwtAccessSecret: process.env.AUTH_JWT_ACCESS_SECRET ?? "",
    authJwtRefreshSecret: process.env.AUTH_JWT_REFRESH_SECRET ?? "",

    public: {
      // Any public configuration here
      socialInstagram: "https://www.instagram.com/les_archers_de_la_chapelle",
      socialFacebook: "https://www.facebook.com/archersdelachapelle/",
    },
  },

  routeRules: {
    "/login": { redirect: "/work-in-progress" },
  },
});
