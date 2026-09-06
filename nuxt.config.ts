// https://nuxt.com/docs/api/configuration/nuxt-config

const defaultContactEmail = process.env.DEFAULT_CONTACT_EMAIL ?? "";

export default defineNuxtConfig({
  vite: {
    optimizeDeps: {
      include: ["@vue/devtools-core", "@vue/devtools-kit", "zod"],
    },
  },

  css: ["~/assets/css/main.css"],

  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },

  modules: ["@nuxt/ui", "@nuxt/test-utils/module"],

  runtimeConfig: {
    // Used for access and refresh, should be different from each other
    authJwtAccessSecret: process.env.AUTH_JWT_ACCESS_SECRET ?? "",
    authJwtRefreshSecret: process.env.AUTH_JWT_REFRESH_SECRET ?? "",

    // Mailtrap transactional (sandbox vs production via MAILTRAP_USE_SANDBOX)
    mailtrapApiKey: process.env.MAILTRAP_API_KEY ?? "",
    mailtrapUseSandbox: process.env.MAILTRAP_USE_SANDBOX === "true",
    mailtrapInboxId: process.env.MAILTRAP_INBOX_ID ?? "",
    mailtrapFromEmail: process.env.MAILTRAP_FROM_EMAIL ?? "",
    mailtrapFromName:
      process.env.MAILTRAP_FROM_NAME ?? "Les Archers de la Chapelle",
    /** Public site origin for e-mail links (no trailing slash). */
    baseUrl: process.env.BASE_URL,

    sirvApiClientId: process.env.SIRV_API_CLIENT_ID,
    sirvApiClientSecret: process.env.SIRV_API_CLIENT_SECRET,
    sirvCdnDomain: process.env.SIRV_CDN_DOMAIN,
    sirvDirectory: process.env.SIRV_DIRECTORY,

    public: {
      defaultContactEmail,
      socialInstagram: "https://www.instagram.com/les_archers_de_la_chapelle",
      socialFacebook: "https://www.facebook.com/archersdelachapelle",
    },
  },

  routeRules: {
    // Club routes are now handled by the auth middleware
  },
});
