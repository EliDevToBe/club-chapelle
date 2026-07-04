<template>
  <div :class="ui.root">
    <p :class="ui.name">
      {{ archer.publicName }}
    </p>

    <ul :class="ui.participationWrapper">
      <li v-for="row in archer.rows" :key="row.id" :class="ui.participation">
        <div :class="ui.participationDetailsWrapper">
          <div class="flex items-center gap-1" v-if="row.session">
            <UIcon
              :name="sessionIcon[row.session as SessionEnum]"
              class="size-3 text-secondary-200"
            />
            <span>{{ MEDIAN_PT }}</span>
          </div>

          <span>{{ translateDistance[row.distance] }}</span>
          <span>{{ MEDIAN_PT }}</span>

          <!-- Target -->
          <span v-if="row.target" class="text-muted">
            {{ translateTarget[row.target] }}
          </span>
        </div>

        <div :class="ui.badgeWrapper">
          <!-- Registration status -->
          <template v-if="row.registration_status !== null">
            <UBadge
              size="sm"
              variant="subtle"
              color="neutral"
              icon="i-ph-note-pencil-duotone"
            >
              {{ translateRegistrationStatus[row.registration_status] }}
            </UBadge>
          </template>

          <!-- Payment status -->
          <template v-if="row.payment_status !== null">
            <UBadge
              size="sm"
              variant="subtle"
              color="warning"
              icon="i-ph-currency-eur-duotone"
            >
              {{ translatePaymentStatus[row.payment_status] }}
            </UBadge>
          </template>
        </div>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import type { CompetitionListingDto } from "~~/shared/competitions/competition-listing.dto";
import type { SessionEnum } from "~~/shared/db-enums";
import { MEDIAN_PT } from "../ui/style";

export type ArcherWithParticipations = {
  archerId: string;
  publicName: string;
  rows: CompetitionListingDto["participations"];
};

defineProps<{
  archer: ArcherWithParticipations;
}>();

const ui = {
  root: "rounded-md flex flex-col gap-1 p-2",
  name: "text-sm font-medium text-highlighted!",
  participationWrapper: "pl-1 flex flex-col gap-2",
  participation:
    "grid sm:grid-cols-2 md:grid-cols-1 lg:grid-cols-[1fr_1.2fr] gap-2 items-center text-sm ",
  participationDetailsWrapper: "flex items-center text-muted gap-1",
  badgeWrapper: "flex flex-nowrap gap-1.5",
};

const sessionIcon: Record<SessionEnum, string> = {
  session_1: "i-ph-number-circle-one-duotone",
  session_2: "i-ph-number-circle-two-duotone",
  session_3: "i-ph-number-circle-three-duotone",
  session_4: "i-ph-number-circle-four-duotone",
  session_5: "i-ph-number-circle-five-duotone",
  session_6: "i-ph-number-circle-six-duotone",
};
</script>

<style scoped lang=""></style>
