<template>
  <ContentPageWrapper>
    <ChapSection is-main-section title="Paramètres">
      <div class="flex flex-col gap-8 max-w-xl">
        <p>
          Gérez le nom d’affichage de votre compte, votre e-mail et votre mot de
          passe.
        </p>
        <p v-if="loadError" class="text-error text-sm">
          {{ loadError }}
        </p>

        <UForm :state="nameForm" @submit="onSaveName">
          <ChapSection
            title="Nom du compte"
            description="Ce nom sert à vous reconnaître dans l’espace connecté. Il n’est pas le nom public affiché sur les compétitions."
          >
            <UFormField label="Nom" name="name" required>
              <USkeleton v-if="isLoadingProfile" class="h-9 w-full" />
              <UInput
                v-else
                v-model="nameForm.name"
                :maxlength="OWN_PROFILE_NAME_MAX_LENGTH"
                :disabled="isSavingName"
              />
            </UFormField>
            <UButton
              type="submit"
              label="Enregistrer le nom"
              size="sm"
              :loading="isSavingName"
              :disabled="isSavingName || isLoadingProfile"
              class="mt-3"
            />
          </ChapSection>
        </UForm>

        <ChapSection
          title="E-mail"
          description="Un code à 6 chiffres sera envoyé à la nouvelle adresse. Votre e-mail actuel ne change qu’après validation."
        >
          <p class="text-sm text-muted">
            Adresse actuelle :
            <USkeleton
              v-if="isLoadingProfile"
              class="inline-block h-4 w-48 align-middle ml-1"
            />
            <span v-else class="text-highlighted">{{ currentEmail }}</span>
          </p>

          <template v-if="!isLoadingProfile && pendingEmail">
            <p class="text-sm mt-3">
              Code envoyé à
              <span class="text-highlighted">{{ pendingEmail }}</span>
            </p>
            <UForm :state="otpForm" @submit="onConfirmEmailChange">
              <UFormField label="Code à 6 chiffres" name="otp" required>
                <UInput
                  v-model="otpForm.otp"
                  inputmode="numeric"
                  autocomplete="one-time-code"
                  :disabled="isSavingEmail"
                />
              </UFormField>
              <div class="flex flex-wrap gap-2 mt-3">
                <UButton
                  type="submit"
                  label="Valider le code"
                  size="sm"
                  :loading="isSavingEmail"
                  :disabled="isSavingEmail"
                />
                <UButton
                  label="Renvoyer"
                  size="sm"
                  variant="outline"
                  color="secondary"
                  :disabled="isSavingEmail"
                  @click="onResendEmailChange"
                />
                <UButton
                  label="Annuler"
                  size="sm"
                  variant="ghost"
                  color="neutral"
                  :disabled="isSavingEmail"
                  @click="onCancelEmailChange"
                />
              </div>
            </UForm>
          </template>

          <template v-else>
            <UForm :state="emailForm" @submit="onRequestEmailChange">
              <UFormField
                label="Nouvel e-mail"
                name="email"
                required
                class="mt-3"
              >
                <UInput
                  v-model="emailForm.email"
                  type="email"
                  :disabled="isSavingEmail || isLoadingProfile"
                />
              </UFormField>
              <UFormField
                label="Mot de passe actuel"
                name="current_password"
                required
                class="mt-3"
              >
                <UInput
                  v-model="emailForm.current_password"
                  type="password"
                  :disabled="isSavingEmail || isLoadingProfile"
                />
              </UFormField>
              <UButton
                type="submit"
                label="Envoyer le code"
                size="sm"
                :loading="isSavingEmail"
                :disabled="isSavingEmail || isLoadingProfile"
                class="mt-3"
              />
            </UForm>
          </template>
        </ChapSection>

        <UForm :state="passwordForm" @submit="onChangePassword">
          <ChapSection title="Mot de passe">
            <UFormField
              label="Mot de passe actuel"
              name="current_password"
              required
            >
              <UInput
                v-model="passwordForm.current_password"
                type="password"
                :disabled="isSavingPassword"
              />
            </UFormField>
            <UFormField
              label="Nouveau mot de passe"
              name="new_password"
              required
              class="mt-3"
            >
              <UInput
                v-model="passwordForm.new_password"
                type="password"
                :disabled="isSavingPassword"
              />
            </UFormField>
            <UFormField
              label="Confirmer le nouveau mot de passe"
              name="confirm_password"
              required
              class="mt-3"
            >
              <UInput
                v-model="passwordForm.confirm_password"
                type="password"
                :disabled="isSavingPassword"
              />
            </UFormField>
            <UButton
              type="submit"
              label="Mettre à jour le mot de passe"
              size="sm"
              :loading="isSavingPassword"
              :disabled="isSavingPassword"
              class="mt-3"
            />
          </ChapSection>
        </UForm>

        <ChapSection
          title="Suppression du compte"
          description="Votre compte sera supprimé. Vos données seront effacées et vous ne pourrez plus vous connecter."
        >
          <UButton
            label="Supprimer mon compte"
            color="error"
            variant="outline"
            size="sm"
            @click="
              () => {
                isRevokeOpen = true;
              }
            "
          />
        </ChapSection>
      </div>
    </ChapSection>

    <UModal v-model:open="isRevokeOpen" title="Supprimer le compte ?">
      <template #body>
        <p class="text-sm text-muted mb-3">
          Saisissez votre mot de passe pour confirmer. Vous ne pourrez plus vous
          connecter tant qu’un administrateur ne vous réinvitera pas.
        </p>
        <UFormField label="Mot de passe" name="revoke_password" required>
          <UInput v-model="revokePassword" type="password" />
        </UFormField>
      </template>
      <template #footer>
        <div class="flex w-full justify-end gap-2">
          <UButton
            label="Annuler"
            variant="outline"
            color="secondary"
            @click="
              () => {
                isRevokeOpen = false;
              }
            "
          />
          <UButton
            label="Révoquer"
            color="error"
            :loading="isRevoking"
            :disabled="isRevoking"
            @click="onRevokeAccess"
          />
        </div>
      </template>
    </UModal>
  </ContentPageWrapper>
