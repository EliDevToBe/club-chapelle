<template>
  <ChapSection title="Envoyer un message">
    <form :class="ui.form" @submit.prevent="onSubmit">
      <UFormField label="Nom" name="name" required>
        <UInput
          v-model="form.name"
          type="text"
          autocomplete="name"
          :disabled="submitting"
          :class="ui.formInput"
        />
      </UFormField>

      <UFormField label="Email" name="email" required>
        <UInput
          v-model="form.email"
          autocomplete="email"
          :disabled="submitting"
          :class="ui.formInput"
        />
      </UFormField>
      <UFormField label="Objet" name="subject" required>
        <UInput
          v-model="form.subject"
          type="text"
          autocomplete="off"
          :disabled="submitting"
          :class="ui.formInput"
        />
      </UFormField>
      <UFormField label="Message" name="message" required>
        <div class="flex flex-col gap-1">
          <UTextarea
            v-model="form.message"
            :rows="5"
            autoresize
            :maxrows="16"
            :disabled="submitting"
            :class="ui.formInput"
          />

          <span :class="ui.formInputHint">
            <span
              class="text-sm text-muted transition-all duration-300 ease-in-out"
              :class="{
                'text-error! font-semibold':
                  form.message.length && form.message.length < 20,
              }"
            >
              {{ `${form.message.length} / 3000` }}
            </span>
          </span>
        </div>
      </UFormField>
      <div :class="ui.formInputHint">
        <ChapButton
          type="submit"
          color="primary"
          :loading="submitting"
          label="Envoyer"
          class="w-full sm:w-auto md:w-25 md:min-h-10"
        />
      </div>
    </form>
  </ChapSection>
</template>

<script setup lang="ts">
import ChapButton from "~/components/ui/ChapButton.vue";
import ChapSection from "~/components/ui/ChapSection.vue";
import { useChapToast } from "~/composables/useChapToasts";
import { useZod } from "~/composables/useZod";
import { contactFormSchema } from "~/schemas/contact-form.zod";

const ui = {
  form: "max-w-100 flex flex-col gap-4",
  formInput: "w-full md:w-80",
  formInputHint: "w-full md:w-80 flex items-center justify-end mr-1 gap-1",
};

const { addToastError, addToastSuccess } = useChapToast();
const { getZodIssues } = useZod();

const form = reactive({
  name: "",
  email: "",
  subject: "",
  message: "",
});

const submitting = ref(false);

const onSubmit = async () => {
  const body = {
    name: form.name,
    email: form.email,
    subject: form.subject,
    message: form.message,
  };

  try {
    contactFormSchema.parse(body);
  } catch (error) {
    const issues = getZodIssues(error);
    console.log(issues);

    addToastError(
      "Veuillez vérifier que tous les champs sont correctement remplis.",
      { title: `${issues?.[0]?.message}` },
    );

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
    form.subject = "";
    form.message = "";

    addToastSuccess("Merci ! Nous vous répondrons dès que possible.");
  } catch (e: unknown) {
    addToastError(
      "Une erreur est survenue. Réessayez plus tard ou écrivez-nous directement par mail.",
    );
  } finally {
    submitting.value = false;
  }
};
</script>

<style scoped lang=""></style>
