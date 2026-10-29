import type { FeaturedEvent } from "~~/shared/website/featured-event.schema";

export const DEFAULT_FEATURED_EVENT: FeaturedEvent = {
  enabled: false,
  title: "T.E.A.M — Tournoi par équipe d'archers mixte",
  image_url:
    "https://images.unsplash.com/photo-1510925758641-869d353cecc7?q=80&w=1200&auto=format&fit=crop",
  image_alt: "Archère en pleine visée lors d'un tournoi",
  paragraphs: [
    "Le club organise son tournoi par équipe d'archers mixte : un rendez-vous convivial ouvert à toutes et tous. Retrouvez les informations pratiques et le mandat de la compétition.",
  ],
  cta_label: "Infos & mandat",
  cta_url: "",
};