</template>

<script setup lang="ts">
import ContentPageWrapper from "~/components/layout/ContentPageWrapper.vue";
import ChapSection from "~/components/ui/ChapSection.vue";
import { useAuthUser } from "~/composables/useAuthUser";
import { useChapToast } from "~/composables/useChapToasts";
import { useOwnProfile } from "~/composables/useOwnProfile";
import { API_ERROR_REASON } from "~~/shared/api-error-reasons";
import type { OwnProfileDto } from "~~/shared/user/own-profile.dto";
import {
  OWN_PROFILE_NAME_MAX_LENGTH,
  parseOwnChangeEmailBody,
  parseOwnChangePasswordBody,
  parseOwnConfirmEmailChangeBody,
  parseOwnProfileNameBody,
} from "~~/shared/user/own-profile.schema";
import { readApiErrorReason } from "~~/shared/utils/read-api-error.helper";

definePageMeta({
  layout: "default",
});

useHead({
  title: "Paramètres - Arc18",
});

const { setUser, clearSession, logout, hydrateIfNeeded } = useAuthUser();
const { addToastError, addToastSuccess, addToastInfo } = useChapToast();
const {
  fetchProfile,
  updateName,
  changePassword,
  requestEmailChange,
  confirmEmailChange,
  resendEmailChange,
  cancelEmailChange,
  revokeAccess,
} = useOwnProfile();

const profile = ref<OwnProfileDto | null>(null);
const isLoadingProfile = ref(false);
const loadError = ref<string | null>(null);

const currentEmail = computed(() => {
  return profile.value?.email ?? "";
});

const pendingEmail = computed(() => {
  return profile.value?.pending_email ?? null;
});
const isSavingName = ref(false);
const isSavingEmail = ref(false);
const isSavingPassword = ref(false);
const isRevokeOpen = ref(false);
const isRevoking = ref(false);
const revokePassword = ref("");

const nameForm = reactive({
  name: "",
});
const emailForm = reactive({
  email: "",
  current_password: "",
});
const otpForm = reactive({
  otp: "",
});
const passwordForm = reactive({
  current_password: "",
  new_password: "",
  confirm_password: "",
});

const describeProfileError = (error: unknown): string => {
  const reason = readApiErrorReason(error);
  if (reason === API_ERROR_REASON.auth.invalid_credentials) {
    return "Mot de passe incorrect.";
  }
  if (reason === API_ERROR_REASON.auth.email_unchanged) {
    return "Cette adresse est déjà la vôtre.";
  }
  if (reason === API_ERROR_REASON.invitation.email_already_linked) {
    return "Cette adresse e-mail est déjà utilisée.";
  }
  if (reason === API_ERROR_REASON.auth.otp_invalid) {
    return "Code invalide ou expiré. Demandez un nouveau code.";
  }
  if (reason === API_ERROR_REASON.auth.otp_cooldown) {
    return "Patientez quelques secondes avant de renvoyer un code.";
  }
  if (reason === API_ERROR_REASON.user_role.last_admin) {
    return "Le dernier administrateur ne peut pas révoquer son accès.";
  }
  return "Une erreur s’est produite. Réessayez plus tard.";
};

const applyProfile = (next: OwnProfileDto) => {
  profile.value = next;
  nameForm.name = next.name ?? "";
};

