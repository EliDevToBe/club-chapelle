<template>
  <ContentPageWrapper>
    <ChapSection
      is-main-section
      title="Compétitions"
      description="Concours et présences du club."
    >
      <div v-if="isAdmin" :class="ui.adminWrapper">
        <UButton
          icon="i-ph-plus-circle-duotone"
          label="Nouvelle compétition"
          @click="onStubCreateCompetition"
        />
      </div>

      <div :class="ui.filterWrapper">
        <UFormField label="Du">
          <ChapInputDate v-model="filterStart" />
        </UFormField>
        <UFormField label="Au">
          <ChapInputDate v-model="filterEnd" />
        </UFormField>

        <UFormField label="Recherche" class="min-w-30 flex-1">
          <ChapInput
            v-model="filter.q"
            placeholder="Compétition ou archer·ère ..."
            icon="i-ph-magnifying-glass-duotone"
            class="w-full text-sm! md:text-base"
            clearable
          />
        </UFormField>

        <UFormField label="Filtrer">
          <div class="flex gap-2">
            <UButton
              :variant="filter.mine === 'true' ? 'outline' : 'solid'"
              label="Toutes"
              size="sm"
              @click="filter.mine = undefined"
            />
            <UButton
              :variant="filter.mine === 'true' ? 'solid' : 'outline'"
              label="Les miennes"
              size="sm"
              @click="
                () => {
                  filter.mine = 'true';
                }
              "
            />
          </div>
        </UFormField>
      </div>

      <div v-if="pending" class="text-muted text-sm">Chargement…</div>
      <div v-else-if="errorMessage" class="text-error text-sm">
        {{ errorMessage }}
      </div>
      <div v-else :class="ui.competitionsWrapper">
        <CompetitionCard
          v-for="comp in competitions"
          :key="comp.id"
          :competition="comp"
          @add-archer-for-competition="onAddArcherForCompetition"
          :prevent-collapse="showArcherSelectModal"
        />

        <ArcherSelectModal
          v-if="selectedCompetition"
          :competition-id="selectedCompetition.id"
          :competition-category="selectedCompetition.category"
          :competition-type="selectedCompetition.type"
          v-model:open="showArcherSelectModal"
          @participation-created="onParticipationCreated"
        />
      </div>
    </ChapSection>
  </ContentPageWrapper>
</template>

<script setup lang="ts">
import { CalendarDate } from "@internationalized/date";
import { watchDebounced } from "@vueuse/core";
import { nextTick } from "vue";
import ArcherSelectModal from "~/components/archer/ArcherSelectModal.vue";
import CompetitionCard from "~/components/competitions/CompetitionCard.vue";
import ContentPageWrapper from "~/components/layout/ContentPageWrapper.vue";
import ChapInput from "~/components/ui/ChapInput.vue";
import ChapInputDate from "~/components/ui/ChapInputDate.vue";
import ChapSection from "~/components/ui/ChapSection.vue";
import { useAuthUser } from "~/composables/useAuthUser";
import { useChapToast } from "~/composables/useChapToasts";
import { calendarDateToYmd, YmdToCalendarDate } from "~/utils";
import type { CompetitionListingDto } from "~~/shared/competitions/competition-listing.dto";

type CompetitionsFilters = {
  start?: string;
  end?: string;
  q?: string;
  mine?: "true";
};

const ui = {
  adminWrapper: "mb-6 flex flex-wrap gap-2",
  filterWrapper: [
    "flex flex-col sm:flex-row sm:flex-wrap sm:items-end gap-4 mb-6 p-4",
    "rounded-lg border border-default",
    "bg-neutral-800/30",
  ],
  competitionsWrapper: "grid grid-cols-1 gap-4 md:grid-cols-2 items-start",
};

const route = useRoute();
const router = useRouter();
const { hydrateIfNeeded, isAdmin } = useAuthUser();
const { addToastInfo } = useChapToast();

const competitions = ref<CompetitionListingDto[]>([]);
const selectedCompetitionId = ref<string>();
const selectedCompetition = computed(() => {
  if (!selectedCompetitionId.value) {
    return undefined;
  }
  return competitions.value.find((comp) => {
    return comp.id === selectedCompetitionId.value;
  });
});
const pending = ref(true);
const errorMessage = ref<string | null>(null);
const showArcherSelectModal = ref(false);

const filter = reactive<CompetitionsFilters>({});

const filterStart = shallowRef<CalendarDate | undefined>();

const filterEnd = shallowRef<CalendarDate | undefined>(undefined);

watch([filterStart, filterEnd], () => {
  if (filterStart.value) {
    filter.start = calendarDateToYmd(filterStart.value);
  } else {
    filter.start = undefined;
  }

  if (filterEnd.value) {
    filter.end = calendarDateToYmd(filterEnd.value);
  } else {
    filter.end = undefined;
  }
});

const syncingFromRoute = ref(false);
const readyForRouteFetch = ref(false);

