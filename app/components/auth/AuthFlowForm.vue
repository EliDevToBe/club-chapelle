<template>
  <form :class="ui.form" @submit.prevent="onSubmit">
    <!-- Email -->
    <template v-if="mode === 'login' || mode === 'forgotPassword'">
      <UFormField label="E-mail" name="email" required>
        <template #help>
          <span v-if="mode === 'forgotPassword'">
            {{ "Un email de réinitialisation vous sera envoyé." }}
          </span>
        </template>

        <UInput
          v-model="form.email"
          :disabled="loading"
          :class="ui.formInput"
          placeholder="robin@sherwood.bow"
        />
      </UFormField>
    </template>

    <!-- Password -->
    <template v-if="mode === 'login' || mode === 'invitationRegister'">
      <UFormField label="Mot de passe" name="password" required>
        <UInput
          v-model="form.password"
          type="password"
          :disabled="loading"
          :class="ui.formInput"
        />
      </UFormField>
    </template>

    <!-- Confirm password -->
    <template v-if="mode === 'invitationRegister'">
      <UFormField
        label="Confirmer le mot de passe"
        name="confirmPassword"
        required
      >
        <UInput
          v-model="form.confirmPassword"
          type="password"
          autocomplete="off"
          :disabled="loading"
          :class="ui.formInput"
        />
      </UFormField>
    </template>

    <!-- Actions -->
    <div>
      <!-- Link  -->
      <template v-if="mode === 'login'">
        <div :class="ui.rowBetween">
          <ChapButton
            type="button"
            variant="link"
            label="Mot de passe oublié ?"
            :disabled="loading"
            additional-class="px-0 text-sm"
            @click="emit('update:mode', 'forgotPassword')"
          />
        </div>
      </template>
      <template v-else-if="mode === 'forgotPassword'">
        <div :class="ui.rowBetween">
          <ChapButton
            type="button"
            variant="link"
            label="Retour à la connexion"
            :disabled="loading"
            additional-class="px-0 text-sm"
            @click="emit('update:mode', 'login')"
          />
        </div>
      </template>

      <!-- Submit  -->
      <div :class="ui.formActions">
        <ChapButton
          type="submit"
          color="primary"
          :loading="loading"
          :label="modeData[mode].submitText"
          class="w-full sm:w-auto md:w-35"
        />
      </div>
    </div>
  </form>

  <ChapWatermark>
    <img class="opacity-5 size-230" aria-hidden="true" src="/club-logo.svg"
  /></ChapWatermark>
</template>

<script setup lang="ts">
import ChapButton from "~/components/ui/ChapButton.vue";
import { useChapToast } from "~/composables/useChapToasts";
import { useZod } from "~/composables/useZod";
import {
  authForgotPasswordFormSchema,
  authInvitationRegisterFormSchema,
  authLoginFormSchema,
} from "~/schemas/auth-flow.zod";
import ChapWatermark from "../ui/ChapWatermark.vue";

export type AuthFlowMode = "login" | "invitationRegister" | "forgotPassword";

export type AuthFlowSubmitPayload =
  | { kind: "login"; email: string; password: string }
  | { kind: "forgotPassword"; email: string }
  | {
      kind: "invitationRegister";
      password: string;
      confirmPassword: string;
    };

type ModeData = {
  submitText: string;
  submit: () => void;
};

const props = withDefaults(
  defineProps<{
    mode: AuthFlowMode;
    loading?: boolean;
  }>(),
  {
    loading: false,
  },
);

const emit = defineEmits<{
  "update:mode": [mode: AuthFlowMode];
  submit: [payload: AuthFlowSubmitPayload];
}>();

const { addToastError } = useChapToast();
const { getZodIssues } = useZod();

const ui = {
  form: "max-w-100 flex flex-col gap-4",
  formInput: "w-full md:w-80",
  formActions: "w-full md:w-80 mt-4 flex items-center justify-end",
  rowBetween: "w-full md:w-80 flex justify-start",
};

const form = reactive({
  email: "",
  password: "",
  confirmPassword: "",
});

const login = () => {
  const body = {
    email: form.email,
    password: form.password,
  };
  try {
    const parsed = authLoginFormSchema.parse(body);
    emit("submit", {
      kind: "login",
      email: parsed.email,
      password: parsed.password,
    });
  } catch (error: unknown) {
    const issues = getZodIssues(error);
    addToastError({
      description: "Veuillez vérifier les champs du formulaire.",
      title: issues?.[0]?.message ?? "Saisie invalide",
      id: "login-form-error",
    });
  }
};

const forgotPassword = () => {
  const body = { email: form.email };
  try {
    const parsed = authForgotPasswordFormSchema.parse(body);
    emit("submit", { kind: "forgotPassword", email: parsed.email });
  } catch (error: unknown) {
    const issues = getZodIssues(error);
    addToastError({
      description: "Veuillez vérifier les champs du formulaire.",
      title: issues?.[0]?.message ?? "Saisie invalide",
    });
  }
};

const register = () => {
  const body = {
    password: form.password,
    confirmPassword: form.confirmPassword,
  };
  try {
    const parsed = authInvitationRegisterFormSchema.parse(body);
    emit("submit", {
      kind: "invitationRegister",
      password: parsed.password,
      confirmPassword: parsed.confirmPassword,
    });
  } catch (error: unknown) {
    const issues = getZodIssues(error);
    addToastError({
      description: "Veuillez vérifier les champs du formulaire.",
      title: issues?.[0]?.message ?? "Saisie invalide",
    });
  }
};

const modeData: Record<AuthFlowMode, ModeData> = {
  login: {
    submitText: "Se connecter",
    submit: login,
  },
  forgotPassword: {
    submitText: "Continuer",
    submit: forgotPassword,
  },
  invitationRegister: {
    submitText: "Enregistrer",
    submit: register,
  },
};

watch(
  () => props.mode,
  () => {
    form.email = "";
    form.password = "";
    form.confirmPassword = "";
  },
);

const onSubmit = () => {
  modeData[props.mode].submit();
};
</script>
