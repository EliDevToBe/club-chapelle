import type { TextSection } from "~~/shared/website/text-section.schema";
import {
  TEXT_SECTION_KEYS,
  type TextSectionKey,
} from "~~/shared/website/website-config.keys";

export const DEFAULT_HOMEPAGE_WELCOME: TextSection = {
  title: "Bienvenue aux Archers de La Chapelle",
  subtitle: "",
  paragraphs: [
    "Les Archers de La Chapelle (ARC18) est un club de tir à l’arc à Paris. Ce site remplace l’ancienne vitrine pour offrir une information plus claire aux visiteurs, aux futurs adhérents et aux membres.",
    "Retrouvez toutes les informations pratiques et les moyens de nous contacter, le tout au même endroit.",
  ],
};

export const DEFAULT_INFOS_INTRODUCTION: TextSection = {
  title: "Informations",
  subtitle: "À propos de nous !",
  paragraphs: [
    "Notre club de tir à l'arc compte une cinquantaine d'archers et archères de tous âges. À noter que nous n'accueillons les plus jeunes qu'à partir de 14 ans.",
    "Nous pratiquons et enseignons le tir à l'arc.",
  ],
};

export const DEFAULT_CLUB_PHILOSOPHY: TextSection = {
  title: "Philosophie du club",
  subtitle: "",
  paragraphs: [
    "Que ce soit dans notre gouvernance, nos projets, mais aussi nos évènements, notre association se veut de garantir un espace de confiance et en toute sécurité pour chacun·e·s d’entre nous quelque soit notre genre, âge, notre orientation sexuelle, notre origine ethnique, notre origine sociale ou encore notre corps.",
    "Notre association s’engage contre toute forme de rejet de l’autre alors mettons ces valeurs en application. Nous sommes intransigeant·e·s sur les actes racistes, sexistes et toutes les -phobies qui existent et qui sont, pour rappel, répréhensibles par la loi.",
  ],
};

export const TEXT_SECTION_SEEDS: Record<TextSectionKey, TextSection> = {
  [TEXT_SECTION_KEYS.homepageWelcome]: DEFAULT_HOMEPAGE_WELCOME,
  [TEXT_SECTION_KEYS.infosIntroduction]: DEFAULT_INFOS_INTRODUCTION,
  [TEXT_SECTION_KEYS.clubPhilosophy]: DEFAULT_CLUB_PHILOSOPHY,
};

export const getTextSectionSeed = (sectionKey: TextSectionKey): TextSection => {
  return TEXT_SECTION_SEEDS[sectionKey];
};
