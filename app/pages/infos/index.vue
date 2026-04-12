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

    <ChapSection title="Les créneaux">
      <ContentTextWrapper>
        <p>
          Actuellement nous bénéficions de
          <span class="text-primary font-semibold">quatre créneaux</span> au
          gymnase Tristan Tzara dans le 18ème :
        </p>

        <ul :class="ui.listWrapper">
          <ChapListItem>
            <span :class="ui.listMainElement"
              >le lundi soir de 19h30 à minuit :
            </span>
            <span>ouvert uniquement aux archer·e·s confirmé·e·s</span>
          </ChapListItem>

          <ChapListItem>
            <span :class="[ui.listMainElement, 'text-primary']"
              >le mercredi soir de 19h30 à minuit :
            </span>
            <span class="text-secondary-200 font-semibold underline"
              >dédié à l'initiation</span
            >
            <span> mais ouvert à toutes et tous</span>
          </ChapListItem>

          <ChapListItem>
            <span :class="ui.listMainElement"
              >le jeudi soir de 18h à 20h :</span
            >
            <span> ouvert uniquement aux archer·e·s confirmé·e·s</span>
          </ChapListItem>

          <ChapListItem>
            <span :class="ui.listMainElement"
              >le dimanche matin de 9h à 11h :</span
            >
            <span> ouvert uniquement aux archer·e·s confirmé·e·s</span>
          </ChapListItem>
        </ul>

        <p>
          {{ content.openingHours.epilogue }}
        </p>
      </ContentTextWrapper>
    </ChapSection>

    <ChapSection title="Tarifs">
      <ContentTextWrapper>
        <p>
          Nos tarifs pour une saison pour l'inscription et la licence ffta sont
          :
        </p>

        <ul :class="ui.listWrapper">
          <ChapListItem>
            <span :class="ui.listMainElement">adultes : </span
            ><span class="text-primary font-semibold">195 euros</span>
          </ChapListItem>

          <ChapListItem>
            <span :class="ui.listMainElement">mineur·e·s, étudiant·e·s : </span
            ><span class="text-primary font-semibold">170 euros</span>
          </ChapListItem>

          <ChapListItem>
            <span :class="ui.listMainElement"
              >demandeur·euse·s d'emploi et + de 70 ans : </span
            ><span class="text-primary font-semibold">170 euros</span>
          </ChapListItem>
        </ul>

        <p>
          <span class="text-default bg-secondary/40">
            La demande étant forte, envoyez-nous un mail à
            <a
              class="text-primary font-bold hover:underline hover:underline-offset-4"
              href="mailto:archerschapelle@gmail.com"
              >archerschapelle@gmail.com</a
            ></span
          >
          afin de savoir si une place est disponible pour nous rencontrer le
          mercredi soir à partir de 19h30 afin de tester notre activité
          <span class="text-primary"
            >(deux séances d'essai sont possibles)</span
          >
          avec nos entraîneurs !
        </p>
      </ContentTextWrapper>
    </ChapSection>

    <ChapSection title="Philosophie du club">
      <p>
        Que ce soit dans notre gouvernance, nos projets, mais aussi nos
        évènements, notre association se veut de garantir un espace de confiance
        et en toute sécurité pour chacun·e·s d’entre nous quelque soit notre
        genre, âge, notre orientation sexuelle, notre origine ethnique, notre
        origine sociale ou encore notre corps.
      </p>
      <p>
        Notre association s’engage contre toute forme de rejet de l’autre alors
        mettons ces valeurs en application. Nous sommes intransigeant·e·s sur
        les actes racistes, sexistes et toutes les -phobies qui existent et qui
        sont, pour rappel, répréhensibles par la loi.
      </p>
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
  openingHours: {
    epilogue:
      "Nous pratiquons plusieurs types de tir au sein du club. La plupart d'entre nous participent à des compétitions mais le mot d'ordre de notre association est d'échanger autour de ce sport et de passer un moment agréable et convivial.",
  },
};
</script>
