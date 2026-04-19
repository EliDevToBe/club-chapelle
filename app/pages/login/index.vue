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

definePageMeta({
  layout: "default",
});

const route = useRoute();
const { addToastError, addToastInfo, addToastSuccess } = useChapToast();
const { login } = useAuthUser();

const mode = ref<AuthFlowMode>("login");
const loginPending = ref(false);

const onAuthSubmit = async (payload: AuthFlowSubmitPayload) => {
  if (payload.kind === "forgotPassword") {
    addToastInfo({
      id: "soon",
      title: "Bientôt disponible",
      description:
        "La réinitialisation du mot de passe par e-mail n'est pas encore activée.",
    });
    return;
  }

  if (payload.kind === "invitationRegister") {
    return;
  }

  loginPending.value = true;
  try {
    await login(payload.email, payload.password);

    const raw = route.query.redirect;
    const redirect =
      typeof raw === "string" && raw.startsWith("/") && !raw.startsWith("//")
        ? raw
        : "/";

    await navigateTo(redirect);
    addToastSuccess({ title: "Connexion réussie" });
  } catch {
    addToastError({
      description:
        "E-mail ou mot de passe incorrect. Vérifiez vos identifiants ou réessayez plus tard.",
    });
  } finally {
    loginPending.value = false;
  }
};
</script>
