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
    <h2 class="section-title">{{ t("notes.sectionTitle") }}</h2>
    <form class="note-form" novalidate @submit.prevent="handleSubmit">
      <div class="field-row">
        <label for="note-title">{{ t("notes.titleLabel") }}</label>
        <div class="field-wrapper">
          <input
            id="note-title"
            v-model="title"
            type="text"
            :class="{ 'input--error': fieldErrors.title }"
            :placeholder="t('notes.titlePlaceholder')"
            :maxlength="TITLE_MAX"
            autocomplete="off"
          />
          <span v-if="fieldErrors.title" class="field-error">{{ fieldErrors.title }}</span>
        </div>
      </div>
      <div class="field-row">
        <label for="note-content">{{ t("notes.contentLabel") }}</label>
        <div class="field-wrapper">
          <textarea
            id="note-content"
            v-model="content"
            :class="{ 'input--error': fieldErrors.content }"
            :placeholder="t('notes.contentPlaceholder')"
            :maxlength="CONTENT_MAX"
            rows="5"
          />
          <span v-if="fieldErrors.content" class="field-error">{{ fieldErrors.content }}</span>
        </div>
      </div>
      <span v-if="submitError" class="submit-error">{{ submitError }}</span>
      <div class="btn-row">
        <button type="submit" class="btn-primary" :disabled="submitting">
          {{ submitting ? t("notes.saving") : t("notes.save") }}
        </button>
      </div>
    </form>
  </section>
</template>

<style scoped>
.section-title {
  font-size: 1.375rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 1.5rem;
}

.note-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.field-row {
  display: grid;
  grid-template-columns: 90px 1fr;
  align-items: start;
  gap: 0.5rem;
}

.field-row label {
  font-size: 1rem;
  color: #374151;
  padding-top: 0.5rem;
}

.field-wrapper {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

input,
textarea {
  width: 100%;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  padding: 0.5rem 0.75rem;
  font-size: 0.9375rem;
  color: #374151;
  background: #ffffff;
  font-family: inherit;
  box-sizing: border-box;
  resize: vertical;
}

input::placeholder,
textarea::placeholder {
  color: #9ca3af;
}

.input--error {
  border-color: #dc2626;
}

.field-error {
  font-size: 0.875rem;
  color: #dc2626;
}

.submit-error {
  font-size: 0.875rem;
  color: #dc2626;
  text-align: center;
}

.btn-row {
  display: flex;
  justify-content: center;
}

.btn-primary {
  background: #3b6fd4;
  color: #ffffff;
  font-weight: 700;
  border: none;
  border-radius: 4px;
  padding: 0.625rem 2.5rem;
  font-size: 0.9375rem;
  cursor: pointer;
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
