// Validation utility functions

export interface ValidationResult {
  valid: boolean;
  message: string;
}

export function validateEmail(email: string): ValidationResult {
  const trimmedEmail = email.trim();
  
  if (!trimmedEmail) {
    return { valid: false, message: 'validation.fillAllFields' };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(trimmedEmail)) {
    return { valid: false, message: 'validation.invalidEmail' };
  }

  return { valid: true, message: '' };
}

export function validatePassword(password: string): ValidationResult {
  if (password.length < 8) {
    return { valid: false, message: 'validation.passwordTooShort' };
  }

  if (!/[A-Z]/.test(password)) {
    return { valid: false, message: 'validation.passwordUppercase' };
  }

  if (!/[a-z]/.test(password)) {
    return { valid: false, message: 'validation.passwordLowercase' };
  }

  if (!/[0-9]/.test(password)) {
    return { valid: false, message: 'validation.passwordNumber' };
  }

  if (!/[!@#$%^&*]/.test(password)) {
    return { valid: false, message: 'validation.passwordSpecial' };
  }

  return { valid: true, message: '' };
}

export function validateUsername(username: string): ValidationResult {
  if (!username.trim()) {
    return { valid: false, message: 'validation.usernameRequired' };
  }

  if (username.length < 3) {
    return { valid: false, message: 'validation.usernameTooShort' };
  }

  if (username.length > 30) {
    return { valid: false, message: 'validation.usernameTooLong' };
  }

  const usernameRegex = /^[a-z0-9._]+$/;
  if (!usernameRegex.test(username)) {
    return { valid: false, message: 'validation.usernameInvalid' };
  }

  if (username.startsWith('.') || username.endsWith('.')) {
    return { valid: false, message: 'validation.usernameInvalid' };
  }

  if (username.includes('..')) {
    return { valid: false, message: 'validation.usernameInvalid' };
  }

  return { valid: true, message: '' };
}
