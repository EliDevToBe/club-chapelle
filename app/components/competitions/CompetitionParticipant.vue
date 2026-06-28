<template>
  <div :class="ui.root">
    <p :class="ui.name">
      {{ archer.publicName }}
    </p>

    <ul :class="ui.participationWrapper">
      <li v-for="row in archer.rows" :key="row.id" :class="ui.participation">
        <span class="text-muted"
          >{{ translateDistance[row.distance] }} •

          <!-- Target -->
          <span v-if="row.target" class="text-muted">
            {{ translateTarget[row.target] }} •
          </span>
        </span>

        <!-- Registration status -->
        <template v-if="row.registration_status !== null">
          <UBadge size="xs" variant="subtle" color="neutral">
            {{ translateRegistrationStatus[row.registration_status] }}
          </UBadge>
        </template>

        <!-- Payment status -->
        <template v-if="row.payment_status !== null">
          <UBadge size="xs" variant="subtle" color="warning">
            {{ translatePaymentStatus[row.payment_status] }}
          </UBadge>
        </template>
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
  participation: "flex flex-wrap items-center gap-2 text-sm",
};
</script>

<style scoped lang=""></style>
