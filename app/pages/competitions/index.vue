<template>
  <ContentPageWrapper>
    <ChapSection
      is-main-section
      title="Compétitions"
      description="Concours et présences du club."
    >
      <div v-if="isAdmin" class="mb-6 flex flex-wrap gap-2">
        <UButton
          icon="i-ph-plus-circle-duotone"
          label="Nouvelle compétition"
          @click="onStubCreateCompetition"
        />
      </div>

      <div
        class="mb-6 flex flex-col gap-4 rounded-lg border border-default p-4 sm:flex-row sm:flex-wrap sm:items-end"
      >
        <UFormField label="Du">
          <ChapInputDate v-model="filterStart" />
        </UFormField>
        <UFormField label="Au">
          <ChapInputDate v-model="filterEnd" />
        </UFormField>
        <UFormField label="Recherche" class="min-w-0 flex-1">
          <ChapInput
            v-model="filter.q"
            placeholder="Nom de compétition ou d’archer·ère ..."
            icon="i-ph-magnifying-glass-duotone"
            class="w-full"
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
              @click="filter.mine = 'true'"
            />
          </div>
        </UFormField>
      </div>

      <div v-if="pending" class="text-muted text-sm">Chargement…</div>
      <div v-else-if="errorMessage" class="text-error text-sm">
        {{ errorMessage }}
      </div>
      <div v-else class="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        <UCard
          v-for="c in competitions"
          :key="c.id"
          :ui="{ body: 'space-y-3' }"
        >
          <template #header>
            <div class="space-y-2">
              <h2 class="text-lg font-semibold leading-tight">
                {{ c.name }}
              </h2>
              <div class="flex flex-wrap items-center gap-2 text-sm text-muted">
                <UIcon
                  :name="categoryIcon(c.category)"
                  class="size-5 shrink-0 text-primary"
                />
                <span>{{ formatDateRangeFr(c.start_date, c.end_date) }}</span>
                <span v-if="c.place">· {{ c.place }}</span>
              </div>
              <div class="flex flex-wrap gap-1.5">
                <UBadge size="sm" variant="subtle" color="neutral">
                  {{ categoryLabel(c.category) }}
                </UBadge>
                <UBadge size="sm" variant="subtle" color="neutral">
                  {{ typeLabel(c.type) }}
                </UBadge>
              </div>
            </div>
          </template>

          <div v-if="isAdmin" class="flex justify-end">
            <UButton
              size="xs"
              variant="soft"
              label="Ajouter un archer"
              icon="i-ph-user-plus-duotone"
              @click="openAddArcherModal(c.id)"
            />
          </div>

          <UButton
            size="sm"
            variant="link"
            :label="
              expandedCompetitionIds.has(c.id)
                ? 'Masquer les participations'
                : 'Voir les participations'
            "
            :trailing-icon="
              expandedCompetitionIds.has(c.id)
                ? 'i-ph-caret-up-duotone'
                : 'i-ph-caret-down-duotone'
            "
            class="px-0"
            @click="toggleExpanded(c.id)"
          />

          <div
            v-if="expandedCompetitionIds.has(c.id)"
            class="space-y-4 border-t border-default pt-3"
          >
            <div
              v-for="group in groupParticipationsByArcher(c.participations)"
              :key="group.archerId"
              class="space-y-2"
            >
              <p class="text-sm font-medium text-highlighted">
                {{ group.publicName }}
              </p>
              <ul class="space-y-2 border-l-2 border-muted pl-3">
                <li
                  v-for="row in group.rows"
                  :key="row.id"
                  class="flex flex-wrap items-center gap-2 text-sm"
                >
                  <span class="text-muted">{{
                    distanceLabel(row.distance)
                  }}</span>
                  <span v-if="row.target" class="text-muted">
                    · {{ targetLabel(row.target) }}
                  </span>
                  <template v-if="row.registration_status !== null">
                    <UBadge size="xs" variant="subtle" color="neutral">
                      {{ registrationLabel(row.registration_status) }}
                    </UBadge>
                  </template>
                  <template v-if="row.payment_status !== null">
                    <UBadge size="xs" variant="subtle" color="warning">
                      {{ paymentLabel(row.payment_status) }}
                    </UBadge>
                  </template>
                </li>
              </ul>
            </div>
            <p v-if="c.participations.length === 0" class="text-muted text-sm">
              Aucune participation enregistrée.
            </p>
          </div>
        </UCard>
      </div>
    </ChapSection>

    <template #body>
      <div class="space-y-4 p-4">
        <ChapInputMenu
          v-model="selectedArcherId"
          :items="archerSelectItems"
          :is-loading="archersLoadPending"
          create-item-label="Créer l'archer·ère"
          create-item="always"
        />
      </div>
    </template>
  </ContentPageWrapper>
</template>

