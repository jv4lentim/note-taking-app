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
    <h2 class="text-xl font-bold text-slate-800 mb-6">{{ t("notes.listTitle") }}</h2>
    <p v-if="notesStore.loading" class="text-gray-500 text-base">{{ t("notes.loading") }}</p>
    <p v-else-if="notesStore.error" class="text-sm text-red-600">{{ t(notesStore.error!) }}</p>
    <p v-else-if="notesStore.notes.length === 0" class="text-gray-500 text-base">{{ t("notes.empty") }}</p>
    <ul v-else class="list-none m-0 p-0">
      <li v-for="(note, index) in notesStore.notes" :key="note.id">
        <div class="py-1">
          <div class="flex gap-2 items-baseline">
            <span class="text-slate-800 font-bold shrink-0">•</span>
            <span class="font-bold text-slate-800 text-base break-words min-w-0">{{ note.title }}</span>
          </div>
          <p v-if="note.content" class="mt-1 ml-4 mb-0 text-gray-500 text-base whitespace-pre-wrap break-words">{{ note.content }}</p>
        </div>
        <hr v-if="index < notesStore.notes.length - 1" class="border-0 border-t border-gray-300 my-2" />
      </li>
    </ul>

    <div v-if="notesStore.pagination.pages > 1" class="flex items-center justify-center gap-4 mt-6">
      <button
        class="bg-transparent border border-gray-300 rounded py-1.5 px-4 text-sm text-gray-700 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
        :disabled="!notesStore.pagination.prev"
        @click="notesStore.fetchNotes(notesStore.pagination.prev!)"
      >
        {{ t("notes.pagination.previous") }}
      </button>
      <span class="text-sm text-gray-500">
        {{ t("notes.pagination.page", { page: notesStore.pagination.page, pages: notesStore.pagination.pages }) }}
      </span>
      <button
        class="bg-transparent border border-gray-300 rounded py-1.5 px-4 text-sm text-gray-700 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
        :disabled="!notesStore.pagination.next"
        @click="notesStore.fetchNotes(notesStore.pagination.next!)"
      >
        {{ t("notes.pagination.next") }}
      </button>
    </div>
  </section>
</template>
