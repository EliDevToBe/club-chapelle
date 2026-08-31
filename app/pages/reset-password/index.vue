<template>
  <ContentPageWrapper class="items-center">
    <ChapSection
      v-if="!recoveryToken"
      class="place-self-center"
      is-main-section
      title="Lien invalide ou expiré"
    >
      <p class="max-w-md text-muted mb-6">
        Ce lien de réinitialisation est incomplet ou a expiré. Demandez un
        nouvel e-mail depuis la page de connexion.
      </p>
      <ChapButton to="/login" label="Retour à la connexion" color="primary" />
    </ChapSection>

    <div v-else>
      <ChapSection is-main-section title="Nouveau mot de passe">
        <AuthFlowForm
          mode="resetPassword"
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
  title: "Nouveau mot de passe - Arc18",
});

const route = useRoute();
const { user, setUser } = useAuthUser();
const { addToastError, addToastSuccess } = useChapToast();

const pending = ref(false);

const recoveryToken = computed(() => {
  const raw = route.query.t;
  return typeof raw === "string" && raw.length > 0 ? raw : null;
});

watch(user, () => {
  if (user.value) {
    navigateTo("/");
  }
});

const onSubmit = async (payload: AuthFlowSubmitPayload) => {
  if (payload.kind !== "resetPassword") {
    return;
  }

  const token = recoveryToken.value;
  if (!token) {
    return;
  }

  pending.value = true;
  try {
    const response = await $fetch<{ ok: true; session: SessionUser }>(
      "/api/auth/reset-password",
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
      title: "Mot de passe mis à jour",
      description: "Vous êtes connecté·e.",
    });
  } catch (error) {
    console.error(error);
    addToastError({
      title: "Réinitialisation impossible",
      description:
        "Ce lien est invalide ou expiré, ou une erreur s'est produite. Réessayez ou demandez un nouvel e-mail.",
    });
  } finally {
    pending.value = false;
  }
};
</script>
