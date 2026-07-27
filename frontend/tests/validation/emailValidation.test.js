// Validation tests for email format
import { validateEmail } from '@/utils/validation';

describe('Email Validation', () => {
  describe('validateEmail', () => {
    it('should accept valid email addresses', () => {
      const validEmails = [
        'test@example.com',
        'user.name@example.com',
        'user+tag@example.com',
        'user123@example.co.uk',
        'user_name@example-domain.com',
      ];

      validEmails.forEach(email => {
        const result = validateEmail(email);
        expect(result.valid).toBe(true);
      });
    });

    it('should reject invalid email addresses', () => {
      const invalidEmails = [
        'invalid',
        'invalid@',
        '@example.com',
        'invalid@',
        'invalid@.com',
        'invalid@com',
        'invalid @example.com',
        'invalid@example',
      ];

      invalidEmails.forEach(email => {
        const result = validateEmail(email);
        expect(result.valid).toBe(false);
        expect(result.message).toBe('validation.invalidEmail');
      });
    });

    it('should reject empty email', () => {
      const result = validateEmail('');
      expect(result.valid).toBe(false);
      expect(result.message).toBe('validation.fillAllFields');
    });

    it('should reject whitespace-only email', () => {
      const result = validateEmail('   ');
      expect(result.valid).toBe(false);
      expect(result.message).toBe('validation.fillAllFields');
    });

    it('should reject email with spaces', () => {
      const result = validateEmail('test @example.com');
      expect(result.valid).toBe(false);
    });

    it('should trim email before validation', () => {
      const result = validateEmail('  test@example.com  ');
      expect(result.valid).toBe(true);
    });
  });
});
