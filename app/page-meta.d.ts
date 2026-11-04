declare module "#app" {
  interface PageMeta {
    /** Member-area and auth pages show only the footer bar, without the CONTACT band and form. */
    compactFooter?: boolean;
  }
}

export {};
