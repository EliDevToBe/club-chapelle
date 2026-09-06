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

    <div :class="ui.filterWrapper">
      <UFormField label="Recherche" class="min-w-30 flex-1">
        <ChapInput
          v-model="filter.search"
          placeholder="Nom ou e-mail…"
          icon="i-ph-magnifying-glass-duotone"
          class="w-full text-sm! md:text-base"
          clearable
        />
      </UFormField>

      <UFormField label="Statut">
        <ChapSelectMenu
          v-model="filter.status"
          :items="statusFilterItems"
          placeholder="Tous"
          class="w-full"
        />
      </UFormField>

      <UFormField label="Rôle">
        <ChapSelectMenu
          v-model="filter.role"
          :items="roleFilterItems"
          placeholder="Tous"
          class="w-full"
          :disabled="isArchivedRosterView"
        />
      </UFormField>
    </div>

    <div v-if="errorMessage" class="text-sm text-error">
      {{ errorMessage }}
    </div>
    <Banner
      color="secondary"
      icon="i-ph-info-duotone"
      message="Aucun·e archer·ère archivé·e"
      v-else-if="!isLoading && isArchivedRosterView && total === 0"
    >
    </Banner>
    <Banner
      color="secondary"
      icon="i-ph-info-duotone"
      message="Aucun compte pour le moment"
      v-else-if="!isLoading && !hasActiveFilters && total === 0"
    >
    </Banner>
    <Banner
      color="secondary"
      icon="i-ph-magnifying-glass-duotone"
      message="Aucun résultat pour ces filtres"
      v-else-if="!isLoading && hasActiveFilters && total === 0"
    >
    </Banner>
    <template v-else>
      <UTable :data="tableRows" :columns="columns">
        <template #name-cell="{ row }">
          <USkeleton v-if="isLoading" class="h-4 w-28" />
          <div v-else-if="row.original.archer_id" class="min-w-40">
            <UInput
              v-if="
                editingArcherId === row.original.archer_id &&
                canEditPublicName(row.original)
              "
              v-model="editingPublicName"
              size="sm"
              :disabled="isUpdatingPublicName"
              @keydown.enter.prevent="commitPublicNameEdit"
              @keydown.escape.prevent="cancelPublicNameEdit"
              @blur="commitPublicNameEdit"
              :autofocus="true"
            />
            <button
              v-else-if="canEditPublicName(row.original)"
              type="button"
              class="text-left hover:underline underline-offset-2 cursor-pointer"
              @click="startPublicNameEdit(row.original)"
            >
              {{ row.original.public_name }}
            </button>
            <span v-else>{{ row.original.public_name }}</span>
          </div>
          <span v-else>{{ row.original.public_name }}</span>
        </template>
        <template #email-cell="{ row }">
          <USkeleton v-if="isLoading" class="h-4 w-40" />
          <span v-else>{{ row.original.email ?? "-" }}</span>
        </template>
        <template #status-cell="{ row }">
          <USkeleton v-if="isLoading" class="h-6 w-16 rounded-lg" />
          <UBadge
            v-else
            size="sm"
            variant="subtle"
            :color="statusBadgeColor(row.original.status)"
            :ui="{ base: 'rounded-lg' }"
          >
            {{ statusLabel(row.original) }}
          </UBadge>
        </template>
        <template #roles-cell="{ row }">
          <MemberRoleCell
            :roles="row.original.roles"
            :can-edit="canEditRowRole(row.original)"
            :is-loading="isLoading"
            @pick="onRolePicked(row.original, $event)"
          />
        </template>
        <template #actions-cell="{ row }">
          <USkeleton v-if="isLoading" class="h-6 w-6 rounded-md" />
          <UDropdownMenu
            v-else-if="hasActionsForRow(row.original)"
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
          :total="total"
          :items-per-page="pageSize"
          :disabled="isLoading"
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
      v-model:open="showOffboardModal"
      title="Archiver l’archer·ère ?"
      description="L’archer·ère sera retiré·e de la liste active. L’historique des participations est conservé. Vous pourrez la réinviter ou la supprimer depuis les archivés."
      @on-confirm="confirmOffboard"
    />
    <ChapConfirmModal
      v-model:open="showDeleteModal"
      title="⚠️ Supprimer l’archer·ère ?"
      description="L’archer·ère et l’historique des participations seront supprimés définitivement. Cette action est irréversible."
      @on-confirm="confirmDelete"
    />
    <ChapConfirmModal
      v-model:open="showRoleModal"
      :title="roleConfirmTitle"
      :description="roleConfirmDescription"
      @on-confirm="confirmSetRole"
    />
  </ChapAccordionContentWrapper>
