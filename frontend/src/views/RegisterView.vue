<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import axios from "axios";
import { useAuthStore } from "@/stores/auth";
import { useAuthValidation } from "@/composables/useAuthValidation";
import AuthLayout from "@/components/AuthLayout.vue";
import "@/assets/auth-form.css";

const { t } = useI18n();
const router = useRouter();
const auth = useAuthStore();
const {
  emailError,
  passwordError,
  passwordConfirmationError,
  validateEmail,
  validatePassword,
  validatePasswordConfirmation,
} = useAuthValidation();

const email = ref("");
const password = ref("");
const passwordConfirmation = ref("");
const errorMessage = ref("");
const isLoading = ref(false);

function validate(): boolean {
  const emailOk = validateEmail(email.value);
  const passwordOk = validatePassword(password.value);
  const confirmOk = validatePasswordConfirmation(password.value, passwordConfirmation.value);
  return emailOk && passwordOk && confirmOk;
}

async function handleSubmit() {
  errorMessage.value = "";
  if (!validate()) return;

  isLoading.value = true;
  try {
    await auth.register(email.value, password.value, passwordConfirmation.value);
    router.push("/");
  } catch (err) {
    if (axios.isAxiosError(err)) {
      const messages = err.response?.data?.errors as string[] | undefined;
      errorMessage.value = messages?.join(", ") ?? t("auth.errors.generic");
    } else {
      errorMessage.value = t("auth.errors.generic");
    }
  } finally {
    isLoading.value = false;
  }
}
</script>

<template>
  <AuthLayout :heading="t('auth.register')">
    <form class="form" novalidate @submit.prevent="handleSubmit">
      <div class="field">
        <label class="label" for="email">{{ t("auth.email") }}:</label>
        <div class="input-wrap">
          <input
            id="email"
            v-model="email"
            class="input"
            :class="{ 'input--error': emailError }"
            type="email"
            maxlength="255"
            autocomplete="email"
            :placeholder="t('auth.emailPlaceholder')"
          />
          <span v-if="emailError" class="field-error">{{ emailError }}</span>
        </div>
      </div>

      <div class="field">
        <label class="label" for="password">{{ t("auth.password") }}:</label>
        <div class="input-wrap">
          <input
            id="password"
            v-model="password"
            class="input"
            :class="{ 'input--error': passwordError }"
            type="password"
            minlength="8"
            maxlength="128"
            autocomplete="new-password"
            :placeholder="t('auth.passwordPlaceholder')"
          />
          <span v-if="passwordError" class="field-error">{{ passwordError }}</span>
        </div>
      </div>

      <div class="field">
        <label class="label" for="password-confirmation">
          {{ t("auth.passwordConfirmation") }}:
        </label>
        <div class="input-wrap">
          <input
            id="password-confirmation"
            v-model="passwordConfirmation"
            class="input"
            :class="{ 'input--error': passwordConfirmationError }"
            type="password"
            minlength="8"
            maxlength="128"
            autocomplete="new-password"
            :placeholder="t('auth.passwordConfirmationPlaceholder')"
          />
          <span v-if="passwordConfirmationError" class="field-error">{{
            passwordConfirmationError
          }}</span>
        </div>
      </div>

      <div class="actions">
        <button class="btn-primary" type="submit" :disabled="isLoading">
          {{ isLoading ? t("auth.loading") : t("auth.register") }}
        </button>
      </div>

      <p v-if="errorMessage" class="form-error">{{ errorMessage }}</p>
    </form>

    <p class="alt-link">
      {{ t("auth.hasAccount") }}
      <router-link :to="{ name: 'login' }">{{ t("auth.login") }}</router-link>
    </p>
  </AuthLayout>
</template>
