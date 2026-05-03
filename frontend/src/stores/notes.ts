import { ref } from "vue";
import { defineStore } from "pinia";
import http from "@/api/http";

export interface Note {
  id: number;
  title: string;
  content: string | null;
  created_at: string;
}

export interface Pagination {
  page: number;
  pages: number;
  count: number;
  next: number | null;
  prev: number | null;
}

interface NotesResponse {
  notes: Note[];
  pagination: Pagination;
}

export const useNotesStore = defineStore("notes", () => {
  const notes = ref<Note[]>([]);
  const pagination = ref<Pagination>({ page: 1, pages: 1, count: 0, next: null, prev: null });
  const loading = ref(false);
  const error = ref<string | null>(null);

  async function fetchNotes(page = 1): Promise<void> {
    loading.value = true;
    error.value = null;
    try {
      const { data } = await http.get<NotesResponse>("/notes", { params: { page } });
      notes.value = data.notes;
      pagination.value = data.pagination;
    } catch (err) {
      error.value = "notes.errors.loadFailed";
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function createNote(title: string, content: string): Promise<void> {
    await http.post<Note>("/notes", { note: { title, content } });
    await fetchNotes(1);
  }

  return { notes, pagination, loading, error, fetchNotes, createNote };
});
