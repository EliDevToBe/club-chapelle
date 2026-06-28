<template>
  <div :class="ui.root">
    <p :class="ui.name">
      {{ archer.publicName }}
    </p>

    <ul :class="ui.participationWrapper">
      <li v-for="row in archer.rows" :key="row.id" :class="ui.participation">
        <span class="text-muted"
          >• {{ translateDistance[row.distance] }}

          <!-- Target -->
          <span v-if="row.target" class="text-muted">
            • {{ translateTarget[row.target] }}
          </span>
        </span>

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

export type ArcherWithParticipations = {
  archerId: string;
  publicName: string;
  rows: CompetitionListingDto["participations"];
};

defineProps<{
  archer: ArcherWithParticipations;
}>();

const ui = {
  root: "space-y-2",
  name: "text-sm font-medium text-highlighted!",
  participationWrapper: "space-y-2 border-l-2 border-muted pl-3",
  participation: "grid grid-cols-[1fr_2fr] gap-2 items-center text-sm",
  badgeWrapper: "flex flex-nowrap gap-1.5",
};
</script>

<style scoped lang=""></style>
