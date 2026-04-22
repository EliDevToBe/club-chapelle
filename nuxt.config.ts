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

    // Mailtrap transactional (sandbox vs production via MAILTRAP_USE_SANDBOX)
    mailtrapApiKey: process.env.MAILTRAP_API_KEY ?? "",
    mailtrapUseSandbox: process.env.MAILTRAP_USE_SANDBOX === "true",
    mailtrapInboxId: process.env.MAILTRAP_INBOX_ID ?? "",
    mailtrapFromEmail: process.env.MAILTRAP_FROM_EMAIL ?? "",
    mailtrapFromName:
      process.env.MAILTRAP_FROM_NAME ?? "Les Archers de la Chapelle",
    contactFormToEmail:
      process.env.CONTACT_FORM_TO_EMAIL ?? "archerschapelle@gmail.com",
    /** Public site origin for password recovery links (no trailing slash). */
    passwordResetOrigin:
      process.env.PASSWORD_RESET_ORIGIN ?? "https://club-chapelle.vercel.app",

    public: {
      // Any public configuration here
      socialInstagram: "https://www.instagram.com/les_archers_de_la_chapelle",
      socialFacebook: "https://www.facebook.com/archersdelachapelle/",
    },
  },

  routeRules: {
    "/club": { redirect: "/work-in-progress" },
  },
});
