<template>
  <UForm :class="ui.form" @submit.prevent="onSubmit">
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
    <template
      v-if="
        mode === 'login' ||
        mode === 'invitationRegister' ||
        mode === 'resetPassword'
      "
    >
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
    <template v-if="mode === 'invitationRegister' || mode === 'resetPassword'">
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
        <div class="mt-2">
          <UProgress
            size="sm"
            :model-value="successfulRequirements"
            :max="requirements.length"
            :ui="{ base: 'rounded-b-none!', indicator: 'bg-success-600!' }"
          />
          <UCard :ui="{ body: 'p-3!', root: 'rounded-t-xs!' }">
            <ul class="flex flex-col gap-1 md:gap-2">
              <ChapListItem
                v-for="requirement in requirements"
                :key="requirement.label"
              >
                <span
                  :class="requirement.value ? 'text-success-600' : 'text-muted'"
                >
                  {{ requirement.label }}
                </span>
              </ChapListItem>
            </ul>
          </UCard>
        </div>
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
          class="w-full sm:w-auto px-4"
        />
      </div>
    </div>
  </UForm>

  <ChapWatermark>
    <img class="opacity-8 size-230" aria-hidden="true" src="/club-logo.svg" />
  </ChapWatermark>
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
import ChapListItem from "../ui/ChapListItem.vue";
import ChapWatermark from "../ui/ChapWatermark.vue";

export type AuthFlowMode =
  | "login"
  | "invitationRegister"
  | "forgotPassword"
  | "resetPassword";

export type AuthFlowSubmitPayload =
  | { kind: "login"; email: string; password: string }
  | { kind: "forgotPassword"; email: string }
  | {
      kind: "invitationRegister";
      password: string;
      confirmPassword: string;
    }
  | {
      kind: "resetPassword";
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
const successfulRequirements = computed(
  () => requirements.value.filter((requirement) => requirement.value).length,
);

const requirements = computed(() => [
  { label: "Au moins un chiffre", value: /[0-9]/.test(form.password) },
  { label: "Au moins 8 caractères", value: form.password.length >= 8 },
  { label: "Au moins une majuscule", value: /[A-Z]/.test(form.password) },
  {
    label: "Au moins un caractère spécial",
    value: /[^A-Za-z0-9]/.test(form.password),
  },
  {
    label: "Les mots de passe correspondent",
    value:
      form.password.length &&
      form.confirmPassword.length &&
      form.password === form.confirmPassword,
  },
]);

const login = () => {
  const body = {
    email: form.email.trim().toLowerCase(),
    password: form.password.trim(),
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
  const body = { email: form.email.trim().toLowerCase() };
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

const resetPassword = () => {
  const body = {
    password: form.password,
    confirmPassword: form.confirmPassword,
  };
  try {
    const parsed = authInvitationRegisterFormSchema.parse(body);
    emit("submit", {
      kind: "resetPassword",
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
  resetPassword: {
    submitText: "Valider",
    submit: resetPassword,
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
