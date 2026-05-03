import { ref, computed } from "vue";
import { defineStore } from "pinia";
import http from "@/api/http";

interface User {
  id: number;
  email: string;
}

interface AuthResponse {
  token: string;
  user: User;
}

function parseStoredUser(): User | null {
  try {
    return JSON.parse(localStorage.getItem("auth_user") ?? "null");
  } catch {
    return null;
  }
}

export const useAuthStore = defineStore("auth", () => {
  const token = ref<string | null>(localStorage.getItem("auth_token"));
  const user = ref<User | null>(parseStoredUser());

  const isAuthenticated = computed(() => token.value !== null);

  function setSession(data: AuthResponse) {
    token.value = data.token;
    user.value = data.user;
    localStorage.setItem("auth_token", data.token);
    localStorage.setItem("auth_user", JSON.stringify(data.user));
  }

  function clearSession() {
    token.value = null;
    user.value = null;
    localStorage.removeItem("auth_token");
    localStorage.removeItem("auth_user");
  }

  async function login(email: string, password: string): Promise<void> {
    const { data } = await http.post<AuthResponse>("/users/sign_in", {
      user: { email, password },
    });
    setSession(data);
  }

  async function register(
    email: string,
    password: string,
    passwordConfirmation: string,
  ): Promise<void> {
    const { data } = await http.post<AuthResponse>("/users", {
      user: { email, password, password_confirmation: passwordConfirmation },
    });
    setSession(data);
  }

  async function logout(): Promise<void> {
    try {
      await http.delete("/users/sign_out");
    } catch {
      // Sign out request failed — session still cleared locally
    } finally {
      clearSession();
    }
  }

  return { token, user, isAuthenticated, login, register, logout, clearSession };
});
