// Unit tests for username utility functions
import {
  validateUsernameFormat,
  generateBaseUsername,
  generateUsernameSuggestions,
} from '@/utils/username';

describe('Username Utility Functions', () => {
  describe('validateUsernameFormat', () => {
    it('should return null for valid usernames', () => {
      expect(validateUsernameFormat('john')).toBeNull();
      expect(validateUsernameFormat('john_doe')).toBeNull();
      expect(validateUsernameFormat('john.doe')).toBeNull();
      expect(validateUsernameFormat('john123')).toBeNull();
      expect(validateUsernameFormat('john_doe123')).toBeNull();
    });

    it('should reject usernames shorter than 3 characters', () => {
      expect(validateUsernameFormat('ab')).toBe('Username must be at least 3 characters');
      expect(validateUsernameFormat('a')).toBe('Username must be at least 3 characters');
      expect(validateUsernameFormat('')).toBe('Username must be at least 3 characters');
    });

    it('should reject usernames longer than 30 characters', () => {
      const longUsername = 'a'.repeat(31);
      expect(validateUsernameFormat(longUsername)).toBe('Username must be at most 30 characters');
    });

    it('should reject usernames with invalid characters', () => {
      expect(validateUsernameFormat('john@doe')).toBe('Only lowercase letters, numbers, _ and . are allowed');
      expect(validateUsernameFormat('john-doe')).toBe('Only lowercase letters, numbers, _ and . are allowed');
      expect(validateUsernameFormat('john doe')).toBe('Only lowercase letters, numbers, _ and . are allowed');
      expect(validateUsernameFormat('JOHN')).toBe('Only lowercase letters, numbers, _ and . are allowed');
    });

    it('should reject usernames starting with a dot', () => {
      expect(validateUsernameFormat('.john')).toBe('Username cannot start or end with a dot');
    });

    it('should reject usernames ending with a dot', () => {
      expect(validateUsernameFormat('john.')).toBe('Username cannot start or end with a dot');
    });

    it('should reject usernames with consecutive dots', () => {
      expect(validateUsernameFormat('john..doe')).toBe('Username cannot have consecutive dots');
    });
  });

  describe('generateBaseUsername', () => {
    it('should generate lowercase username from full name', () => {
      expect(generateBaseUsername('John Doe')).toBe('johndoe');
      expect(generateBaseUsername('Jane Smith')).toBe('janesmith');
    });

    it('should handle accents and special characters', () => {
      expect(generateBaseUsername('João Silva')).toBe('joaosilva');
      expect(generateBaseUsername('François Müller')).toBe('francoismuller');
    });

    it('should remove spaces and special characters', () => {
      expect(generateBaseUsername('John O\'Connor')).toBe('johnoconnor');
      expect(generateBaseUsername('Mary-Ann Smith')).toBe('maryannsmith');
    });

    it('should handle multiple spaces', () => {
      expect(generateBaseUsername('John   Doe')).toBe('johndoe');
    });

    it('should truncate to max length', () => {
      const longName = 'a'.repeat(50);
      expect(generateBaseUsername(longName).length).toBe(30);
    });

    it('should handle empty input', () => {
      expect(generateBaseUsername('')).toBe('');
      expect(generateBaseUsername('   ')).toBe('');
    });
  });

  describe('generateUsernameSuggestions', () => {
    it('should generate base username as first suggestion', () => {
      const suggestions = generateUsernameSuggestions('John Doe');
      expect(suggestions[0]).toBe('johndoe');
    });

    it('should generate numbered variations', () => {
      const suggestions = generateUsernameSuggestions('John Doe', new Set(['johndoe']));
      expect(suggestions).toContain('johndoe1');
      expect(suggestions).toContain('johndoe2');
    });

    it('should generate name-based variations', () => {
      const suggestions = generateUsernameSuggestions('John Doe');
      expect(suggestions).toContain('johndoe');
      expect(suggestions.length).toBeGreaterThan(0);
    });

    it('should generate year suffix variation', () => {
      const suggestions = generateUsernameSuggestions('John Doe');
      expect(suggestions.length).toBeGreaterThan(0);
    });

    it('should exclude taken usernames', () => {
      const takenSet = new Set(['johndoe', 'johndoe1', 'john.d']);
      const suggestions = generateUsernameSuggestions('John Doe', takenSet);
      expect(suggestions).not.toContain('johndoe');
      expect(suggestions).not.toContain('johndoe1');
      expect(suggestions).not.toContain('john.d');
    });

    it('should return empty array for invalid input', () => {
      expect(generateUsernameSuggestions('')).toEqual([]);
      expect(generateUsernameSuggestions('   ')).toEqual([]);
    });

    it('should limit suggestions to 6', () => {
      const suggestions = generateUsernameSuggestions('John Doe');
      expect(suggestions.length).toBeLessThanOrEqual(6);
    });

    it('should handle single name input', () => {
      const suggestions = generateUsernameSuggestions('John');
      expect(suggestions[0]).toBe('john');
    });
  });
});
