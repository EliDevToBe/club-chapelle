<template>
  <ContentPageWrapper class="items-center">
    <ChapSection
      v-if="!invitationToken"
      class="place-self-center"
      is-main-section
      title="Lien invalide ou expiré"
    >
      <p class="max-w-md text-muted mb-6">
        Ce lien d’invitation est incomplet ou a expiré. Demandez une nouvelle
        invitation à un administrateur du club.
      </p>
      <ChapButton to="/login" label="Retour à la connexion" color="primary" />
    </ChapSection>

    <div v-else>
      <ChapSection is-main-section title="Créer votre mot de passe">
        <AuthFlowForm
          mode="invitationRegister"
          :loading="pending"
          @submit="onSubmit"
        />
      </ChapSection>
    </div>
  </ContentPageWrapper>
</template>

<script setup lang="ts">
import AuthFlowForm, {
  type AuthFlowSubmitPayload,
} from "~/components/auth/AuthFlowForm.vue";
import ContentPageWrapper from "~/components/layout/ContentPageWrapper.vue";
import ChapButton from "~/components/ui/ChapButton.vue";
import ChapSection from "~/components/ui/ChapSection.vue";
import { useAuthUser } from "~/composables/useAuthUser";
import { useChapToast } from "~/composables/useChapToasts";
import type { SessionUser } from "~~/shared/auth/session-user";

definePageMeta({
  layout: "default",
});

useHead({
  title: "Invitation - Arc18",
});

const route = useRoute();
const { user, setUser } = useAuthUser();
const { addToastError, addToastSuccess } = useChapToast();

const pending = ref(false);

const invitationToken = computed(() => {
  const raw = route.query.t;
  return typeof raw === "string" && raw.length > 0 ? raw : null;
});

watch(user, () => {
  if (user.value) {
    navigateTo("/");
  }
});

const onSubmit = async (payload: AuthFlowSubmitPayload) => {
  if (payload.kind !== "invitationRegister") {
    return;
  }

  const token = invitationToken.value;
  if (!token) {
    return;
  }

  pending.value = true;
  try {
    const response = await $fetch<{ ok: true; session: SessionUser }>(
      "/api/auth/accept-invitation",
      {
        method: "POST",
        body: {
          token,
          password: payload.password,
          confirmPassword: payload.confirmPassword,
        },
        credentials: "include",
      },
    );
    setUser(response.session);
    await navigateTo("/");
    addToastSuccess({
      title: "Compte activé",
      description: "Vous êtes connecté·e.",
    });
  } catch (error) {
    console.error(error);
    addToastError({
      title: "Activation impossible",
      description:
        "Ce lien est invalide ou expiré, ou une erreur s'est produite. Réessayez ou demandez une nouvelle invitation.",
    });
  } finally {
    pending.value = false;
  }
};
</script>
