<template>
  <ContentPageWrapper>
    <ChapSection class="place-self-center" is-main-section title="Connexion">
      <AuthFlowForm
        v-model:mode="mode"
        :loading="loginPending"
        @submit="onAuthSubmit"
      />
    </ChapSection>
  </ContentPageWrapper>
</template>

<script setup lang="ts">
import AuthFlowForm, {
  type AuthFlowMode,
  type AuthFlowSubmitPayload,
} from "~/components/auth/AuthFlowForm.vue";
import ContentPageWrapper from "~/components/layout/ContentPageWrapper.vue";
import ChapSection from "~/components/ui/ChapSection.vue";
import { useAuthUser } from "~/composables/useAuthUser";
import { useChapToast } from "~/composables/useChapToasts";
import type { SessionUser } from "~~/shared/auth/session-user";

definePageMeta({
  layout: "default",
});

const route = useRoute();
const { addToastError, addToastInfo } = useChapToast();
const { setUser, user } = useAuthUser();

const mode = ref<AuthFlowMode>("login");
const loginPending = ref(false);

const onAuthSubmit = async (payload: AuthFlowSubmitPayload) => {
  if (payload.kind === "forgotPassword") {
    addToastInfo(
      "La réinitialisation du mot de passe par e-mail n'est pas encore activée.",
      { title: "Bientôt disponible", id: "soon" },
    );
    return;
  }

  if (payload.kind === "invitationRegister") {
    return;
  }

  loginPending.value = true;
  try {
    const response = await $fetch<{ ok: true; session: SessionUser }>(
      "/api/auth/login",
      {
        method: "POST",
        body: {
          email: payload.email,
          password: payload.password,
        },
        credentials: "include",
      },
    );
    setUser(response.session);

    const raw = route.query.redirect;
    const redirect =
      typeof raw === "string" && raw.startsWith("/") && !raw.startsWith("//")
        ? raw
        : "/";

    await navigateTo(redirect);
  } catch {
    addToastError(
      "E-mail ou mot de passe incorrect. Vérifiez vos identifiants ou réessayez plus tard.",
    );
  } finally {
    loginPending.value = false;
  }
};
</script>