</template>

<script setup lang="ts">
import type { DropdownMenuItem, TableColumn } from "@nuxt/ui";
import {
  breakpointsTailwind,
  useBreakpoints,
  watchDebounced,
} from "@vueuse/core";
import InviteArcherShellModal from "~/components/admin/InviteArcherShellModal.vue";
import InviteMemberModal from "~/components/admin/InviteMemberModal.vue";
import MemberRoleCell from "~/components/admin/MemberRoleCell.vue";
import ChapAccordionContentAction from "~/components/ui/ChapAccordionContentAction.vue";
import ChapAccordionContentWrapper from "~/components/ui/ChapAccordionContentWrapper.vue";
import ChapConfirmModal from "~/components/ui/ChapConfirmModal.vue";
import ChapInput from "~/components/ui/ChapInput.vue";
import ChapSelectMenu, {
  type ChapSelectMenuItem,
} from "~/components/ui/ChapSelectMenu.vue";
import { useAuthUser } from "~/composables/useAuthUser";
import { useChapToast } from "~/composables/useChapToasts";
import { useMemberManagement } from "~/composables/useMemberManagement";
import { translateRole } from "~/utils/translate";
import { API_ERROR_REASON } from "~~/shared/api-error-reasons";
import type { RoleEnum } from "~~/shared/db-enums";
import type { MemberRosterItemDto } from "~~/shared/member/member-roster.dto";
import type { MemberRosterRoleFilter } from "~~/shared/member/member-roster-list.dto";
import type { MemberRosterListQuery } from "~~/shared/member/member-roster-list.schema";
import {
  clampMemberRosterPage,
  MEMBER_ROSTER_PAGE_SIZE_DESKTOP,
  MEMBER_ROSTER_PAGE_SIZE_MOBILE,
} from "~~/shared/member/member-roster-pagination";
import { type AssignableClubRole } from "~~/shared/user/set-user-role.schema";
import { readApiErrorReason } from "~~/shared/utils/read-api-error.helper";

type MemberRow = MemberRosterItemDto;

const {
  items,
  total,
  isLoading,
  isUpdatingPublicName,
  listRoster,
  invite,
  revoke,
  deleteArcher,
  offboardArcher,
  updatePublicName,
  setRole,
} = useMemberManagement();
const { user: sessionUser, isDeveloper } = useAuthUser();
const { addToastError, addToastSuccess, addToastInfo } = useChapToast();

const showInviteModal = ref(false);
const showShellInviteModal = ref(false);
const showRevokeModal = ref(false);
const showOffboardModal = ref(false);
const showDeleteModal = ref(false);
const showRoleModal = ref(false);

const shellInviteTarget = ref<{
  archer_id: string;
  public_name: string;
} | null>(null);
const revokeTargetUserId = ref<string | null>(null);
const offboardTargetArcherId = ref<string | null>(null);
const deleteTargetArcherId = ref<string | null>(null);
const roleTarget = ref<{
  userId: string;
  publicName: string;
  nextRole: AssignableClubRole;
  isDemotingAdmin: boolean;
} | null>(null);
const errorMessage = ref<string | null>(null);
const currentPage = ref(1);
const editingArcherId = ref<string | null>(null);
const editingPublicName = ref("");
const isSavingPublicName = ref(false);

type MemberRosterFilters = {
  search: string;
  status: MemberRosterItemDto["status"] | null;
  role: MemberRosterRoleFilter | null;
};

const filter = reactive<MemberRosterFilters>({
  search: "",
  status: null,
  role: null,
});

