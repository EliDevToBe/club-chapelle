import type { OpeningHours } from "~~/shared/website/opening-hours.schema";

export const DEFAULT_OPENING_HOURS: OpeningHours = {
  intro:
    "Actuellement nous bénéficions de quatre créneaux au gymnase Tristan Tzara dans le 18ème :",
  slots: [
    {
      id: "creneau-lundi",
      label: "le lundi soir",
      time_range: "19h30 à minuit",
      audience: "ouvert uniquement aux archer·e·s confirmé·e·s",
      highlight: false,
      highlight_text: "",
    },
    {
      id: "creneau-mercredi",
      label: "le mercredi soir",
      time_range: "19h30 à minuit",
      audience: "mais ouvert à toutes et tous",
      highlight: true,
      highlight_text: "dédié à l'initiation",
    },
    {
      id: "creneau-jeudi",
      label: "le jeudi soir",
      time_range: "18h à 20h",
      audience: "ouvert uniquement aux archer·e·s confirmé·e·s",
      highlight: false,
      highlight_text: "",
    },
    {
      id: "creneau-dimanche",
      label: "le dimanche matin",
      time_range: "9h à 11h",
      audience: "ouvert uniquement aux archer·e·s confirmé·e·s",
      highlight: false,
      highlight_text: "",
    },
  ],
  epilogue:
    "Nous pratiquons plusieurs types de tir au sein du club. La plupart d'entre nous participent à des compétitions mais le mot d'ordre de notre association est d'échanger autour de ce sport et de passer un moment agréable et convivial.",
};
