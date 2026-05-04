import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { mount } from "@vue/test-utils";
import { createPinia, setActivePinia } from "pinia";
import { createI18n } from "vue-i18n";
import NoteList from "@/components/NoteList.vue";
import { useNotesStore } from "@/stores/notes";
import ptBR from "@/locales/pt-BR";

vi.mock("@/stores/notes", () => ({
  useNotesStore: vi.fn(),
}));

vi.mock("@/router", () => ({
  default: { push: vi.fn() },
}));

const i18n = createI18n({ legacy: false, locale: "pt-BR", messages: { "pt-BR": ptBR } });

const basePagination = { page: 1, pages: 1, count: 0, next: null, prev: null };

function mockStore(overrides: object) {
  vi.mocked(useNotesStore).mockReturnValue({
    notes: [],
    pagination: basePagination,
    loading: false,
    error: null,
    fetchNotes: vi.fn(),
    ...overrides,
  } as ReturnType<typeof useNotesStore>);
}

function mountList() {
  return mount(NoteList, { global: { plugins: [createPinia(), i18n] } });
}

describe("NoteList", () => {
  beforeEach(() => setActivePinia(createPinia()));
  afterEach(() => vi.clearAllMocks());

  it("shows loading text while fetching", () => {
    mockStore({ loading: true });
    const wrapper = mountList();
    expect(wrapper.text()).toContain(i18n.global.t("notes.loading"));
  });

  it("shows empty message when there are no notes", () => {
    mockStore({ notes: [], loading: false });
    const wrapper = mountList();
    expect(wrapper.text()).toContain(i18n.global.t("notes.empty"));
  });

  it("shows error message when the store has an error", () => {
    mockStore({ error: "notes.errors.loadFailed", loading: false });
    const wrapper = mountList();
    expect(wrapper.find(".text-red-600").exists()).toBe(true);
  });

  it("renders note title, bullet, and content", () => {
    mockStore({
      notes: [{ id: 1, title: "My Note", content: "Body text", created_at: "" }],
      pagination: { ...basePagination, count: 1 },
    });
    const wrapper = mountList();
    expect(wrapper.text()).toContain("•");
    expect(wrapper.text()).toContain("My Note");
    expect(wrapper.text()).toContain("Body text");
  });

  it("does not render content paragraph when content is null", () => {
    mockStore({
      notes: [{ id: 1, title: "No content", content: null, created_at: "" }],
      pagination: { ...basePagination, count: 1 },
    });
    const wrapper = mountList();
    expect(wrapper.find("p.whitespace-pre-wrap").exists()).toBe(false);
  });

  it("hides pagination when there is only one page", () => {
    mockStore({ notes: [], pagination: { ...basePagination, pages: 1 } });
    const wrapper = mountList();
    expect(wrapper.find("button").exists()).toBe(false);
  });

  it("shows prev and next buttons when there are multiple pages", () => {
    mockStore({
      notes: [{ id: 1, title: "Note", content: null, created_at: "" }],
      pagination: { page: 2, pages: 3, count: 11, next: 3, prev: 1 },
    });
    const wrapper = mountList();
    expect(wrapper.findAll("button")).toHaveLength(2);
  });

  it("disables the previous button on the first page", () => {
    mockStore({
      notes: [{ id: 1, title: "Note", content: null, created_at: "" }],
      pagination: { page: 1, pages: 2, count: 6, next: 2, prev: null },
    });
    const wrapper = mountList();
    const [prevBtn] = wrapper.findAll("button");
    expect(prevBtn.attributes("disabled")).toBeDefined();
  });
});
