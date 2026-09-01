import type { Tarifs } from "~~/shared/website/tarifs.schema";

export const DEFAULT_TARIFS: Tarifs = {
  title: "Tarifs",
  subtitle: "",
  intro:
    "Nos tarifs pour une saison pour l'inscription et la licence ffta sont :",
  items: [
    {
      id: "tarif-adultes",
      label: "adultes",
      amount: "195 euros",
    },
    {
      id: "tarif-mineurs",
      label: "mineur·e·s, étudiant·e·s",
      amount: "170 euros",
    },
    {
      id: "tarif-reduit",
      label: "demandeur·euse·s d'emploi et + de 70 ans",
      amount: "170 euros",
    },
  ],
  callout_segments: [
    {
      id: "tarifs-callout-lead",
      text: "La demande étant forte, envoyez-nous un mail à ",
      style: "highlight",
      insert_contact_email: false,
    },
    {
      id: "tarifs-callout-email",
      text: "",
      style: "highlight",
      insert_contact_email: true,
    },
    {
      id: "tarifs-callout-body",
      text: " afin de savoir si une place est disponible pour nous rencontrer le mercredi soir à partir de 19h30 afin de tester notre activité ",
      style: "plain",
      insert_contact_email: false,
    },
    {
      id: "tarifs-callout-emphasis",
      text: "(deux séances d'essai sont possibles)",
      style: "emphasis",
      insert_contact_email: false,
    },
    {
      id: "tarifs-callout-close",
      text: " avec nos entraîneurs !",
      style: "plain",
      insert_contact_email: false,
    },
  ],
};
