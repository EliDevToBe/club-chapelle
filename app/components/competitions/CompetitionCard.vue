<template>
  <UCard ref="cardRef" :class="[isHovered ? ui.rootHover : '']">
    <template #header>
      <div :class="ui.header">
        <h2 :class="ui.title">
          {{ competition.name }}
        </h2>

        <div :class="ui.details">
          <UIcon
            :name="categoryIcon(competition.category)"
            class="size-5 shrink-0 text-primary"
          />
          <div class="flex flex-col flex-wrap gap-1">
            <span class="flex gap-1">
              <span class="text-primary">•</span>
              <span>
                {{
                  formatDateRangeFr(
                    competition.start_date,
                    competition.end_date,
                  )
                }}
              </span>
            </span>

            <div class="flex gap-1">
              <span v-if="competition.place" class="">
                <span class="text-primary">• </span>
                <span>
                  {{ competition.place }}
                </span>
              </span>

              <span v-if="competition.price">
                <span class="text-primary">• </span>
                <span>
                  {{
                    Intl.NumberFormat("fr-FR", {
                      style: "currency",
                      currency: "EUR",
                    }).format(Number(competition.price))
                  }}
                </span>
              </span>
            </div>
          </div>
        </div>
        <div :class="ui.detailsBadgeWrapper">
          <UBadge size="sm" variant="subtle" color="neutral">
            {{ translateCompetitionCategory[competition.category] }}
          </UBadge>
          <UBadge size="sm" variant="subtle" color="neutral">
            {{ translateCompetitionType[competition.type] }}
          </UBadge>
        </div>
      </div>
    </template>

    <div :class="ui.content">
      <div class="flex justify-between items-center">
        <p
          v-if="competition.participations.length === 0"
          class="text-secondary-500 text-sm"
        >
          Aucune participation enregistrée.
        </p>

        <UButton
          v-else
          size="sm"
          variant="link"
          :data-state="showDetails ? 'open' : 'closed'"
          :label="showDetails ? 'Masquer' : 'Détails'"
          :trailing-icon="'i-ph-caret-right-duotone'"
          class="group px-0"
          @click="toggleExpanded()"
          :ui="{
            trailingIcon:
              'transition-transform duration-200 group-data-[state=open]:rotate-90',
          }"
        />

        <UButton
          v-if="isAdmin"
          size="xs"
          variant="soft"
          label="Ajouter un archer"
          icon="i-ph-user-plus-duotone"
          @click="emit('addArcherForCompetition', competition.id)"
        />
      </div>

      <div v-if="showDetails" class="">
        <CompetitionParticipant
          :class="ui.participantRow"
          v-for="archer in groupParticipationsByArcher(
            competition.participations,
          )"
          :key="archer.archerId"
          :archer="archer"
        />
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import { onClickOutside, useElementHover } from "@vueuse/core";
import { useAuthUser } from "~/composables/useAuthUser";
import {
  translateCompetitionCategory,
  translateCompetitionType,
} from "~/utils/translate";
import type { CompetitionListingDto } from "~~/shared/competitions/competition-listing.dto";
import type { CompetitionCategoryEnum } from "~~/shared/db-enums";
import { LIGHT_HOVER_BORDER_COLOR } from "../ui/style";
import type { ArcherWithParticipations } from "./CompetitionParticipant.vue";
import CompetitionParticipant from "./CompetitionParticipant.vue";

const props = defineProps<{
  competition: CompetitionListingDto;
  preventCollapse?: boolean;
}>();

const emit = defineEmits<{
  toggleExpanded: [];
  addArcherForCompetition: [string];
}>();

const ui = {
  rootHover: LIGHT_HOVER_BORDER_COLOR,
  header: "flex flex-col gap-2",
  title: "text-lg font-semibold leading-tight text-gray-300",
  content: "flex flex-col gap-2",
  details: "flex flex-wrap items-center gap-2 text-sm text-muted",
  detailsBadgeWrapper: "flex flex-wrap gap-1.5",
  participantWrapper: "flex flex-col gap-3 border-t border-default pt-3",
  participantRow: "odd:bg-neutral-800/30 even:bg-default",
};

const { isAdmin } = useAuthUser();
const cardRef = useTemplateRef<HTMLDivElement>("cardRef");
const isHovered = useElementHover(cardRef);

const showDetails = ref(false);

const categoryIcon = (category: CompetitionCategoryEnum): string => {
  if (category === "indoor") {
    return "i-ph-house-duotone";
  }
  return "i-ph-mountains-duotone";
};

const groupParticipationsByArcher = (
  rows: CompetitionListingDto["participations"],
): ArcherWithParticipations[] => {
  const map = new Map<string, CompetitionListingDto["participations"]>();
  for (const row of rows) {
    const list = map.get(row.archer_id) ?? [];
    list.push(row);
    map.set(row.archer_id, list);
  }
  return [...map.entries()]
    .map(([archerId, list]) => {
      return {
        archerId,
        publicName: list[0]?.archer_public_name ?? "",
        rows: list,
      };
    })
    .sort((a, b) => {
      return a.publicName.localeCompare(b.publicName, "fr");
    });
};

const formatDateRangeFr = (start: string, end: string): string => {
  const fmt = new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  const a = new Date(`${start}T12:00:00.000Z`);
  const b = new Date(`${end}T12:00:00.000Z`);
  return `${fmt.format(a)} au ${fmt.format(b)}`;
};

const toggleExpanded = () => {
  showDetails.value = !showDetails.value;
};

onClickOutside(cardRef, () => {
  if (!showDetails.value || props.preventCollapse) {
    return;
  }
  showDetails.value = false;
});
</script>

<style scoped lang=""></style>