const loadProfile = async () => {
  isLoadingProfile.value = true;
  loadError.value = null;
  try {
    applyProfile(await fetchProfile());
  } catch {
    loadError.value =
      "Impossible de charger le profil. Vérifiez votre connexion ou réessayez plus tard.";
  } finally {
    isLoadingProfile.value = false;
  }
};

const onSaveName = async () => {
  try {
    parseOwnProfileNameBody({ name: nameForm.name });
  } catch {
    const trimmedName = nameForm.name.trim();
    addToastError({
      description:
        trimmedName.length > OWN_PROFILE_NAME_MAX_LENGTH
          ? "Le nom ne peut pas dépasser 40 caractères."
          : "Le nom est requis.",
    });
    return;
  }

  isSavingName.value = true;
  try {
    const response = await updateName(nameForm.name.trim());
    setUser(response.session);
    applyProfile(await fetchProfile());
    addToastSuccess({ title: "Nom mis à jour" });
  } catch (error) {
    addToastError({ description: describeProfileError(error) });
  } finally {
    isSavingName.value = false;
  }
};

const onRequestEmailChange = async () => {
  try {
    parseOwnChangeEmailBody({
      current_password: emailForm.current_password,
      email: emailForm.email,
    });
  } catch {
    addToastError({
      description: "Vérifiez l’e-mail et le mot de passe.",
    });
    return;
  }

  isSavingEmail.value = true;
  try {
    await requestEmailChange({
      currentPassword: emailForm.current_password,
      email: emailForm.email,
    });
    emailForm.current_password = "";
    emailForm.email = "";
    applyProfile(await fetchProfile());
    addToastSuccess({
      title: "Code envoyé",
      description: "Consultez la nouvelle boîte mail.",
    });
  } catch (error) {
    addToastError({ description: describeProfileError(error) });
  } finally {
    isSavingEmail.value = false;
  }
};

const onConfirmEmailChange = async () => {
  try {
    parseOwnConfirmEmailChangeBody({ otp: otpForm.otp });
  } catch {
    addToastError({ description: "Saisissez le code à 6 chiffres." });
    return;
  }

  isSavingEmail.value = true;
  try {
    await confirmEmailChange(otpForm.otp);
    otpForm.otp = "";
    applyProfile(await fetchProfile());
    addToastSuccess({ title: "E-mail mis à jour" });
  } catch (error) {
    addToastError({ description: describeProfileError(error) });
  } finally {
    isSavingEmail.value = false;
  }
};

const onResendEmailChange = async () => {
  isSavingEmail.value = true;
  try {
    await resendEmailChange();
    addToastInfo({
      title: "Code renvoyé",
      description: "Consultez à nouveau la nouvelle boîte mail.",
    });
  } catch (error) {
    addToastError({ description: describeProfileError(error) });
  } finally {
    isSavingEmail.value = false;
  }
};

const onCancelEmailChange = async () => {
  isSavingEmail.value = true;
  try {
    await cancelEmailChange();
    otpForm.otp = "";
    applyProfile(await fetchProfile());
    addToastInfo({ title: "Changement d’e-mail annulé" });
  } catch (error) {
    addToastError({ description: describeProfileError(error) });
  } finally {
    isSavingEmail.value = false;
  }
};

const onChangePassword = async () => {
  if (passwordForm.new_password !== passwordForm.confirm_password) {
    addToastError({
      description: "Les mots de passe doivent correspondre.",
    });
    return;
  }

  try {
    parseOwnChangePasswordBody({
      current_password: passwordForm.current_password,
      new_password: passwordForm.new_password,
    });
  } catch {
    addToastError({
      description:
        "Le nouveau mot de passe doit contenir 8 caractères, une majuscule, un chiffre et un caractère spécial.",
    });
    return;
  }

  isSavingPassword.value = true;
  try {
    await changePassword({
      currentPassword: passwordForm.current_password,
      newPassword: passwordForm.new_password,
    });
    passwordForm.current_password = "";
    passwordForm.new_password = "";
    passwordForm.confirm_password = "";
    addToastSuccess({ title: "Mot de passe mis à jour" });
  } catch (error) {
    addToastError({ description: describeProfileError(error) });
  } finally {
    isSavingPassword.value = false;
  }
};

const onRevokeAccess = async () => {
  if (revokePassword.value.trim().length === 0) {
    addToastError({ description: "Le mot de passe est requis." });
    return;
  }

  isRevoking.value = true;
  try {
    await revokeAccess(revokePassword.value);
    isRevokeOpen.value = false;
    revokePassword.value = "";
    await logout();
    clearSession();
    addToastInfo({
      title: "Accès révoqué",
      description: "Votre compte ne peut plus se connecter.",
    });
    navigateTo("/");
  } catch (error) {
    addToastError({ description: describeProfileError(error) });
  } finally {
    isRevoking.value = false;
  }
};

onMounted(async () => {
  await hydrateIfNeeded();
  await loadProfile();
});
</script>
