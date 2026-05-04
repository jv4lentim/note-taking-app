import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { mount, flushPromises } from "@vue/test-utils";
import { setActivePinia, createPinia } from "pinia";
import { createI18n } from "vue-i18n";
import NoteForm from "@/components/NoteForm.vue";
import ptBR from "@/locales/pt-BR";

vi.mock("@/api/http", () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    interceptors: {
      request: { use: vi.fn() },
      response: { use: vi.fn() },
    },
  },
}));

vi.mock("@/router", () => ({
  default: { push: vi.fn() },
}));

import http from "@/api/http";

const i18n = createI18n({ legacy: false, locale: "pt-BR", messages: { "pt-BR": ptBR } });

function mountForm() {
  return mount(NoteForm, { global: { plugins: [createPinia(), i18n] } });
}

describe("NoteForm", () => {
  beforeEach(() => setActivePinia(createPinia()));
  afterEach(() => vi.clearAllMocks());

  it("renders the title input and content textarea", () => {
    const wrapper = mountForm();
    expect(wrapper.find("input#note-title").exists()).toBe(true);
    expect(wrapper.find("textarea#note-content").exists()).toBe(true);
  });

  it("does not call the API when the title is empty", async () => {
    const wrapper = mountForm();
    await wrapper.find("form").trigger("submit");
    expect(http.post).not.toHaveBeenCalled();
  });

  it("shows an inline error below the title field when submitting without a title", async () => {
    const wrapper = mountForm();
    await wrapper.find("form").trigger("submit");
    await wrapper.vm.$nextTick();
    const error = wrapper.find("span.text-red-600");
    expect(error.exists()).toBe(true);
    expect(error.text()).toBe(i18n.global.t("notes.errors.titleRequired"));
  });

  it("calls the API with the trimmed title and clears the fields on success", async () => {
    vi.mocked(http.post).mockResolvedValueOnce({
      data: { id: 1, title: "My note", content: "", created_at: "" },
    });
    vi.mocked(http.get).mockResolvedValueOnce({
      data: { notes: [], pagination: { page: 1, pages: 1, count: 1, next: null, prev: null } },
    });

    const wrapper = mountForm();
    await wrapper.find("input#note-title").setValue("  My note  ");
    await wrapper.find("form").trigger("submit");
    await flushPromises();

    expect(http.post).toHaveBeenCalledWith("/notes", { note: { title: "My note", content: "" } });
    expect((wrapper.find("input#note-title").element as HTMLInputElement).value).toBe("");
  });

  it("shows a submit error when the API returns a validation error", async () => {
    vi.mocked(http.post).mockRejectedValueOnce({
      isAxiosError: true,
      response: { data: { errors: ["Title can't be blank"] } },
    });

    const wrapper = mountForm();
    await wrapper.find("input#note-title").setValue("x");
    await wrapper.find("form").trigger("submit");
    await flushPromises();

    expect(wrapper.find("span.text-red-600.text-center").exists()).toBe(true);
  });
});
