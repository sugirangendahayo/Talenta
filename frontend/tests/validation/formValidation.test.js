// Validation tests for signup and signin forms
import { validateEmail, validatePassword, validateUsername } from '@/utils/validation';

describe('Form Validation', () => {
  describe('Sign In Form Validation', () => {
    it('should validate complete signin form', () => {
      const emailResult = validateEmail('test@example.com');
      const passwordResult = validatePassword('ValidPass123!');
      
      expect(emailResult.valid).toBe(true);
      expect(passwordResult.valid).toBe(true);
    });

    it('should reject empty email', () => {
      const result = validateEmail('');
      expect(result.valid).toBe(false);
      expect(result.message).toBe('validation.fillAllFields');
    });

    it('should reject empty password', () => {
      const result = validatePassword('');
      expect(result.valid).toBe(false);
      expect(result.message).toBe('validation.passwordTooShort');
    });

    it('should reject invalid email format', () => {
      const result = validateEmail('invalid-email');
      expect(result.valid).toBe(false);
      expect(result.message).toBe('validation.invalidEmail');
    });

    it('should trim whitespace from fields', () => {
      const result = validateEmail('  test@example.com  ');
      expect(result.valid).toBe(true);
    });
  });

  describe('Sign Up Form Validation - Jobseeker', () => {
    it('should validate complete jobseeker signup form', () => {
      const usernameResult = validateUsername('johndoe');
      const emailResult = validateEmail('test@example.com');
      const passwordResult = validatePassword('ValidPass123!');
      
      expect(usernameResult.valid).toBe(true);
      expect(emailResult.valid).toBe(true);
      expect(passwordResult.valid).toBe(true);
    });

    it('should reject empty username for jobseeker', () => {
      const result = validateUsername('');
      expect(result.valid).toBe(false);
      expect(result.message).toBe('validation.usernameRequired');
    });

    it('should reject invalid username format', () => {
      const result = validateUsername('john@doe');
      expect(result.valid).toBe(false);
      expect(result.message).toBe('validation.usernameInvalid');
    });

    it('should reject username shorter than 3 characters', () => {
      const result = validateUsername('ab');
      expect(result.valid).toBe(false);
      expect(result.message).toBe('validation.usernameTooShort');
    });

    it('should reject username longer than 30 characters', () => {
      const result = validateUsername('a'.repeat(31));
      expect(result.valid).toBe(false);
      expect(result.message).toBe('validation.usernameTooLong');
    });
  });

  describe('Sign Up Form Validation - Employer', () => {
    it('should validate complete employer signup form', () => {
      const usernameResult = validateUsername('techcompany');
      const emailResult = validateEmail('employer@example.com');
      const passwordResult = validatePassword('ValidPass123!');
      
      expect(usernameResult.valid).toBe(true);
      expect(emailResult.valid).toBe(true);
      expect(passwordResult.valid).toBe(true);
    });

    it('should reject empty company username', () => {
      const result = validateUsername('');
      expect(result.valid).toBe(false);
      expect(result.message).toBe('validation.usernameRequired');
    });

    it('should allow optional website field', () => {
      const emailResult = validateEmail('employer@example.com');
      const passwordResult = validatePassword('ValidPass123!');
      
      expect(emailResult.valid).toBe(true);
      expect(passwordResult.valid).toBe(true);
    });
  });

  describe('Password Requirements', () => {
    it('should enforce minimum length of 8 characters', () => {
      const result = validatePassword('Short1!');
      expect(result.valid).toBe(false);
    });

    it('should require at least one uppercase letter', () => {
      const result = validatePassword('lowercase123!');
      expect(result.valid).toBe(false);
    });

    it('should require at least one lowercase letter', () => {
      const result = validatePassword('UPPERCASE123!');
      expect(result.valid).toBe(false);
    });

    it('should require at least one number', () => {
      const result = validatePassword('NoNumbers!');
      expect(result.valid).toBe(false);
    });

    it('should require at least one special character', () => {
      const result = validatePassword('NoSpecial123');
      expect(result.valid).toBe(false);
    });

    it('should accept password meeting all requirements', () => {
      const result = validatePassword('ValidPass123!');
      expect(result.valid).toBe(true);
    });
  });
});
