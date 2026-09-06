<template>
  <UModal v-model:open="isOpen">
    <template #content>
      <div :class="ui.root">
        <div :class="ui.header">
          <span :class="ui.title">Inviter {{ publicName }}</span>
          <UButton
            icon="i-ph-x-bold"
            variant="link"
            color="secondary"
            class="size-4"
            size="sm"
            @click="
              () => {
                isOpen = false;
              }
            "
          />
        </div>

        <div :class="ui.body">
          <p class="text-sm text-muted">
            L’archer·ère existe déjà. Indiquez l’e-mail pour créer le compte et
            envoyer l’invitation.
          </p>
          <UFormField label="E-mail" required>
            <ChapInput
              :class="email.trim() ? ui.validField : ''"
              v-model="email"
              placeholder="robin@sherwood.bow"
              class="w-full"
            />
          </UFormField>
        </div>

        <div :class="ui.footer">
          <UButton
            :disabled="!canSubmit || isInviting"
            :loading="isInviting"
            label="Envoyer l’invitation"
            @click="onInvite"
          />
        </div>
      </div>
    </template>
  </UModal>
</template>

<script setup lang="ts">
import ChapInput from "~/components/ui/ChapInput.vue";
import { useChapToast } from "~/composables/useChapToasts";
import { useMemberManagement } from "~/composables/useMemberManagement";
import { API_ERROR_REASON } from "~~/shared/api-error-reasons";
import {
  inviteArcherShellBodySchema,
  prepareInviteArcherShellBody,
} from "~~/shared/invitation/invite-archer-shell.schema";
import { readApiErrorReason } from "~~/shared/utils/read-api-error.helper";

const props = defineProps<{
  archerId: string;
  publicName: string;
}>();

const emit = defineEmits<{
  invited: [];
}>();

const isOpen = defineModel<boolean>("open");

const email = ref("");

const { inviteShell, isInviting } = useMemberManagement();
const { addToastError, addToastSuccess } = useChapToast();

const ui = {
  root: "p-4 flex flex-col gap-8",
  header: "flex justify-between items-center",
  body: "flex flex-col gap-6",
  footer: "flex justify-end",
  title: "text-lg font-semibold leading-tight",
  validField: "ring-1 ring-success-500/60 rounded-md",
};

const canSubmit = computed(() => {
  return email.value.trim().length > 0;
});

const resetForm = (): void => {
  email.value = "";
};

const onInvite = async (): Promise<void> => {
  const parsed = inviteArcherShellBodySchema.safeParse(
    prepareInviteArcherShellBody({
      archer_id: props.archerId,
      email: email.value,
    }),
  );
  if (!parsed.success) {
    addToastError({
      description: "Vérifiez l’adresse e-mail.",
    });
    return;
  }

  try {
    const result = await inviteShell(parsed.data);
    if (!result.mail_sent) {
      addToastError({
        title: result.resent ? "Invitation enregistrée" : "Compte lié",
        description:
          "Le compte existe, mais l’e-mail n’a pas pu être envoyé. Réessayez plus tard.",
      });
    } else if (result.resent) {
      addToastSuccess({
        title: "Invitation renvoyée",
        description: "Un nouvel e-mail a été envoyé.",
      });
    } else {
      addToastSuccess({
        title: "Invitation envoyée",
      });
    }
    resetForm();
    isOpen.value = false;
    emit("invited");
  } catch (error) {
    const reason = readApiErrorReason(error);
    if (reason === API_ERROR_REASON.invitation.account_already_active) {
      addToastError({
        description: "Un compte actif existe déjà pour cette adresse e-mail.",
      });
      return;
    }
    if (reason === API_ERROR_REASON.invitation.archer_already_linked) {
      addToastError({
        description: "Cet·te archer·ère est déjà lié·e à un compte.",
      });
      return;
    }
    if (reason === API_ERROR_REASON.invitation.email_already_linked) {
      addToastError({
        description:
          "Cette adresse e-mail est déjà liée à un·e autre archer·ère.",
      });
      return;
    }
    addToastError({
      description: "Impossible d’envoyer l’invitation. Réessayez plus tard.",
    });
  }
};

watch(isOpen, (open) => {
  if (!open) {
    resetForm();
  }
});
</script>
