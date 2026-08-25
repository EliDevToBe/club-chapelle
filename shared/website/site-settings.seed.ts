/** Default club address shown on Contact until admin saves site settings. */
export const DEFAULT_CLUB_ADDRESS =
  "Gymnase Tristan Tzara, 11 rue Tristan Tzara, 75018 PARIS";

/** Public legal name of the association (éditeur du site). */
export const ASSOCIATION_LEGAL_NAME = "ARC 18 - Les Archers de la Chapelle";

/** LCEN identity fields: empty until the bureau fills them in site settings. */
export const EMPTY_LEGAL_IDENTITY_SETTINGS = {
  registered_office_address: "",
  publication_director: "",
  rna_number: "",
  siret: "",
  hosting_provider_name: "vercel.com",
  hosting_provider_address: "604 Cameron Street, Alexandria, VA 22314, USA",
  hosting_provider_phone: "+64.48319528",
} as const;