const ui = {
  filterWrapper: [
    "flex flex-col sm:flex-row sm:flex-wrap sm:items-end gap-4 mb-6 p-4",
    "rounded-lg border border-default",
    "bg-neutral-800/30",
  ],
  colName: "min-w-40",
  colEmail: "min-w-48",
  colStatus: "min-w-32 whitespace-nowrap",
  colRoles: "min-w-28 whitespace-nowrap",
  colActions: "w-12",
};

const statusFilterItems: ChapSelectMenuItem[] = [
  { label: "Tous", value: null },
  { label: "Actif", value: "active" },
  { label: "Invité", value: "invited" },
  { label: "Sans compte", value: "shell" },
  { label: "Archivé·es", value: "archived" },
];

const isArchivedRosterView = computed(() => {
  return filter.status === "archived";
});

const roleFilterItems: ChapSelectMenuItem[] = [
  { label: "Tous", value: null },
  { label: translateRole.admin, value: "admin" },
  { label: translateRole.manager, value: "manager" },
  { label: translateRole.member, value: "member" },
];

const breakpoints = useBreakpoints(breakpointsTailwind);
const pageSize = computed(() => {
  return breakpoints.greaterOrEqual("sm").value
    ? MEMBER_ROSTER_PAGE_SIZE_DESKTOP
    : MEMBER_ROSTER_PAGE_SIZE_MOBILE;
});

const columnCellClass = (className: string) => {
  return {
    class: {
      th: className,
      td: className,
    },
  };
};

const columns: TableColumn<MemberRow>[] = [
  {
    id: "name",
    accessorKey: "public_name",
    header: "Nom",
    meta: columnCellClass(ui.colName),
  },
  {
    id: "email",
    accessorKey: "email",
    header: "E-mail",
    meta: columnCellClass(ui.colEmail),
  },
  {
    id: "status",
    accessorKey: "status",
    header: "Statut",
    meta: columnCellClass(ui.colStatus),
  },
  {
    id: "roles",
    accessorKey: "roles",
    header: "Rôles",
    meta: columnCellClass(ui.colRoles),
  },
  {
    id: "actions",
    header: "",
    meta: columnCellClass(ui.colActions),
  },
];

const formatStatusDateDayMonth = (value: string | null): string | null => {
  if (!value) {
    return null;
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return null;
  }
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "2-digit",
  }).format(date);
};

const statusLabel = (row: MemberRow): string => {
  if (row.status === "active") {
    return "Actif";
  }
  if (row.status === "invited") {
    const dayMonth = formatStatusDateDayMonth(row.invited_at);
    if (dayMonth) {
      return `Invité ${dayMonth}`;
    }
    return "Invité";
  }
  if (row.status === "archived") {
    const dayMonth = formatStatusDateDayMonth(row.offboarded_at);
    if (dayMonth) {
      return `Archivé ${dayMonth}`;
    }
    return "Archivé";
  }
  return "Sans compte";
};

const statusBadgeColor = (
  status: MemberRosterItemDto["status"],
): "success" | "warning" | "neutral" | "secondary" => {
  if (status === "active") {
    return "success";
  }
  if (status === "invited") {
    return "warning";
  }
  if (status === "archived") {
    return "secondary";
  }
  return "neutral";
};

const canEditPublicName = (row: MemberRow): boolean => {
  return row.status !== "archived" && Boolean(row.archer_id);
};

const canEditRowRole = (row: MemberRow): boolean => {
  if (!row.user_id) {
    return false;
  }
  return row.user_id !== sessionUser.value?.id;
};

const rowHasAdmin = (row: MemberRow): boolean => {
  return row.roles.includes("admin");
};

const currentAssignableRole = (
  roles: RoleEnum[],
): AssignableClubRole | null => {
  if (roles.includes("admin")) {
    return "admin";
  }
  if (roles.includes("manager")) {
    return "manager";
  }
  if (roles.includes("member")) {
    return "member";
  }
  return null;
};

const onRolePicked = (row: MemberRow, nextRole: AssignableClubRole): void => {
  if (!row.user_id) {
    return;
  }
  if (currentAssignableRole(row.roles) === nextRole) {
    return;
  }
  const isDemotingAdmin = rowHasAdmin(row) && nextRole !== "admin";
  if (isDemotingAdmin && !isDeveloper.value) {
    addToastInfo({
      title: "Rôle inchangé",
      description: "Contactez un développeur pour rétrograder un admin.",
      duration: 5000,
    });
    return;
  }

  roleTarget.value = {
    userId: row.user_id,
    publicName: row.public_name,
    nextRole,
    isDemotingAdmin,
  };
  showRoleModal.value = true;
};

