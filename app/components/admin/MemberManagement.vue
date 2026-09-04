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
    <template v-else>
      <UTable :data="visibleRows" :columns="columns">
        <template #name-cell="{ row }">
          <div v-if="row.original.archer_id" class="min-w-40">
            <UInput
              v-if="editingArcherId === row.original.archer_id"
              v-model="editingPublicName"
              size="sm"
              :disabled="isUpdatingPublicName"
              @keydown.enter.prevent="commitPublicNameEdit"
              @keydown.escape.prevent="cancelPublicNameEdit"
              @blur="commitPublicNameEdit"
              :autofocus="true"
            />
            <button
              v-else
              type="button"
              class="text-left hover:underline underline-offset-2 cursor-pointer"
              @click="startPublicNameEdit(row.original)"
            >
              {{ row.original.public_name }}
            </button>
          </div>
          <span v-else>{{ row.original.public_name }}</span>
        </template>
        <template #status-cell="{ row }">
          <UBadge
            size="sm"
            variant="subtle"
            :color="statusBadgeColor(row.original.status)"
            :ui="{ base: 'rounded-lg' }"
          >
            {{ statusLabel(row.original.status) }}
          </UBadge>
        </template>
        <template #roles-cell="{ row }">
          <div
            v-if="row.original.roles.length > 0"
            class="flex flex-wrap gap-1.5 whitespace-nowrap"
          >
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
          <span v-else class="text-muted">—</span>
        </template>
        <template #actions-cell="{ row }">
          <UDropdownMenu
            v-if="hasActionsForRow(row.original)"
            :items="buildActionItemsForRow(row.original)"
            :content="{ align: 'end' }"
          >
            <UButton
              icon="i-ph-dots-three-bold"
              color="neutral"
              variant="ghost"
              size="xs"
              aria-label="Actions"
            />
          </UDropdownMenu>
        </template>
      </UTable>

      <div v-if="showPagination" class="flex justify-center pt-2">
        <UPagination
          size="sm"
          variant="ghost"
          active-variant="outline"
          v-model:page="currentPage"
          :total="rows.length"
          :items-per-page="pageSize"
          show-edges
          color="primary"
        />
      </div>
    </template>

    <InviteMemberModal
      v-model:open="showInviteModal"
      @invited="onRosterChanged"
    />
    <InviteArcherShellModal
      v-if="shellInviteTarget"
      v-model:open="showShellInviteModal"
      :archer-id="shellInviteTarget.archer_id"
      :public-name="shellInviteTarget.public_name"
      @invited="onRosterChanged"
    />
    <ChapConfirmModal
      v-model:open="showRevokeModal"
      title="Révoquer l’accès ?"
      description="Le compte ne pourra plus se connecter. L’archer·ère et l’historique des participations sont conservés."
      @on-confirm="confirmRevoke"
    />
    <ChapConfirmModal
      v-model:open="showDeleteModal"
      title="⚠️ Supprimer l’archer·ère ?"
      description="L’archer·ère et l’historique des participations seront supprimés définitivement. Cette action est irréversible."
      @on-confirm="confirmDelete"
    />
  </ChapAccordionContentWrapper>
</template>

<script setup lang="ts">
import type { DropdownMenuItem, TableColumn } from "@nuxt/ui";
import { breakpointsTailwind, useBreakpoints } from "@vueuse/core";
import InviteArcherShellModal from "~/components/admin/InviteArcherShellModal.vue";
import InviteMemberModal from "~/components/admin/InviteMemberModal.vue";
import ChapAccordionContentAction from "~/components/ui/ChapAccordionContentAction.vue";
import ChapAccordionContentWrapper from "~/components/ui/ChapAccordionContentWrapper.vue";
import ChapConfirmModal from "~/components/ui/ChapConfirmModal.vue";
import { useAuthUser } from "~/composables/useAuthUser";
import { useChapToast } from "~/composables/useChapToasts";
import { useMemberManagement } from "~/composables/useMemberManagement";
import { translateRole } from "~/utils/translate";
import { sortRolesByOrder } from "~~/domain/user/role";
import type { RoleEnum } from "~~/shared/db-enums";
import type { MemberRosterItemDto } from "~~/shared/member/member-roster.dto";
import {
  clampMemberRosterPage,
  getMemberRosterPageSlice,
  MEMBER_ROSTER_PAGE_SIZE_DESKTOP,
  MEMBER_ROSTER_PAGE_SIZE_MOBILE,
} from "~~/shared/member/member-roster-pagination";

type MemberRow = MemberRosterItemDto;

