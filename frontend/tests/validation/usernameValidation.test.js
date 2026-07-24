// Validation tests for username format and availability
import {
  validateUsernameFormat,
  checkUsernameAvailability,
} from '@/utils/username';

// Mock Supabase
jest.mock('@/lib/supabase', () => ({
  supabase: {
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        ilike: jest.fn(() => ({
          limit: jest.fn(() => ({
            neq: jest.fn(() => ({
              then: jest.fn(callback => callback({ data: [], error: null })),
            })),
            then: jest.fn(callback => callback({ data: [], error: null })),
          })),
        })),
      })),
    })),
  },
}));

describe('Username Validation', () => {
  describe('validateUsernameFormat', () => {
    it('should accept valid usernames', () => {
      const validUsernames = [
        'john',
        'john_doe',
        'john.doe',
        'john123',
        'john_doe123',
        'j.doe',
        'j_doe123',
      ];

      validUsernames.forEach(username => {
        expect(validateUsernameFormat(username)).toBeNull();
      });
    });

    it('should reject usernames with invalid characters', () => {
      const invalidUsernames = [
        'john@doe',
        'john-doe',
        'john doe',
        'JOHN',
        'JohnDoe',
        'john#doe',
        'john$doe',
      ];

      invalidUsernames.forEach(username => {
        expect(validateUsernameFormat(username)).not.toBeNull();
      });
    });

    it('should reject usernames shorter than 3 characters', () => {
      expect(validateUsernameFormat('ab')).not.toBeNull();
      expect(validateUsernameFormat('a')).not.toBeNull();
      expect(validateUsernameFormat('')).not.toBeNull();
    });

    it('should reject usernames longer than 30 characters', () => {
      const longUsername = 'a'.repeat(31);
      expect(validateUsernameFormat(longUsername)).not.toBeNull();
    });

    it('should reject usernames starting with dot', () => {
      expect(validateUsernameFormat('.john')).not.toBeNull();
    });

    it('should reject usernames ending with dot', () => {
      expect(validateUsernameFormat('john.')).not.toBeNull();
    });

    it('should reject usernames with consecutive dots', () => {
      expect(validateUsernameFormat('john..doe')).not.toBeNull();
    });
  });

  describe('checkUsernameAvailability', () => {
    it('should return true for available username', async () => {
      const result = await checkUsernameAvailability('john', 'jobseeker_profiles', 'username');
      expect(result).toBe(true);
    });

    it('should return false for invalid username format', async () => {
      const result = await checkUsernameAvailability('john@doe', 'jobseeker_profiles', 'username');
      expect(result).toBe(false);
    });

    it('should handle empty username', async () => {
      const result = await checkUsernameAvailability('', 'jobseeker_profiles', 'username');
      expect(result).toBe(false);
    });

    it('should handle network errors gracefully', async () => {
      // Mock a network error
      const { supabase } = require('@/lib/supabase');
      supabase.from.mockImplementationOnce(() => ({
        select: jest.fn(() => ({
          ilike: jest.fn(() => ({
            limit: jest.fn(() => ({
              then: jest.fn(callback => callback({ data: null, error: new Error('Network error') })),
            })),
          })),
        })),
      }));

      const result = await checkUsernameAvailability('john', 'jobseeker_profiles', 'username');
      expect(result).toBe(true); // Optimistically return true on network error
    });
  });
});