const todayYmdLocal = (): string => {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

const buildQueryFromRefs = (): CompetitionsFilters => {
  const queryFilters: CompetitionsFilters = {};

  if (filter.start !== "") {
    queryFilters.start = filter.start;
  }
  if (filter.end !== "") {
    queryFilters.end = filter.end;
  }

  const trimmed = filter.q?.trim();
  if (trimmed) {
    queryFilters.q = trimmed;
  } else if (!trimmed) {
    queryFilters.q = undefined;
  }

  if (filter.mine) {
    queryFilters.mine = "true";
  } else {
    queryFilters.mine = undefined;
  }

  return queryFilters;
};

const FILTER_QUERY_KEYS = new Set<string>(["start", "end", "q", "mine"]);

const normaliseRouteQuery = (
  raw: Record<string, unknown>,
): CompetitionsFilters => {
  const out: CompetitionsFilters = {};

  for (const [key, value] of Object.entries(raw)) {
    if (value === undefined || value === null || value === "") continue;
    if (!FILTER_QUERY_KEYS.has(key)) continue;

    const stringValue = Array.isArray(value) ? String(value[0]) : String(value);

    // Explicitly handle mine key to avoid type errors
    if (key === "mine") {
      if (stringValue === "true") {
        out.mine = "true";
      }
      continue;
    }

    out[key as "start" | "end" | "q"] = Array.isArray(value)
      ? String(value[0])
      : String(value);
  }
  return out;
};

const queriesEqual = (
  next: Record<string, string>,
  current: Record<string, unknown>,
): boolean => {
  const cur = normaliseRouteQuery(current);
  const nextKeys = Object.keys(next);
  const curKeys = Object.keys(cur);
  if (nextKeys.length !== curKeys.length) {
    return false;
  }
  for (const key of nextKeys) {
    if (
      next[key as keyof CompetitionsFilters] !==
      cur[key as keyof CompetitionsFilters]
    ) {
      return false;
    }
  }
  return true;
};

const applyRefsToRouter = async () => {
  const next = buildQueryFromRefs();
  if (queriesEqual(next, route.query as Record<string, unknown>)) {
    return;
  }
  await router.replace({ path: route.path, query: next });
};

const syncRouteToRefs = () => {
  syncingFromRoute.value = true;

  const q = route.query;
  filter.start =
    typeof q.start === "string" && q.start !== "" ? q.start : undefined;
  filterStart.value = filter.start
    ? YmdToCalendarDate(filter.start)
    : undefined;

  filter.end = typeof q.end === "string" && q.end !== "" ? q.end : undefined;
  filterEnd.value = filter.end ? YmdToCalendarDate(filter.end) : undefined;

  filter.q = typeof q.q === "string" ? q.q : "";

  filter.mine = q.mine === "true" ? "true" : undefined;

  void nextTick(() => {
    syncingFromRoute.value = false;
  });
};

const fetchCompetitions = async () => {
  pending.value = true;
  errorMessage.value = null;

  try {
    const response = await $fetch<{ competitions: CompetitionListingDto[] }>(
      "/api/competitions",
      {
        credentials: "include",
        query: buildQueryFromRefs(),
      },
    );
    competitions.value = response.competitions;
  } catch {
    errorMessage.value =
      "Impossible de charger les compétitions. Vérifiez votre connexion ou réessayez plus tard.";
  } finally {
    pending.value = false;
  }
};

const onStubCreateCompetition = () => {
  addToastInfo({
    title: "À venir",
    description: "La création de compétition sera branchée sur l’API admin.",
  });
  void navigateTo("/admin");
};

const onAddArcherForCompetition = (competitionId: string) => {
  selectedCompetitionId.value = competitionId;
  showArcherSelectModal.value = true;
};

const onParticipationCreated = (): void => {
  void fetchCompetitions();
};

watch(
  () => route.query,
  () => {
    syncRouteToRefs();
    if (!readyForRouteFetch.value) {
      return;
    }
    void fetchCompetitions();
  },
  { deep: true },
);

watch(
  () => [filter.start, filter.end, filter.mine],
  () => {
    if (syncingFromRoute.value) {
      return;
    }

    void applyRefsToRouter();
  },
  { deep: true },
);

watchDebounced(
  () => filter.q,
  () => {
    if (syncingFromRoute.value) {
      return;
    }

    void applyRefsToRouter();
  },
  { debounce: 300 },
);

onMounted(async () => {
  await hydrateIfNeeded();
  await router.isReady();

  readyForRouteFetch.value = false;

  const routeQuery = route.query;

  const hasStart =
    typeof routeQuery.start === "string" && routeQuery.start !== "";

  if (!hasStart) {
    await router.replace({
      path: route.path,
      query: {
        ...normaliseRouteQuery(route.query as Record<string, unknown>),
        start: todayYmdLocal(),
      },
    });
  }

  syncRouteToRefs();
  await fetchCompetitions();
  readyForRouteFetch.value = true;
});
</script>
