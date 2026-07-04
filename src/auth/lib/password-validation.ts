export type PasswordValidationResult = { ok: true } | { ok: false; message: string };

export function validatePasswordLength(password: string, min = 8): PasswordValidationResult {
  if (password.length < min) {
    return { ok: false, message: `Use at least ${min} characters.` };
  }
  return { ok: true };
}

export function validatePasswordsMatch(password: string, confirmPassword: string): PasswordValidationResult {
  if (password !== confirmPassword) {
    return { ok: false, message: "Passwords do not match." };
  }
  return { ok: true };
}

export function validatePasswordChangeInput({
  currentPassword,
  newPassword,
  confirmPassword,
  minLength = 8,
}: {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
  minLength?: number;
}): PasswordValidationResult {
  if (!currentPassword.trim()) {
    return { ok: false, message: "Enter your current password." };
  }

  const lengthResult = validatePasswordLength(newPassword, minLength);
  if (!lengthResult.ok) return lengthResult;

  const matchResult = validatePasswordsMatch(newPassword, confirmPassword);
  if (!matchResult.ok) return matchResult;

  if (currentPassword === newPassword) {
    return { ok: false, message: "New password must be different from your current password." };
  }

  return { ok: true };
}

export function validatePasswordSetupInput({
  newPassword,
  confirmPassword,
  minLength = 8,
}: {
  newPassword: string;
  confirmPassword: string;
  minLength?: number;
}): PasswordValidationResult {
  const lengthResult = validatePasswordLength(newPassword, minLength);
  if (!lengthResult.ok) return lengthResult;

  return validatePasswordsMatch(newPassword, confirmPassword);
}
