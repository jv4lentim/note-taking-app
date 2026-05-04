<script setup lang="ts">
import { ref } from "vue";
import { useI18n } from "vue-i18n";
import axios from "axios";
import { useNotesStore } from "@/stores/notes";

const TITLE_MAX = 200;
const CONTENT_MAX = 10_000;

const { t } = useI18n();
const notesStore = useNotesStore();

const title = ref("");
const content = ref("");
const submitting = ref(false);
const fieldErrors = ref<{ title?: string; content?: string }>({});
const submitError = ref<string | null>(null);

function validateFields(): boolean {
  fieldErrors.value = {};
  if (!title.value.trim()) {
    fieldErrors.value.title = t("notes.errors.titleRequired");
  } else if (title.value.length > TITLE_MAX) {
    fieldErrors.value.title = t("notes.errors.titleMax");
  }
  if (content.value.length > CONTENT_MAX) {
    fieldErrors.value.content = t("notes.errors.contentMax");
  }
  return Object.keys(fieldErrors.value).length === 0;
}

async function handleSubmit() {
  if (!validateFields()) return;
  submitting.value = true;
  submitError.value = null;
  try {
    await notesStore.createNote(title.value.trim(), content.value);
    title.value = "";
    content.value = "";
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      const errors = err.response?.data?.errors;
      submitError.value = Array.isArray(errors) ? errors.join(" ") : t("notes.errors.saveFailed");
    } else {
      submitError.value = t("notes.errors.saveFailed");
    }
  } finally {
    submitting.value = false;
  }
}
</script>

<template>
  <section>
    <h2 class="text-xl font-bold text-slate-800 mb-6">{{ t("notes.sectionTitle") }}</h2>
    <form class="flex flex-col gap-4" novalidate @submit.prevent="handleSubmit">
      <div class="grid grid-cols-[90px_1fr] items-start gap-2">
        <label class="text-base text-gray-700 pt-2" for="note-title">{{ t("notes.titleLabel") }}</label>
        <div class="flex flex-col gap-1">
          <input
            id="note-title"
            v-model="title"
            type="text"
            class="w-full py-2 px-3 border border-gray-300 rounded text-base text-gray-700 bg-white placeholder:text-gray-400 resize-y"
            :class="{ 'border-red-600': fieldErrors.title }"
            :placeholder="t('notes.titlePlaceholder')"
            :maxlength="TITLE_MAX"
            autocomplete="off"
          />
          <span v-if="fieldErrors.title" class="text-sm text-red-600">{{ fieldErrors.title }}</span>
        </div>
      </div>
      <div class="grid grid-cols-[90px_1fr] items-start gap-2">
        <label class="text-base text-gray-700 pt-2" for="note-content">{{ t("notes.contentLabel") }}</label>
        <div class="flex flex-col gap-1">
          <textarea
            id="note-content"
            v-model="content"
            class="w-full py-2 px-3 border border-gray-300 rounded text-base text-gray-700 bg-white placeholder:text-gray-400 resize-y"
            :class="{ 'border-red-600': fieldErrors.content }"
            :placeholder="t('notes.contentPlaceholder')"
            :maxlength="CONTENT_MAX"
            rows="5"
          />
          <span v-if="fieldErrors.content" class="text-sm text-red-600">{{ fieldErrors.content }}</span>
        </div>
      </div>
      <span v-if="submitError" class="text-sm text-red-600 text-center">{{ submitError }}</span>
      <div class="flex justify-center">
        <button
          type="submit"
          class="bg-primary text-white font-bold border-0 rounded py-2.5 px-10 text-base cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
          :disabled="submitting"
        >
          {{ submitting ? t("notes.saving") : t("notes.save") }}
        </button>
      </div>
    </form>
  </section>
</template>
