<template>
  <UModal v-model:open="isOpen">
    <template #content>
      <div :class="ui.root">
        <div :class="ui.header">
          <span :class="ui.title">Inviter un·e membre</span>
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
          <UFormField label="Nom" required>
            <ChapInput
              :class="name.trim() ? ui.validField : ''"
              v-model="name"
              placeholder="Robin H."
              class="w-full"
            />
          </UFormField>

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
  inviteMemberBodySchema,
  prepareInviteMemberBody,
} from "~~/shared/invitation/invite-member.schema";
import { readApiErrorReason } from "~~/shared/utils/read-api-error.helper";

const emit = defineEmits<{
  invited: [];
}>();

const isOpen = defineModel<boolean>("open");

const name = ref("");
const email = ref("");

const { invite, isInviting } = useMemberManagement();
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
  return name.value.trim().length > 0 && email.value.trim().length > 0;
});

const resetForm = (): void => {
  name.value = "";
  email.value = "";
};

const onInvite = async (): Promise<void> => {
  const parsed = inviteMemberBodySchema.safeParse(
    prepareInviteMemberBody({
      name: name.value,
      email: email.value,
    }),
  );
  if (!parsed.success) {
    addToastError({
      description: "Vérifiez le nom et l’adresse e-mail.",
    });
    return;
  }

  try {
    const result = await invite({
      ...parsed.data,
      allow_resent: false,
    });
    if (!result.mail_sent) {
      addToastError({
        title: "Membre créé",
        description:
          "Le compte existe, mais l’e-mail n’a pas pu être envoyé. Réessayez plus tard.",
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
    if (reason === API_ERROR_REASON.invitation.account_already_invited) {
      addToastError({
        description:
          "Une invitation est déjà en cours pour cette adresse. Utilisez « Renvoyer l’invitation » dans la liste.",
      });
      return;
    }
    if (reason === API_ERROR_REASON.invitation.public_name_taken) {
      addToastError({
        description: "Ce nom est déjà utilisé par un·e archer·ère.",
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
