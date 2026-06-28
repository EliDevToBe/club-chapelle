<template>
  <UCard :ui="{ body: 'space-y-3' }">
    <template #header>
      <div class="space-y-2">
        <h2 class="text-lg font-semibold leading-tight">
          {{ competition.name }}
        </h2>
        <div class="flex flex-wrap items-center gap-2 text-sm text-muted">
          <UIcon
            :name="categoryIcon(competition.category)"
            class="size-5 shrink-0 text-primary"
          />
          <span>{{
            formatDateRangeFr(competition.start_date, competition.end_date)
          }}</span>
          <span v-if="competition.place">· {{ competition.place }}</span>
        </div>
        <div class="flex flex-wrap gap-1.5">
          <UBadge size="sm" variant="subtle" color="neutral">
            {{ translateCompetitionCategory[competition.category] }}
          </UBadge>
          <UBadge size="sm" variant="subtle" color="neutral">
            {{ translateCompetitionType[competition.type] }}
          </UBadge>
        </div>
      </div>
    </template>

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
        :label="
          expandedCompetitionIds.has(competition.id)
            ? 'Masquer les participants'
            : 'Voir les participants'
        "
        :trailing-icon="
          expandedCompetitionIds.has(competition.id)
            ? 'i-ph-caret-up-duotone'
            : 'i-ph-caret-down-duotone'
        "
        class="px-0"
        @click="toggleExpanded(competition.id)"
      />

      <UButton
        v-if="isAdmin"
        size="xs"
        variant="soft"
        label="Ajouter un archer"
        icon="i-ph-user-plus-duotone"
        @click="openAddArcherModal(competition.id)"
      />
    </div>

    <div
      v-if="expandedCompetitionIds.has(competition.id)"
      class="space-y-4 border-t border-default pt-3"
    >
      <CompetitionParticipant
        v-for="archer in groupParticipationsByArcher(
          competition.participations,
        )"
        :key="archer.archerId"
        :archer="archer"
      />
    </div>
  </UCard>
</template>

<script setup lang="ts">
import { useAuthUser } from "~/composables/useAuthUser";
import {
  translateCompetitionCategory,
  translateCompetitionType,
  translateDistance,
  translatePaymentStatus,
  translateRegistrationStatus,
  translateTarget,
} from "~/utils/translate";
import type { ArcherDto } from "~~/shared/archer/archer.dto";
import type { CompetitionListingDto } from "~~/shared/competitions/competition-listing.dto";
import type { CompetitionCategoryEnum } from "~~/shared/db-enums";
import type { ArcherWithParticipations } from "./CompetitionParticipant.vue";
import CompetitionParticipant from "./CompetitionParticipant.vue";

defineProps<{
  competition: CompetitionListingDto;
}>();

const { isAdmin } = useAuthUser();

const expandedCompetitionIds = ref<Set<string>>(new Set());
const addArcherForCompetitionId = ref<string | null>(null);
const selectedArcherId = ref<string | undefined>(undefined);
const archersInCompetition = ref<ArcherDto[]>([]);

const archersLoadPending = ref(false);
const addArcherModalOpen = ref(false);

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
  return `${fmt.format(a)} — ${fmt.format(b)}`;
};

const toggleExpanded = (id: string) => {
  const next = new Set(expandedCompetitionIds.value);
  if (next.has(id)) {
    next.delete(id);
  } else {
    next.add(id);
  }
  expandedCompetitionIds.value = next;
};

const openAddArcherModal = async (competitionId: string) => {
  addArcherForCompetitionId.value = competitionId;
  selectedArcherId.value = undefined;
  addArcherModalOpen.value = true;
  await loadArchersForModal();
};
const loadArchersForModal = async () => {
  archersLoadPending.value = true;
  try {
    const res = await $fetch<{ archers: ArcherDto[] }>("/api/archers", {
      credentials: "include",
    });
    archersInCompetition.value = res.archers;
  } catch {
    archersInCompetition.value = [];
  } finally {
    archersLoadPending.value = false;
  }
};
</script>

<style scoped lang=""></style>
