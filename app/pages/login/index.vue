<template>
  <ContentPageWrapper>
    <ChapSection class="place-self-center" is-main-section title="Connexion">
      <AuthFlowForm
        v-model:mode="mode"
        :loading="authPending"
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

useHead({
  title: "Connexion - Arc18",
});

const route = useRoute();
const { addToastError, addToastSuccess } = useChapToast();
const { login, user } = useAuthUser();

const mode = ref<AuthFlowMode>("login");
const authPending = ref(false);

const onAuthSubmit = async (payload: AuthFlowSubmitPayload) => {
  if (payload.kind === "forgotPassword") {
    authPending.value = true;
    try {
      $fetch("/api/auth/forgot-password", {
        method: "POST",
        body: { email: payload.email },
        credentials: "include",
      });
      addToastSuccess({
        title: "Demande prise en compte",
        description:
          "Si un compte correspond à cette adresse, vous recevrez un e-mail avec un lien pour réinitialiser votre mot de passe.",
      });
      mode.value = "login";
    } catch {
      addToastError({
        description:
          "Impossible d'envoyer la demande pour le moment. Vérifiez l'adresse e-mail ou réessayez plus tard.",
      });
    } finally {
      authPending.value = false;
    }
    return;
  }

  if (payload.kind === "invitationRegister") {
    return;
  }

  if (payload.kind === "login") {
    authPending.value = true;
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
      authPending.value = false;
    }
    return;
  }

  addToastError({
    description:
      "Une erreur inattendue est survenue. Veuillez réessayer plus tard.",
  });
};

watch([user], () => {
  if (user.value) {
    navigateTo("/");
  }
});
</script>
