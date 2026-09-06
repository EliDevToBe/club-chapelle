<template>
  <USkeleton v-if="isLoading" class="h-6 w-24 rounded-lg" />
  <div v-else class="flex items-center gap-1">
    <div
      v-if="roles.length > 0"
      class="flex flex-wrap gap-1.5 whitespace-nowrap"
    >
      <UBadge
        v-for="role in orderedRoles"
        :key="role"
        size="sm"
        variant="subtle"
        :color="roleBadgeColor[role]"
        :ui="{ base: 'rounded-lg' }"
      >
        {{ translateRole[role] }}
      </UBadge>
    </div>
    <span v-else class="text-muted">-</span>
    <UDropdownMenu
      v-if="canEdit"
      :items="rolePickerItems"
      :content="{ align: 'start' }"
    >
      <UButton
        icon="i-ph-caret-down-duotone"
        color="neutral"
        variant="ghost"
        size="xs"
        aria-label="Changer le rôle"
      />
    </UDropdownMenu>
  </div>
</template>

<script setup lang="ts">
import type { DropdownMenuItem } from "@nuxt/ui";
import { translateRole } from "~/utils/translate";
import { sortRolesByOrder } from "~~/domain/user/role";
import type { RoleEnum } from "~~/shared/db-enums";
import {
  ASSIGNABLE_CLUB_ROLES,
  type AssignableClubRole,
} from "~~/shared/user/set-user-role.schema";

const props = defineProps<{
  roles: RoleEnum[];
  canEdit: boolean;
  isLoading?: boolean;
}>();

const emit = defineEmits<{
  pick: [role: AssignableClubRole];
}>();

const roleBadgeColor: Record<
  RoleEnum,
  "neutral" | "info" | "primary" | "secondary"
> = {
  member: "neutral",
  manager: "info",
  admin: "primary",
  developer: "secondary",
};

const orderedRoles = computed((): RoleEnum[] => {
  return sortRolesByOrder(props.roles).toReversed();
});

const currentAssignableRole = computed((): AssignableClubRole | null => {
  if (props.roles.includes("admin")) {
    return "admin";
  }
  if (props.roles.includes("manager")) {
    return "manager";
  }
  if (props.roles.includes("member")) {
    return "member";
  }
  return null;
});

const rolePickerIcon = (role: AssignableClubRole): string => {
  if (role === "admin") {
    return "i-ph-shield-check-duotone";
  }
  if (role === "manager") {
    return "i-ph-briefcase-duotone";
  }
  return "i-ph-user-duotone";
};

const rolePickerItems = computed((): DropdownMenuItem[] => {
  const current = currentAssignableRole.value;
  return ASSIGNABLE_CLUB_ROLES.filter((role) => {
    return role !== current;
  }).map((role) => {
    return {
      label: translateRole[role],
      icon: rolePickerIcon(role),
      onSelect: () => {
        emit("pick", role);
      },
    };
  });
});
</script>
