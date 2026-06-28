<template>
  <div :class="ui.root">
    <p :class="ui.name">
      {{ archer.publicName }}
    </p>

    <ul :class="ui.participationWrapper">
      <li v-for="row in archer.rows" :key="row.id" :class="ui.participation">
        <div class="text-muted">
          <span>•&nbsp;{{ translateDistance[row.distance] }}</span>

          <!-- Target -->
          <span v-if="row.target" class="text-muted">
            •&nbsp;{{ translateTarget[row.target] }}
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
  participation: "grid lg:grid-cols-2 gap-2 items-center text-sm ",
  badgeWrapper: "flex flex-nowrap gap-1.5",
};
</script>

<style scoped lang=""></style>
