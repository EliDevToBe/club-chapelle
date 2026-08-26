<template>
  <ContentPageWrapper>
    <ChapSection
      is-main-section
      title="Informations"
      description="À propos de nous !"
    >
      <ContentTextWrapper class="text-muted">
        <p v-for="(text, index) in content.prologue" :key="`prologue-${index}`">
          {{ text }}
        </p>
      </ContentTextWrapper>
    </ChapSection>

    <OpeningHoursSection />

    <ChapSection title="Tarifs">
      <ContentTextWrapper>
        <p>
          Nos tarifs pour une saison pour l'inscription et la licence ffta sont
          :
        </p>

        <ul :class="ui.listWrapper">
          <ChapListItem>
            <span :class="ui.listMainElement">adultes : </span
            ><span class="text-primary-500 font-semibold">195 euros</span>
          </ChapListItem>

          <ChapListItem>
            <span :class="ui.listMainElement">mineur·e·s, étudiant·e·s : </span
            ><span class="text-primary-500 font-semibold">170 euros</span>
          </ChapListItem>

          <ChapListItem>
            <span :class="ui.listMainElement"
              >demandeur·euse·s d'emploi et + de 70 ans : </span
            ><span class="text-primary-500 font-semibold">170 euros</span>
          </ChapListItem>
        </ul>

        <p>
          <span class="text-default bg-secondary/40">
            La demande étant forte, envoyez-nous un mail à
            <a
              class="text-primary-500 font-bold hover:underline hover:underline-offset-4"
              href="mailto:archerschapelle@gmail.com"
              >archerschapelle@gmail.com</a
            ></span
          >
          afin de savoir si une place est disponible pour nous rencontrer le
          mercredi soir à partir de 19h30 afin de tester notre activité
          <span class="text-primary-500"
            >(deux séances d'essai sont possibles)</span
          >
          avec nos entraîneurs !
        </p>
      </ContentTextWrapper>
    </ChapSection>

    <ChapSection title="Philosophie du club">
      <ContentTextWrapper>
        <p>
          Que ce soit dans notre gouvernance, nos projets, mais aussi nos
          évènements, notre association se veut de garantir un espace de
          confiance et en toute sécurité pour chacun·e·s d’entre nous quelque
          soit notre genre, âge, notre orientation sexuelle, notre origine
          ethnique, notre origine sociale ou encore notre corps.
        </p>
        <p>
          Notre association s’engage contre toute forme de rejet de l’autre
          alors mettons ces valeurs en application. Nous sommes
          intransigeant·e·s sur les actes racistes, sexistes et toutes les
          -phobies qui existent et qui sont, pour rappel, répréhensibles par la
          loi.
        </p>
      </ContentTextWrapper>
    </ChapSection>

    <div class="flex flex-col md:flex-row justify-between gap-9">
      <ContactSection />
      <SocialSection />
    </div>
  </ContentPageWrapper>
</template>

<script setup lang="ts">
import ContactSection from "~/components/contact/ContactSection.vue";
import ContentPageWrapper from "~/components/layout/ContentPageWrapper.vue";
import ContentTextWrapper from "~/components/layout/ContentTextWrapper.vue";
import OpeningHoursSection from "~/components/opening-hours/OpeningHoursSection.vue";
import SocialSection from "~/components/social/SocialSection.vue";
import ChapListItem from "~/components/ui/ChapListItem.vue";
import ChapSection from "~/components/ui/ChapSection.vue";

definePageMeta({
  layout: "default",
});

const ui = {
  listWrapper: "flex flex-col gap-2",
  listMainElement: "text-default font-semibold",
};

const content = {
  prologue: [
    "Notre club de tir à l'arc compte une cinquantaine d'archers et archères de tous âges. À noter que nous n'accueillons les plus jeunes qu'à partir de 14 ans.",
    "Nous pratiquons et enseignons le tir à l'arc.",
  ],
};
</script>
