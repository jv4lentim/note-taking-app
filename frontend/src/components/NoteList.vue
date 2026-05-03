<script setup lang="ts">
import { onMounted } from "vue";
import { useI18n } from "vue-i18n";
import { useNotesStore } from "@/stores/notes";

const { t } = useI18n();
const notesStore = useNotesStore();

onMounted(() => notesStore.fetchNotes());
</script>

<template>
  <section>
    <h2 class="section-title">{{ t("notes.listTitle") }}</h2>
    <p v-if="notesStore.loading" class="muted">{{ t("notes.loading") }}</p>
    <p v-else-if="notesStore.error" class="field-error">{{ t(notesStore.error!) }}</p>
    <p v-else-if="notesStore.notes.length === 0" class="muted">{{ t("notes.empty") }}</p>
    <ul v-else class="notes-list">
      <li v-for="(note, index) in notesStore.notes" :key="note.id">
        <div class="note-item">
          <div class="note-title-line">
            <span class="bullet">•</span>
            <span class="note-title">{{ note.title }}</span>
          </div>
          <p v-if="note.content" class="note-content">{{ note.content }}</p>
        </div>
        <hr v-if="index < notesStore.notes.length - 1" class="divider" />
      </li>
    </ul>

    <div v-if="notesStore.pagination.pages > 1" class="pagination">
      <button
        class="btn-page"
        :disabled="!notesStore.pagination.prev"
        @click="notesStore.fetchNotes(notesStore.pagination.prev!)"
      >
        {{ t("notes.pagination.previous") }}
      </button>
      <span class="page-info">
        {{ t("notes.pagination.page", { page: notesStore.pagination.page, pages: notesStore.pagination.pages }) }}
      </span>
      <button
        class="btn-page"
        :disabled="!notesStore.pagination.next"
        @click="notesStore.fetchNotes(notesStore.pagination.next!)"
      >
        {{ t("notes.pagination.next") }}
      </button>
    </div>
  </section>
</template>

<style scoped>
.section-title {
  font-size: 1.375rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 1.5rem;
}

.muted {
  color: #6b7280;
  font-size: 0.9375rem;
}

.field-error {
  font-size: 0.875rem;
  color: #dc2626;
}

.notes-list {
  list-style: none;
  margin: 0;
  padding: 0;
}

.note-item {
  padding: 0.25rem 0;
}

.note-title-line {
  display: flex;
  gap: 0.5rem;
  align-items: baseline;
}

.bullet {
  color: #1e293b;
  font-weight: 700;
  flex-shrink: 0;
}

.note-title {
  font-weight: 700;
  color: #1e293b;
  font-size: 0.9375rem;
  word-break: break-word;
}

.note-content {
  margin: 0.25rem 0 0 1.1rem;
  color: #6b7280;
  font-size: 0.9375rem;
  white-space: pre-wrap;
  word-break: break-word;
}

.divider {
  border: none;
  border-top: 1px solid #d1d5db;
  margin: 0.5rem 0;
}

.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  margin-top: 1.5rem;
}

.btn-page {
  background: transparent;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  padding: 0.375rem 1rem;
  font-size: 0.9rem;
  color: #374151;
  cursor: pointer;
}

.btn-page:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.page-info {
  font-size: 0.9rem;
  color: #6b7280;
}
</style>
