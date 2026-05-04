import { describe, it, expect, vi } from "vitest";

vi.mock("vue-i18n", () => ({
  useI18n: () => ({ t: (key: string) => key }),
}));

import { useAuthValidation } from "@/composables/useAuthValidation";

describe("useAuthValidation", () => {
  describe("validateEmail", () => {
    it("returns false and sets error key when email is empty", () => {
      const { emailError, validateEmail } = useAuthValidation();
      expect(validateEmail("")).toBe(false);
      expect(emailError.value).toBe("auth.errors.emailRequired");
    });

    it("returns false and sets error key for invalid email format", () => {
      const { emailError, validateEmail } = useAuthValidation();
      expect(validateEmail("not-an-email")).toBe(false);
      expect(emailError.value).toBe("auth.errors.emailInvalid");
    });

    it("returns false for email without domain extension", () => {
      const { emailError, validateEmail } = useAuthValidation();
      expect(validateEmail("user@nodot")).toBe(false);
      expect(emailError.value).toBe("auth.errors.emailInvalid");
    });

    it("returns true and clears error for a valid email", () => {
      const { emailError, validateEmail } = useAuthValidation();
      expect(validateEmail("user@example.com")).toBe(true);
      expect(emailError.value).toBe("");
    });
  });

  describe("validatePassword", () => {
    it("returns false and sets error key when password is empty", () => {
      const { passwordError, validatePassword } = useAuthValidation();
      expect(validatePassword("")).toBe(false);
      expect(passwordError.value).toBe("auth.errors.passwordRequired");
    });

    it("returns false when password is shorter than 8 characters", () => {
      const { passwordError, validatePassword } = useAuthValidation();
      expect(validatePassword("1234567")).toBe(false);
      expect(passwordError.value).toBe("auth.errors.passwordMin");
    });

    it("returns true for a password with exactly 8 characters", () => {
      const { passwordError, validatePassword } = useAuthValidation();
      expect(validatePassword("12345678")).toBe(true);
      expect(passwordError.value).toBe("");
    });
  });

  describe("validatePasswordConfirmation", () => {
    it("returns false and sets error key when passwords do not match", () => {
      const { passwordConfirmationError, validatePasswordConfirmation } = useAuthValidation();
      expect(validatePasswordConfirmation("password123", "different")).toBe(false);
      expect(passwordConfirmationError.value).toBe("auth.errors.passwordConfirmationMismatch");
    });

    it("returns true and clears error when passwords match", () => {
      const { passwordConfirmationError, validatePasswordConfirmation } = useAuthValidation();
      expect(validatePasswordConfirmation("password123", "password123")).toBe(true);
      expect(passwordConfirmationError.value).toBe("");
    });
  });
});
