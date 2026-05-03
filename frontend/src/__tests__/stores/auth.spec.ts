import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { setActivePinia, createPinia } from "pinia";
import { useAuthStore } from "@/stores/auth";

vi.mock("@/api/http", () => ({
  default: {
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

const mockUser = { id: 1, email: "user@example.com" };
const mockToken = "jwt.token.here";

describe("useAuthStore", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    localStorage.clear();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("login", () => {
    it("sets token, user and persists to localStorage on success", async () => {
      vi.mocked(http.post).mockResolvedValueOnce({
        data: { token: mockToken, user: mockUser },
      });

      const auth = useAuthStore();
      await auth.login("user@example.com", "password123");

      expect(auth.token).toBe(mockToken);
      expect(auth.user).toEqual(mockUser);
      expect(auth.isAuthenticated).toBe(true);
      expect(localStorage.getItem("auth_token")).toBe(mockToken);
    });

    it("propagates error on invalid credentials", async () => {
      vi.mocked(http.post).mockRejectedValueOnce({
        response: { status: 401 },
      });

      const auth = useAuthStore();
      await expect(auth.login("wrong@example.com", "wrongpass")).rejects.toMatchObject({
        response: { status: 401 },
      });

      expect(auth.token).toBeNull();
      expect(auth.isAuthenticated).toBe(false);
    });
  });

  describe("register", () => {
    it("propagates validation errors from API", async () => {
      vi.mocked(http.post).mockRejectedValueOnce({
        response: { status: 422, data: { errors: ["Email has already been taken"] } },
      });

      const auth = useAuthStore();
      await expect(
        auth.register("taken@example.com", "password123", "password123"),
      ).rejects.toMatchObject({
        response: { status: 422 },
      });
    });
  });

  describe("logout", () => {
    it("clears session even if API call fails", async () => {
      vi.mocked(http.post).mockResolvedValueOnce({
        data: { token: mockToken, user: mockUser },
      });
      vi.mocked(http.delete).mockRejectedValueOnce(new Error("Network error"));

      const auth = useAuthStore();
      await auth.login("user@example.com", "password123");
      await auth.logout();

      expect(auth.token).toBeNull();
      expect(auth.isAuthenticated).toBe(false);
      expect(localStorage.getItem("auth_token")).toBeNull();
    });
  });

  describe("session persistence", () => {
    it("reads token and isAuthenticated from localStorage on store init", () => {
      localStorage.setItem("auth_token", mockToken);

      const auth = useAuthStore();

      expect(auth.token).toBe(mockToken);
      expect(auth.isAuthenticated).toBe(true);
    });

    it("returns null user when auth_user in localStorage is corrupted JSON", () => {
      localStorage.setItem("auth_user", "not-valid-json");

      const auth = useAuthStore();

      expect(auth.user).toBeNull();
    });
  });
});
