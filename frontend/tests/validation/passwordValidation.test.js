// Validation tests for password requirements
import { validatePassword } from '@/utils/validation';

describe('Password Validation', () => {
  describe('validatePassword', () => {
    it('should validate a strong password', () => {
      const result = validatePassword('StrongPass123!');
      expect(result.valid).toBe(true);
      expect(result.message).toBe('');
    });

    it('should reject passwords shorter than 8 characters', () => {
      const result = validatePassword('Short1!');
      expect(result.valid).toBe(false);
      expect(result.message).toBe('validation.passwordTooShort');
    });

    it('should reject passwords without uppercase letters', () => {
      const result = validatePassword('lowercase123!');
      expect(result.valid).toBe(false);
      expect(result.message).toBe('validation.passwordUppercase');
    });

    it('should reject passwords without lowercase letters', () => {
      const result = validatePassword('UPPERCASE123!');
      expect(result.valid).toBe(false);
      expect(result.message).toBe('validation.passwordLowercase');
    });

    it('should reject passwords without numbers', () => {
      const result = validatePassword('NoNumbers!');
      expect(result.valid).toBe(false);
      expect(result.message).toBe('validation.passwordNumber');
    });

    it('should reject passwords without special characters', () => {
      const result = validatePassword('NoSpecial123');
      expect(result.valid).toBe(false);
      expect(result.message).toBe('validation.passwordSpecial');
    });

    it('should accept password with all required characters', () => {
      const result = validatePassword('ValidPass123!');
      expect(result.valid).toBe(true);
    });

    it('should handle empty password', () => {
      const result = validatePassword('');
      expect(result.valid).toBe(false);
      expect(result.message).toBe('validation.passwordTooShort');
    });

    it('should accept password with special characters from allowed set', () => {
      const specials = ['!', '@', '#', '$', '%', '^', '&', '*'];
      specials.forEach(char => {
        const result = validatePassword(`TestPass123${char}`);
        expect(result.valid).toBe(true);
      });
    });

    it('should handle exactly 8 characters', () => {
      const result = validatePassword('Test123!');
      expect(result.valid).toBe(true);
    });

    it('should handle very long passwords', () => {
      const result = validatePassword('VeryLongPassword123!ThatIsSecure');
      expect(result.valid).toBe(true);
    });
  });
});