<script setup lang="ts">
import { CalendarDate } from "@internationalized/date";
import { watchDebounced } from "@vueuse/core";
import { nextTick } from "vue";
import ContentPageWrapper from "~/components/layout/ContentPageWrapper.vue";
import ChapButton from "~/components/ui/ChapButton.vue";
import ChapInput from "~/components/ui/ChapInput.vue";
import ChapInputDate from "~/components/ui/ChapInputDate.vue";
import ChapInputMenu from "~/components/ui/ChapInputMenu.vue";
import ChapSection from "~/components/ui/ChapSection.vue";
import { useAuthUser } from "~/composables/useAuthUser";
import { useChapToast } from "~/composables/useChapToasts";
import { calendarDateToYmd, YmdToCalendarDate } from "~/utils";
import type { ArcherDto } from "~~/shared/archer/archer.dto";
import type { CompetitionListingDto } from "~~/shared/competitions/competition-listing.dto";
import type {
  CompetitionCategoryEnum,
  CompetitionTypeEnum,
  DistanceEnum,
  PaymentStatusEnum,
  RegistrationStatusEnum,
  TargetEnum,
} from "~~/shared/db-enums";

definePageMeta({
  layout: "default",
});

type CompetitionsFilters = {
  start?: string;
  end?: string;
  q?: string;
  mine?: "true";
};

const route = useRoute();
const router = useRouter();
const { hydrateIfNeeded, isAdmin } = useAuthUser();
const { addToastInfo } = useChapToast();

const competitions = ref<CompetitionListingDto[]>([]);
const pending = ref(true);
const errorMessage = ref<string | null>(null);

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

const expandedCompetitionIds = ref<Set<string>>(new Set());

const addArcherModalOpen = ref(false);
const addArcherForCompetitionId = ref<string | null>(null);
const archers = ref<ArcherDto[]>([]);
const archersLoadPending = ref(false);

const selectedArcherId = ref<string | undefined>(undefined);

const archerSelectItems = computed(() => {
  return archers.value.map((a) => {
    return {
      label: a.public_name,
      value: a.id,
    };
  });
});

const todayYmdLocal = (): string => {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

const isDateValid = (date: string | undefined): boolean => {
  if (!date) return false;

  return true;
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
  filter.start = typeof q.start === "string" && q.start !== "" ? q.start : "";
  filterStart.value = filter.start
    ? YmdToCalendarDate(filter.start)
    : undefined;

  filter.end = typeof q.end === "string" && q.end !== "" ? q.end : "";
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

const categoryIcon = (category: CompetitionCategoryEnum): string => {
  if (category === "indoor") {
    return "i-ph-house-duotone";
  }
  return "i-ph-mountains-duotone";
};

const categoryLabel = (category: CompetitionCategoryEnum): string => {
  if (category === "indoor") {
    return "Salle";
  }
  return "Extérieur";
};

const typeLabel = (type: CompetitionTypeEnum): string => {
  const map: Record<CompetitionTypeEnum, string> = {
    olympic: "Olympique",
    beursault: "Beursault",
    field: "Field",
    nature: "Nature",
    d3: "D3",
  };
  return map[type];
};

const distanceLabel = (d: DistanceEnum): string => {
  const map: Record<DistanceEnum, string> = {
    m18: "18 m",
    m50: "50 m",
    m60: "60 m",
    m70: "70 m",
    beginner: "Débutant·e",
    other: "Autre",
  };
  return map[d];
};

const targetLabel = (t: TargetEnum): string => {
  if (t === "trispot") {
    return "Trispot";
  }
  return "Spot 40";
};

const registrationLabel = (r: RegistrationStatusEnum): string => {
  const map: Record<RegistrationStatusEnum, string> = {
    to_register: "À inscrire",
    pending: "En attente",
    waiting_list: "Liste d’attente",
    registered: "Inscrit·e",
    cancelled: "Annulé·e",
  };
  return map[r];
};

const paymentLabel = (p: PaymentStatusEnum): string => {
  const map: Record<PaymentStatusEnum, string> = {
    to_pay: "À payer",
    pending_reimbursement: "Remboursement",
    paid: "Payé",
    cancelled: "Annulé",
  };
  return map[p];
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

type ArcherGroup = {
  archerId: string;
  publicName: string;
  rows: CompetitionListingDto["participations"];
};

const groupParticipationsByArcher = (
  rows: CompetitionListingDto["participations"],
): ArcherGroup[] => {
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

const toggleExpanded = (id: string) => {
  const next = new Set(expandedCompetitionIds.value);
  if (next.has(id)) {
    next.delete(id);
  } else {
    next.add(id);
  }
  expandedCompetitionIds.value = next;
};

const onStubCreateCompetition = () => {
  addToastInfo({
    title: "À venir",
    description: "La création de compétition sera branchée sur l’API admin.",
  });
  void navigateTo("/admin");
};

const loadArchersForModal = async () => {
  archersLoadPending.value = true;
  try {
    const res = await $fetch<{ archers: ArcherDto[] }>("/api/archers", {
      credentials: "include",
    });
    archers.value = res.archers;
  } catch {
    archers.value = [];
  } finally {
    archersLoadPending.value = false;
  }
};

const openAddArcherModal = async (competitionId: string) => {
  addArcherForCompetitionId.value = competitionId;
  selectedArcherId.value = undefined;
  addArcherModalOpen.value = true;
  await loadArchersForModal();
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
