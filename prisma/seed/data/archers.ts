/** Linked archers: each row gets one `auth_user` */
export const seedLinkedArchers = [
  {
    public_name: "Claire Bernard",
    email: "seed.member01@local.test",
    role: "member" as const,
  },
  {
    public_name: "Lucas Girard",
    email: "seed.member02@local.test",
    role: "member" as const,
  },
  {
    public_name: "Amélie Rousseau",
    email: "seed.manager01@local.test",
    role: "manager" as const,
  },
  {
    public_name: "Hugo Mercier",
    email: "seed.manager02@local.test",
    role: "manager" as const,
  },
  {
    public_name: "Nathalie Petit",
    email: "seed.admin01@local.test",
    role: "admin" as const,
  },
  {
    public_name: "Thomas Blanchard",
    email: "seed.admin02@local.test",
    role: "admin" as const,
  },
  {
    public_name: "Local Dev",
    email: "local@dev.com",
    role: "developer" as const,
  },
] as const;

/** Archers without a login (historical / back-office only). */
export const seedUnlinkedArcherNames = [
  "Élodie Fontaine",
  "Julien Caron",
  "Manon Dupuis",
  "Antoine Rolland",
  "Camille Marchand",
  "Pierre Lefèvre",
  "Sarah Colin",
  "Nicolas Perrot",
  "Laura Benoit",
  "Mathieu Garnier",
  "Pauline Hubert",
  "Rémi Deschamps",
  "Julie Vincent",
  "Olivier Masson",
] as const;