const roleConfirmTitle = computed(() => {
  const target = roleTarget.value;
  if (!target) {
    return "Changer le rôle ?";
  }
  if (target.isDemotingAdmin) {
    return "Retirer le rôle admin ?";
  }
  if (target.nextRole === "admin") {
    return "Accorder le rôle admin ?";
  }
  if (target.nextRole === "manager") {
    return "Promouvoir organisateur ?";
  }
  return "Passer membre ?";
});

const roleConfirmDescription = computed(() => {
  const target = roleTarget.value;
  if (!target) {
    return "";
  }
  const roleLabel = translateRole[target.nextRole];
  if (target.isDemotingAdmin) {
    return `${target.publicName} passera au rôle de ${roleLabel}.`;
  }
  if (target.nextRole === "admin") {
    return `${target.publicName} recevra le rôle de ${roleLabel}.`;
  }
  return `${target.publicName} passera au rôle de ${roleLabel}.`;
});

const confirmSetRole = async (): Promise<void> => {
  const target = roleTarget.value;
  if (!target) {
    return;
  }

  try {
    await setRole(target.userId, target.nextRole);
    addToastSuccess({
      title: "Rôle mis à jour",
    });
    await loadRoster();
  } catch (error) {
    const reason = readApiErrorReason(error);
    if (reason === API_ERROR_REASON.user_role.self_change) {
      addToastError({
        description: "Vous ne pouvez pas modifier votre propre rôle.",
      });
      return;
    }
    if (reason === API_ERROR_REASON.user_role.admin_target) {
      addToastInfo({
        title: "Rôle inchangé",
        description: "Contactez un développeur pour rétrograder un admin.",
        duration: 5000,
      });
      return;
    }
    if (reason === API_ERROR_REASON.user_role.last_admin) {
      addToastError({
        description: "Impossible de rétrograder le dernier admin.",
      });
      return;
    }
    addToastError({
      description: "Impossible de modifier le rôle. Réessayez plus tard.",
    });
  } finally {
    roleTarget.value = null;
  }
};

const rows = computed((): MemberRow[] => {
  return items.value;
});

const skeletonRowCount = computed(() => {
  if (total.value === 0) {
    return pageSize.value;
  }

  const remaining = total.value - (currentPage.value - 1) * pageSize.value;
  return Math.min(pageSize.value, Math.max(remaining, 1));
});

const skeletonRows = computed((): MemberRow[] => {
  return Array.from({ length: skeletonRowCount.value }, (_, index) => {
    return {
      status: "shell",
      user_id: null,
      archer_id: `skeleton-${index}`,
      email: null,
      public_name: "",
      roles: [],
      invited_at: null,
      offboarded_at: null,
    };
  });
});

const tableRows = computed((): MemberRow[] => {
  if (isLoading.value) {
    return skeletonRows.value;
  }
  return rows.value;
});

const hasActiveFilters = computed(() => {
  return (
    filter.search.trim().length > 0 ||
    filter.status !== null ||
    filter.role !== null
  );
});

const showPagination = computed(() => {
  return total.value > pageSize.value;
});

const buildRosterQuery = (): MemberRosterListQuery => {
  const trimmedSearch = filter.search.trim();

  const query: MemberRosterListQuery = {
    limit: pageSize.value,
    offset: (currentPage.value - 1) * pageSize.value,
  };

  if (trimmedSearch.length > 0) {
    query.search = trimmedSearch;
  }
  if (filter.status === "archived") {
    query.archived_only = true;
  } else {
    if (filter.status) {
      query.status = filter.status;
    }
    if (filter.role) {
      query.role = filter.role;
    }
  }

  return query;
};

