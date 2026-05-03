import { ref } from "vue";
import { useI18n } from "vue-i18n";

export function useAuthValidation() {
  const { t } = useI18n();

  const emailError = ref("");
  const passwordError = ref("");
  const passwordConfirmationError = ref("");

  function validateEmail(value: string): boolean {
    if (!value) {
      emailError.value = t("auth.errors.emailRequired");
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      emailError.value = t("auth.errors.emailInvalid");
      return false;
    }
    emailError.value = "";
    return true;
  }

  function validatePassword(value: string): boolean {
    if (!value) {
      passwordError.value = t("auth.errors.passwordRequired");
      return false;
    }
    if (value.length < 8) {
      passwordError.value = t("auth.errors.passwordMin");
      return false;
    }
    passwordError.value = "";
    return true;
  }

  function validatePasswordConfirmation(password: string, confirmation: string): boolean {
    if (password !== confirmation) {
      passwordConfirmationError.value = t("auth.errors.passwordConfirmationMismatch");
      return false;
    }
    passwordConfirmationError.value = "";
    return true;
  }

  return {
    emailError,
    passwordError,
    passwordConfirmationError,
    validateEmail,
    validatePassword,
    validatePasswordConfirmation,
  };
}