const {
  items,
  isLoading,
  isUpdatingPublicName,
  listRoster,
  invite,
  revoke,
  deleteArcher,
  updatePublicName,
} = useMemberManagement();
const { user: sessionUser } = useAuthUser();
const { addToastError, addToastSuccess } = useChapToast();

const showInviteModal = ref(false);
const showShellInviteModal = ref(false);
const showRevokeModal = ref(false);
const showDeleteModal = ref(false);

const shellInviteTarget = ref<{
  archer_id: string;
  public_name: string;
} | null>(null);
const revokeTargetUserId = ref<string | null>(null);
const deleteTargetArcherId = ref<string | null>(null);
const errorMessage = ref<string | null>(null);
const currentPage = ref(1);
const editingArcherId = ref<string | null>(null);
const editingPublicName = ref("");
const isSavingPublicName = ref(false);

const breakpoints = useBreakpoints(breakpointsTailwind);
const pageSize = computed(() => {
  return breakpoints.greaterOrEqual("sm").value
    ? MEMBER_ROSTER_PAGE_SIZE_DESKTOP
    : MEMBER_ROSTER_PAGE_SIZE_MOBILE;
});

const columns: TableColumn<MemberRow>[] = [
  {
    id: "name",
    accessorKey: "public_name",
    header: "Nom",
  },
  {
    accessorKey: "email",
    header: "E-mail",
    cell: ({ row }) => {
      return row.original.email ?? "—";
    },
  },
  {
    id: "status",
    accessorKey: "status",
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
  {
    id: "actions",
    header: "",
    meta: {
      class: {
        td: "w-12",
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

const statusLabel = (status: MemberRosterItemDto["status"]): string => {
  if (status === "active") {
    return "Actif";
  }
  if (status === "invited") {
    return "Invité";
  }
  return "Sans compte";
};

const statusBadgeColor = (
  status: MemberRosterItemDto["status"],
): "success" | "warning" | "neutral" => {
  if (status === "active") {
    return "success";
  }
  if (status === "invited") {
    return "warning";
  }
  return "neutral";
};

const rows = computed((): MemberRow[] => {
  return items.value;
});

const visibleRows = computed((): MemberRow[] => {
  return getMemberRosterPageSlice(
    rows.value,
    currentPage.value,
    pageSize.value,
  );
});

const showPagination = computed(() => {
  return rows.value.length > pageSize.value;
});

watch(
  () => rows.value.length,
  () => {
    currentPage.value = 1;
  },
);

watch(pageSize, (nextPageSize) => {
  currentPage.value = clampMemberRosterPage(
    currentPage.value,
    rows.value.length,
    nextPageSize,
  );
});

const loadRoster = async (): Promise<void> => {
  errorMessage.value = null;
  try {
    await listRoster();
  } catch {
    errorMessage.value =
      "Impossible de charger les membres. Réessayez plus tard.";
  }
};

const onRosterChanged = (): void => {
  void loadRoster();
};

const startPublicNameEdit = (row: MemberRow): void => {
  if (!row.archer_id) {
    return;
  }
  editingArcherId.value = row.archer_id;
  editingPublicName.value = row.public_name;
};

const cancelPublicNameEdit = (): void => {
  editingArcherId.value = null;
  editingPublicName.value = "";
};

const commitPublicNameEdit = async (): Promise<void> => {
  const archerId = editingArcherId.value;
  if (!archerId || isSavingPublicName.value) {
    return;
  }

  const nextName = editingPublicName.value.trim();
  const current = items.value.find((item) => {
    return item.archer_id === archerId;
  });
  if (!current || nextName.length === 0 || nextName === current.public_name) {
    cancelPublicNameEdit();
    return;
  }

  isSavingPublicName.value = true;
  editingArcherId.value = null;
  try {
    const updated = await updatePublicName(archerId, nextName);
    items.value = items.value.map((item) => {
      if (item.archer_id !== archerId) {
        return item;
      }
      return {
        ...item,
        public_name: updated.public_name,
      };
    });
    addToastSuccess({
      title: "Nom public mis à jour",
    });
    editingPublicName.value = "";
  } catch {
    addToastError({
      description:
        "Impossible de modifier le nom public. Il est peut‑être déjà pris.",
    });
    editingArcherId.value = archerId;
    editingPublicName.value = nextName;
  } finally {
    isSavingPublicName.value = false;
  }
};

const openShellInvite = (row: MemberRow): void => {
  if (!row.archer_id) {
    return;
  }
  shellInviteTarget.value = {
    archer_id: row.archer_id,
    public_name: row.public_name,
  };
  showShellInviteModal.value = true;
};

const openRevokeConfirm = (row: MemberRow): void => {
  if (!row.user_id) {
    return;
  }
  revokeTargetUserId.value = row.user_id;
  showRevokeModal.value = true;
};

const confirmRevoke = async (): Promise<void> => {
  const userId = revokeTargetUserId.value;
  revokeTargetUserId.value = null;
  if (!userId) {
    return;
  }

  try {
    await revoke(userId);
    addToastSuccess({
      title: "Accès révoqué",
      description: "L’archer·ère est conservé·e sans compte lié.",
    });
    await loadRoster();
  } catch (error) {
    const statusMessage =
      typeof error === "object" &&
      error !== null &&
      "statusMessage" in error &&
      typeof (error as { statusMessage: unknown }).statusMessage === "string"
        ? (error as { statusMessage: string }).statusMessage
        : undefined;
    if (statusMessage === "Cannot revoke your own access") {
      addToastError({
        description: "Vous ne pouvez pas révoquer votre propre accès.",
      });
      return;
    }
    addToastError({
      description: "Impossible de révoquer l’accès. Réessayez plus tard.",
    });
  }
};

const openDeleteConfirm = (row: MemberRow): void => {
  if (row.status !== "shell" || !row.archer_id) {
    return;
  }
  deleteTargetArcherId.value = row.archer_id;
  showDeleteModal.value = true;
};

const confirmDelete = async (): Promise<void> => {
  const archerId = deleteTargetArcherId.value;
  deleteTargetArcherId.value = null;
  if (!archerId) {
    return;
  }

  try {
    await deleteArcher(archerId);
    addToastSuccess({
      title: "Archer·ère supprimé·e",
    });
    await loadRoster();
  } catch (error) {
    const statusMessage =
      typeof error === "object" &&
      error !== null &&
      "statusMessage" in error &&
      typeof (error as { statusMessage: unknown }).statusMessage === "string"
        ? (error as { statusMessage: string }).statusMessage
        : undefined;
    if (statusMessage === "Archer is linked to an account") {
      addToastError({
        description:
          "Impossible de supprimer un·e archer·ère lié·e à un compte. Révoquez l’accès d’abord.",
      });
      return;
    }
    addToastError({
      description: "Impossible de supprimer l’archer·ère. Réessayez plus tard.",
    });
  }
};

const renewInvite = async (row: MemberRow): Promise<void> => {
  if (!row.email) {
    return;
  }

  try {
    const result = await invite({
      name: row.public_name,
      email: row.email,
      allow_resent: true,
    });
    if (!result.mail_sent) {
      addToastError({
        title: "Invitation enregistrée",
        description:
          "Le compte existe, mais l’e-mail n’a pas pu être envoyé. Réessayez plus tard.",
      });
    } else {
      addToastSuccess({
        title: "Invitation renvoyée",
        description: "Un nouvel e-mail a été envoyé.",
      });
    }
  } catch {
    addToastError({
      description: "Impossible de renvoyer l’invitation. Réessayez plus tard.",
    });
  }
};

const buildActionItemsForRow = (row: MemberRow): DropdownMenuItem[][] => {
  const groups: DropdownMenuItem[][] = [];
  const primary: DropdownMenuItem[] = [];

  if (row.status === "invited") {
    primary.push({
      label: "Renvoyer l’invitation",
      icon: "i-ph-envelope-simple-duotone",
      onSelect: () => {
        void renewInvite(row);
      },
    });
  }

  if (row.status === "shell") {
    primary.push({
      label: "Inviter",
      icon: "i-ph-user-plus-duotone",
      onSelect: () => {
        openShellInvite(row);
      },
    });
  }

  if (primary.length > 0) {
    groups.push(primary);
  }

  const canRevoke =
    (row.status === "active" || row.status === "invited") &&
    Boolean(row.user_id) &&
    row.user_id !== sessionUser.value?.id;

  if (canRevoke) {
    groups.push([
      {
        label: "Révoquer l’accès",
        icon: "i-ph-prohibit-duotone",
        color: "error",
        onSelect: () => {
          openRevokeConfirm(row);
        },
      },
    ]);
  }

  const canDelete = row.status === "shell" && Boolean(row.archer_id);
  if (canDelete) {
    groups.push([
      {
        icon: "i-ph-trash-duotone",
        color: "error",
        label: "Supprimer l’archer·ère",
        onSelect: () => {
          openDeleteConfirm(row);
        },
      },
    ]);
  }

  return groups;
};

const hasActionsForRow = (row: MemberRow): boolean => {
  return buildActionItemsForRow(row).length > 0;
};

onMounted(() => {
  void loadRoster();
});
</script>