const loadRoster = async (): Promise<void> => {
  errorMessage.value = null;
  try {
    await listRoster(buildRosterQuery());
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
    currentPage.value = clampMemberRosterPage(
      currentPage.value,
      Math.max(0, total.value - 1),
      pageSize.value,
    );
    await loadRoster();
  } catch (error) {
    const reason = readApiErrorReason(error);
    if (reason === API_ERROR_REASON.user.self_revoke) {
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

const openOffboardConfirm = (row: MemberRow): void => {
  if (row.status !== "shell" || !row.archer_id) {
    return;
  }
  offboardTargetArcherId.value = row.archer_id;
  showOffboardModal.value = true;
};

const confirmOffboard = async (): Promise<void> => {
  const archerId = offboardTargetArcherId.value;
  offboardTargetArcherId.value = null;
  if (!archerId) {
    return;
  }

  try {
    await offboardArcher(archerId);
    addToastSuccess({
      title: "Archer·ère archivé·e",
    });
    currentPage.value = clampMemberRosterPage(
      currentPage.value,
      Math.max(0, total.value - 1),
      pageSize.value,
    );
    await loadRoster();
  } catch (error) {
    const reason = readApiErrorReason(error);
    if (reason === API_ERROR_REASON.archer.linked) {
      addToastError({
        description:
          "Impossible d’archiver un·e archer·ère lié·e à un compte. Révoquez l’accès d’abord.",
      });
      return;
    }
    if (reason === API_ERROR_REASON.archer.already_offboarded) {
      addToastError({
        description: "Cet archer·ère est déjà archivé·e.",
      });
      return;
    }
    if (reason === API_ERROR_REASON.common.not_found) {
      addToastError({
        description: "Archer·ère introuvable.",
      });
      return;
    }
    addToastError({
      description: "Impossible d’archiver l’archer·ère. Réessayez plus tard.",
    });
  }
};

const openDeleteConfirm = (row: MemberRow): void => {
  if (row.status !== "archived" || !row.archer_id) {
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
    currentPage.value = clampMemberRosterPage(
      currentPage.value,
      Math.max(0, total.value - 1),
      pageSize.value,
    );
    await loadRoster();
  } catch (error) {
    const reason = readApiErrorReason(error);
    if (reason === API_ERROR_REASON.archer.linked) {
      addToastError({
        description:
          "Impossible de supprimer un·e archer·ère lié·e à un compte. Révoquez l’accès d’abord.",
      });
      return;
    }
    if (reason === API_ERROR_REASON.archer.not_offboarded) {
      addToastError({
        description: "Archivez l’archer·ère avant de la supprimer.",
      });
      return;
    }
    addToastError({
      description: "Impossible de supprimer l’archer·ère. Réessayez plus tard.",
    });
  }
};

const updateInviteDate = (row: MemberRow): void => {
  if (!row.user_id) {
    return;
  }
  const userId = row.user_id;
  const nextInvitedAt = new Date().toISOString();
  items.value = items.value.map((item) => {
    if (item.user_id !== userId) {
      return item;
    }
    return {
      ...item,
      invited_at: nextInvitedAt,
    };
  });
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
    updateInviteDate(row);
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
    primary.push({
      label: "Archiver",
      icon: "i-ph-archive-duotone",
      onSelect: () => {
        openOffboardConfirm(row);
      },
    });
  }

  if (row.status === "archived") {
    primary.push({
      label: "Inviter à nouveau",
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

  const canDelete = row.status === "archived" && Boolean(row.archer_id);
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

watchDebounced(
  () => filter.search,
  () => {
    if (currentPage.value !== 1) {
      currentPage.value = 1;
      return;
    }
    void loadRoster();
  },
  { debounce: 300 },
);

watch([() => filter.status, () => filter.role], () => {
  if (filter.status === "archived") {
    filter.role = null;
  }
  if (currentPage.value !== 1) {
    currentPage.value = 1;
    return;
  }
  void loadRoster();
});

watch(currentPage, () => {
  void loadRoster();
});

watch(pageSize, (nextPageSize) => {
  const nextPage = clampMemberRosterPage(
    currentPage.value,
    total.value,
    nextPageSize,
  );
  if (nextPage !== currentPage.value) {
    currentPage.value = nextPage;
    return;
  }
  void loadRoster();
});

onMounted(() => {
  void loadRoster();
});
</script>
