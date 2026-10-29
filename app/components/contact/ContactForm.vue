<template>
  <form :class="ui.form" @submit.prevent="onSubmit">
    <h3 class="sr-only">Envoyer un message</h3>

    <div :class="ui.identityRow">
      <UFormField label="Nom" name="name" required :ui="fieldUi">
        <UInput
          v-model="form.name"
          type="text"
          autocomplete="name"
          :disabled="submitting"
          :class="ui.formInput"
          size="lg"
          placeholder="Nom"
        />
      </UFormField>

      <UFormField label="E-mail" name="email" required :ui="fieldUi">
        <UInput
          v-model="form.email"
          type="email"
          autocomplete="email"
          :disabled="submitting"
          :class="ui.formInput"
          size="lg"
          placeholder="E-mail"
        />
      </UFormField>
    </div>

    <UFormField label="Message" name="message" required :ui="fieldUi">
      <UTextarea
        v-model="form.message"
        :rows="6"
        autoresize
        :maxrows="16"
        :disabled="submitting"
        :class="ui.formInput"
        size="lg"
        placeholder="Message"
      />
    </UFormField>

    <div :class="ui.actions">
      <span
        :class="[
          ui.counter,
          { 'text-error! font-semibold': isMessageTooShort },
        ]"
      >
        {{ `${form.message.length} / 3000` }}
      </span>

      <ChapButton
        type="submit"
        color="primary"
        :loading="submitting"
        label="Envoyer"
      />
    </div>

    <p :class="ui.privacyNotice">
      Les informations envoyées servent uniquement à répondre à votre demande.
      Voir la
      <ChapLink to="/privacy-policy" label="politique de confidentialité" />.
    </p>
  </form>
</template>

<script setup lang="ts">
import ChapButton from "~/components/ui/ChapButton.vue";
import ChapLink from "~/components/ui/ChapLink.vue";
import { useChapToast } from "~/composables/useChapToasts";
import { useZod } from "~/composables/useZod";
import { contactFormSchema } from "~/schemas/contact-form.zod";

const ui = {
  form: "flex flex-col gap-3 w-full max-w-2xl",
  identityRow: "grid grid-cols-1 sm:grid-cols-2 gap-3",
  formInput: "w-full",
  actions: "flex items-center justify-end gap-4",
  counter: "text-sm text-muted transition-colors duration-300",
  privacyNotice: "text-sm text-muted",
};

/** Labels stay in the accessibility tree; the design shows bare fields with placeholders. */
const fieldUi = { label: "sr-only" };

const { addToastError, addToastSuccess } = useChapToast();
const { getZodIssues } = useZod();

const form = reactive({
  name: "",
  email: "",
  message: "",
});

const submitting = ref(false);

const isMessageTooShort = computed(() => {
  return form.message.length > 0 && form.message.length < 20;
});

const onSubmit = async () => {
  const body = {
    name: form.name,
    email: form.email,
    message: form.message,
  };

  try {
    contactFormSchema.parse(body);
  } catch (error) {
    const issues = getZodIssues(error);

    addToastError({
      description:
        "Veuillez vérifier que tous les champs sont correctement remplis.",
      title: `${issues?.[0]?.message}`,
    });

    return;
  }

  submitting.value = true;
  try {
    await $fetch("/api/contact", {
      method: "POST",
      body,
    });
    form.name = "";
    form.email = "";
    form.message = "";

    addToastSuccess({
      title: "Message envoyé",
      description:
        "Merci pour votre message ! Nous vous répondrons dès que possible.",
      duration: 5000,
    });
  } catch (e: unknown) {
    addToastError({
      description:
        "Une erreur est survenue. Réessayez plus tard ou écrivez-nous directement par mail.",
    });
  } finally {
    submitting.value = false;
  }
};
</script>
