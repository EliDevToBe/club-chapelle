<template>
  <ChapAccordionContentWrapper>
    <ChapAccordionContentAction
      description="Liste des comptes du club. Invitez un·e membre pour créer le compte et l’archer·ère associé·e."
    >
      <template #primary>
        <UButton
          icon="i-ph-envelope-simple-duotone"
          label="Inviter des membres"
          @click="
            () => {
              showInviteModal = true;
            }
          "
        />
      </template>
    </ChapAccordionContentAction>

    <div v-if="isLoading" class="text-sm text-muted">Chargement…</div>
    <div v-else-if="errorMessage" class="text-sm text-error">
      {{ errorMessage }}
    </div>
    <p v-else-if="rows.length === 0" class="text-sm text-muted">
      Aucun compte pour le moment.
    </p>
    <UTable v-else :data="rows" :columns="columns">
      <template #status-cell="{ row }">
        <UBadge
          size="sm"
          variant="subtle"
          :color="row.original.authenticated ? 'success' : 'warning'"
          :ui="{ base: 'rounded-lg' }"
        >
          {{ row.original.authenticated ? "Actif" : "Invité" }}
        </UBadge>
      </template>
      <template #roles-cell="{ row }">
        <div class="flex flex-wrap gap-1.5 whitespace-nowrap">
          <UBadge
            v-for="role in orderedRoles(row.original.roles)"
            :key="role"
            size="sm"
            variant="subtle"
            :color="roleBadgeColor[role]"
            :ui="{ base: 'rounded-lg' }"
          >
            {{ translateRole[role] }}
          </UBadge>
        </div>
      </template>
    </UTable>

    <InviteMemberModal v-model:open="showInviteModal" @invited="onInvited" />
  </ChapAccordionContentWrapper>
</template>

<script setup lang="ts">
import type { TableColumn } from "@nuxt/ui";
import InviteMemberModal from "~/components/admin/InviteMemberModal.vue";
import ChapAccordionContentAction from "~/components/ui/ChapAccordionContentAction.vue";
import ChapAccordionContentWrapper from "~/components/ui/ChapAccordionContentWrapper.vue";
import { useMemberManagement } from "~/composables/useMemberManagement";
import { translateRole } from "~/utils/translate";
import { highestRoleRank, sortRolesByOrder } from "~~/domain/user/role";
import type { RoleEnum } from "~~/shared/db-enums";
import type { UserDto } from "~~/shared/user/user.dto";

type MemberRow = {
  id: string;
  name: string;
  email: string;
  authenticated: boolean;
  roles: RoleEnum[];
};

const { users, isLoading, list } = useMemberManagement();
const showInviteModal = ref(false);
const errorMessage = ref<string | null>(null);

const columns: TableColumn<MemberRow>[] = [
  { accessorKey: "name", header: "Nom" },
  { accessorKey: "email", header: "E-mail" },
  {
    id: "status",
    accessorKey: "authenticated",
    header: "Statut",
    meta: {
      class: {
        td: "whitespace-nowrap",
      },
    },
  },
  {
    id: "roles",
    accessorKey: "roles",
    header: "Rôles",
    meta: {
      class: {
        td: "whitespace-nowrap",
      },
    },
  },
];

const roleBadgeColor: Record<
  RoleEnum,
  "neutral" | "info" | "primary" | "secondary"
> = {
  member: "neutral",
  manager: "info",
  admin: "primary",
  developer: "secondary",
};

const orderedRoles = (roles: RoleEnum[]): RoleEnum[] => {
  return sortRolesByOrder(roles).toReversed();
};

const compareMembers = (left: UserDto, right: UserDto): number => {
  const rankDelta = highestRoleRank(right.roles) - highestRoleRank(left.roles);
  if (rankDelta !== 0) {
    return rankDelta;
  }
  const leftName = left.name ?? "";
  const rightName = right.name ?? "";
  return leftName.localeCompare(rightName, "fr");
};

const rows = computed((): MemberRow[] => {
  return [...users.value].sort(compareMembers).map((user) => {
    return {
      id: user.id,
      name: user.name ?? "—",
      email: user.email,
      authenticated: user.authenticated,
      roles: user.roles,
    };
  });
});

const loadUsers = async (): Promise<void> => {
  errorMessage.value = null;
  try {
    await list();
  } catch {
    errorMessage.value =
      "Impossible de charger les membres. Réessayez plus tard.";
  }
};

const onInvited = (): void => {
  void loadUsers();
};

onMounted(() => {
  void loadUsers();
});
</script>
