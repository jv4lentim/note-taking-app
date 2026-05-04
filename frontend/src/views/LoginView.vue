<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import axios from "axios";
import { useAuthStore } from "@/stores/auth";
import { useAuthValidation } from "@/composables/useAuthValidation";
import AuthLayout from "@/components/AuthLayout.vue";

const { t } = useI18n();
const router = useRouter();
const auth = useAuthStore();
const { emailError, passwordError, validateEmail, validatePassword } = useAuthValidation();

const email = ref("");
const password = ref("");
const errorMessage = ref("");
const isLoading = ref(false);

function validate(): boolean {
  const emailOk = validateEmail(email.value);
  const passwordOk = validatePassword(password.value);
  return emailOk && passwordOk;
}

async function handleSubmit() {
  errorMessage.value = "";
  if (!validate()) return;

  isLoading.value = true;
  try {
    await auth.login(email.value, password.value);
    router.push({ name: "home" });
  } catch (err) {
    if (axios.isAxiosError(err) && err.response?.status === 401) {
      errorMessage.value = t("auth.errors.invalidCredentials");
    } else {
      errorMessage.value = t("auth.errors.generic");
    }
  } finally {
    isLoading.value = false;
  }
}
</script>

<template>
  <AuthLayout :heading="t('auth.login')">
    <form class="flex flex-col gap-4" novalidate @submit.prevent="handleSubmit">
      <div class="grid grid-cols-[90px_1fr] items-start gap-2">
        <label class="text-base text-gray-700 pt-2" for="email">{{ t("auth.email") }}:</label>
        <div class="flex flex-col gap-1">
          <input
            id="email"
            v-model="email"
            class="w-full py-2 px-3 border border-gray-300 rounded text-base text-slate-800 bg-white placeholder:text-gray-400"
            :class="{ 'border-red-500': emailError }"
            type="email"
            maxlength="255"
            autocomplete="email"
            :placeholder="t('auth.emailPlaceholder')"
          />
          <span v-if="emailError" class="text-xs text-red-500">{{ emailError }}</span>
        </div>
      </div>

      <div class="grid grid-cols-[90px_1fr] items-start gap-2">
        <label class="text-base text-gray-700 pt-2" for="password">{{ t("auth.password") }}:</label>
        <div class="flex flex-col gap-1">
          <input
            id="password"
            v-model="password"
            class="w-full py-2 px-3 border border-gray-300 rounded text-base text-slate-800 bg-white placeholder:text-gray-400"
            :class="{ 'border-red-500': passwordError }"
            type="password"
            minlength="8"
            maxlength="128"
            autocomplete="current-password"
            :placeholder="t('auth.passwordPlaceholder')"
          />
          <span v-if="passwordError" class="text-xs text-red-500">{{ passwordError }}</span>
        </div>
      </div>

      <div class="flex justify-center mt-2">
        <button
          class="bg-primary text-white font-bold text-base py-2.5 px-10 border-0 rounded cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
          type="submit"
          :disabled="isLoading"
        >
          {{ isLoading ? t("auth.loading") : t("auth.login") }}
        </button>
      </div>

      <p v-if="errorMessage" class="text-center text-red-500 text-sm m-0">{{ errorMessage }}</p>
    </form>

    <p class="mt-6 text-sm text-gray-700">
      {{ t("auth.noAccount") }}
      <router-link class="text-primary no-underline" :to="{ name: 'register' }">{{ t("auth.register") }}</router-link>
    </p>
  </AuthLayout>
</template>
