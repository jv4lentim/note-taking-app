import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { setActivePinia, createPinia } from "pinia";
import { useNotesStore } from "@/stores/notes";

vi.mock("@/api/http", () => ({
  default: {
    get: vi.fn<() => Promise<unknown>>(),
    post: vi.fn<() => Promise<unknown>>(),
    delete: vi.fn<() => Promise<unknown>>(),
    interceptors: {
      request: { use: vi.fn<() => void>() },
      response: { use: vi.fn<() => void>() },
    },
  },
}));

vi.mock("@/router", () => ({
  default: { push: vi.fn<() => void>() },
}));

import http from "@/api/http";

const mockPagination = { page: 1, pages: 1, count: 2, next: null, prev: null };
const mockNotes = [
  { id: 1, title: "First", content: "Content 1", created_at: "2026-01-02T00:00:00Z" },
  { id: 2, title: "Second", content: null, created_at: "2026-01-01T00:00:00Z" },
];

describe("useNotesStore", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("fetchNotes", () => {
    it("stores notes and pagination on success", async () => {
      vi.mocked(http.get).mockResolvedValueOnce({
        data: { notes: mockNotes, pagination: mockPagination },
      });

      const store = useNotesStore();
      await store.fetchNotes();

      expect(store.notes).toEqual(mockNotes);
      expect(store.pagination).toEqual(mockPagination);
    });

    it("sets error key and rethrows on API failure", async () => {
      vi.mocked(http.get).mockRejectedValueOnce(new Error("Network error"));

      const store = useNotesStore();
      await expect(store.fetchNotes()).rejects.toThrow();
      expect(store.error).toBe("notes.errors.loadFailed");
      expect(store.loading).toBe(false);
    });
  });

  describe("createNote", () => {
    it("sends title and content to the API", async () => {
      const newNote = { id: 3, title: "New", content: "Body", created_at: "2026-01-03T00:00:00Z" };
      vi.mocked(http.post).mockResolvedValueOnce({ data: newNote });
      vi.mocked(http.get).mockResolvedValueOnce({
        data: { notes: [newNote], pagination: { ...mockPagination, count: 1 } },
      });

      const store = useNotesStore();
      await store.createNote("New", "Body");

      expect(http.post).toHaveBeenCalledWith("/notes", { note: { title: "New", content: "Body" } });
    });

    it("refetches page 1 after creation so pagination stays correct", async () => {
      const newNote = { id: 3, title: "New", content: null, created_at: "2026-01-03T00:00:00Z" };
      vi.mocked(http.post).mockResolvedValueOnce({ data: newNote });
      vi.mocked(http.get).mockResolvedValueOnce({
        data: { notes: [newNote, ...mockNotes], pagination: { ...mockPagination, count: 3 } },
      });

      const store = useNotesStore();
      await store.createNote("New", "");

      expect(http.get).toHaveBeenCalledWith("/notes", { params: { page: 1 } });
      expect(store.notes[0]).toEqual(newNote);
      expect(store.pagination.count).toBe(3);
    });

    it("propagates API errors without swallowing them", async () => {
      vi.mocked(http.post).mockRejectedValueOnce({
        response: { status: 422, data: { errors: ["Title can't be blank"] } },
      });

      const store = useNotesStore();
      await expect(store.createNote("", "")).rejects.toMatchObject({
        response: { status: 422 },
      });
    });
  });

  describe("deleteNote", () => {
    it("calls DELETE and refetches the current page", async () => {
      const remaining = [{ id: 2, title: "Second", content: null, created_at: "" }];
      vi.mocked(http.delete).mockResolvedValueOnce({});
      vi.mocked(http.get).mockResolvedValueOnce({
        data: { notes: remaining, pagination: { ...mockPagination, count: 1 } },
      });

      const store = useNotesStore();
      store.notes = [...mockNotes];
      store.pagination = { ...mockPagination, page: 1 };

      await store.deleteNote(1);

      expect(http.delete).toHaveBeenCalledWith("/notes/1");
      expect(http.get).toHaveBeenCalledWith("/notes", { params: { page: 1 } });
      expect(store.notes).toEqual(remaining);
    });

    it("sets error key and rethrows when DELETE fails", async () => {
      vi.mocked(http.delete).mockRejectedValueOnce({ response: { status: 404 } });

      const store = useNotesStore();
      store.notes = [mockNotes[0]];
      store.pagination = { ...mockPagination };

      await expect(store.deleteNote(1)).rejects.toBeDefined();
      expect(store.error).toBe("notes.errors.deleteFailed");
    });

    it("goes to the previous page when deleting the last item on a non-first page", async () => {
      vi.mocked(http.delete).mockResolvedValueOnce({});
      vi.mocked(http.get).mockResolvedValueOnce({
        data: { notes: mockNotes, pagination: { ...mockPagination, page: 1 } },
      });

      const store = useNotesStore();
      store.notes = [{ id: 5, title: "Last on page 2", content: null, created_at: "" }];
      store.pagination = { page: 2, pages: 2, count: 6, next: null, prev: 1 };

      await store.deleteNote(5);

      expect(http.get).toHaveBeenCalledWith("/notes", { params: { page: 1 } });
    });
  });
});
