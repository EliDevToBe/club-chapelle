export const SETTINGS_SECTION_IDS = {
  profile: "profile",
  email: "email",
  password: "password",
  account: "account",
} as const;

export type SettingsSectionId =
  (typeof SETTINGS_SECTION_IDS)[keyof typeof SETTINGS_SECTION_IDS];

export type SettingsNavItem = {
  label: string;
  sectionId: SettingsSectionId;
  danger?: boolean;
};

export const SETTINGS_NAV_ITEMS: SettingsNavItem[] = [
  { label: "Profil", sectionId: SETTINGS_SECTION_IDS.profile },
  { label: "Email", sectionId: SETTINGS_SECTION_IDS.email },
  { label: "Mot de passe", sectionId: SETTINGS_SECTION_IDS.password },
  {
    label: "Compte",
    sectionId: SETTINGS_SECTION_IDS.account,
    danger: true,
  },
];

export const scrollToSettingsSection = (sectionId: SettingsSectionId): void => {
  const element = document.getElementById(sectionId);
  if (!element) {
    return;
  }

  element.scrollIntoView({ behavior: "smooth", block: "start" });
};
