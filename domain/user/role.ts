export const ROLE_ORDER = ["Member", "Manager", "Admin"] as const;

export type Role = (typeof ROLE_ORDER)[number];
