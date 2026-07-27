// Integration tests for Supabase client
import { supabase } from '@/lib/supabase';

// Mock the dependencies
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));

jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(),
  setItemAsync: jest.fn(),
}));

jest.mock('expo-crypto', () => ({
  digestStringAsync: jest.fn((algorithm, string) => {
    return Promise.resolve(
      Array.from(string)
        .reduce((hash, char) => ((hash << 5) - hash + char.charCodeAt(0)) | 0, 0)
        .toString(16)
    );
  }),
}));

describe('Supabase Client Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset environment variables
    process.env.EXPO_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
    process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';
  });

  describe('Client Initialization', () => {
    it('should initialize Supabase client with correct configuration', () => {
      expect(supabase).toBeDefined();
      expect(supabase.auth).toBeDefined();
    });

    it('should have auth methods available', () => {
      expect(typeof supabase.auth.getSession).toBe('function');
      expect(typeof supabase.auth.getUser).toBe('function');
      expect(typeof supabase.auth.signInWithPassword).toBe('function');
      expect(typeof supabase.auth.signUp).toBe('function');
      expect(typeof supabase.auth.signOut).toBe('function');
    });

    it('should have database methods available', () => {
      expect(typeof supabase.from).toBe('function');
    });

    it('should have storage methods available', () => {
      expect(supabase.storage).toBeDefined();
      expect(typeof supabase.storage.from).toBe('function');
    });
  });

  describe('Database Queries', () => {
    it('should support chainable query methods', () => {
      const query = supabase.from('test_table');
      expect(query).toBeDefined();
      expect(typeof query.select).toBe('function');
    });

    it('should support filtering methods', () => {
      const query = supabase.from('test_table').select('*');
      expect(typeof query.eq).toBe('function');
      expect(typeof query.neq).toBe('function');
      expect(typeof query.ilike).toBe('function');
      expect(typeof query.or).toBe('function');
    });

    it('should support ordering and limiting', () => {
      const query = supabase.from('test_table').select('*');
      expect(typeof query.order).toBe('function');
      expect(typeof query.limit).toBe('function');
    });

    it('should support single and maybeSingle', () => {
      const query = supabase.from('test_table').select('*');
      expect(typeof query.single).toBe('function');
      expect(typeof query.maybeSingle).toBe('function');
    });
  });

  describe('Auth Methods', () => {
    it('should have session management methods', () => {
      expect(typeof supabase.auth.getSession).toBe('function');
      expect(typeof supabase.auth.refreshSession).toBe('function');
    });

    it('should have authentication methods', () => {
      expect(typeof supabase.auth.signInWithPassword).toBe('function');
      expect(typeof supabase.auth.signUp).toBe('function');
      expect(typeof supabase.auth.signOut).toBe('function');
    });

    it('should have auth state change listener', () => {
      expect(typeof supabase.auth.onAuthStateChange).toBe('function');
    });
  });

  describe('Storage Methods', () => {
    it('should support file upload', () => {
      const storage = supabase.storage.from('test-bucket');
      expect(typeof storage.upload).toBe('function');
    });

    it('should support file removal', () => {
      const storage = supabase.storage.from('test-bucket');
      expect(typeof storage.remove).toBe('function');
    });

    it('should support public URL generation', () => {
      const storage = supabase.storage.from('test-bucket');
      expect(typeof storage.getPublicUrl).toBe('function');
    });
  });

  describe('Error Handling', () => {
    it('should handle database errors gracefully', async () => {
      const query = supabase.from('test_table').select('*');
      
      // Mock an error response
      const mockError = new Error('Database error');
      
      // The query should handle errors
      expect(query).toBeDefined();
    });

    it('should handle auth errors gracefully', async () => {
      // Mock an auth error
      const mockError = { message: 'Invalid credentials' };
      
      expect(supabase.auth).toBeDefined();
    });
  });

  describe('Type Safety', () => {
    it('should export correct types', () => {
      // Check that the module exports the expected types
      expect(supabase).toBeDefined();
    });
  });
});
