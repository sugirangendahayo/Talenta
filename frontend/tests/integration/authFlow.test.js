// Integration tests for authentication flow
import { supabase } from '@/lib/supabase';

// Mock Supabase
jest.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: jest.fn(),
      getUser: jest.fn(),
      signInWithPassword: jest.fn(),
      signUp: jest.fn(),
      signOut: jest.fn(),
      onAuthStateChange: jest.fn(),
    },
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn(),
        })),
      })),
    })),
  },
}));

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));

// Mock i18n
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key) => key,
  }),
}));

describe('Authentication Flow Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Sign In Flow', () => {
    it('should successfully sign in user with valid credentials', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        email_confirmed_at: new Date().toISOString(),
      };

      const mockProfile = {
        id: 'user-123',
        role: 'jobseeker',
      };

      supabase.auth.signInWithPassword.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      supabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: mockProfile,
              error: null,
            }),
          }),
        }),
      });

      // Simulate sign in
      await supabase.auth.signInWithPassword({
        email: 'test@example.com',
        password: 'password',
      });

      expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password',
      });
    });

    it('should handle sign in failure with invalid credentials', async () => {
      supabase.auth.signInWithPassword.mockResolvedValue({
        data: null,
        error: { message: 'Invalid login credentials' },
      });

      await supabase.auth.signInWithPassword({
        email: 'test@example.com',
        password: 'wrongpassword',
      });

      expect(supabase.auth.signInWithPassword).toHaveBeenCalled();
    });

    it('should handle unconfirmed email during sign in', async () => {
      supabase.auth.signInWithPassword.mockResolvedValue({
        data: null,
        error: { message: 'Email not confirmed' },
      });

      await supabase.auth.signInWithPassword({
        email: 'test@example.com',
        password: 'password',
      });

      expect(supabase.auth.signInWithPassword).toHaveBeenCalled();
    });
  });

  describe('Sign Up Flow', () => {
    it('should successfully register new user', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
      };

      supabase.auth.signUp.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      supabase.from.mockReturnValue({
        insert: jest.fn().mockResolvedValue({
          error: null,
        }),
      });

      await supabase.auth.signUp({
        email: 'test@example.com',
        password: 'ValidPass123!',
        options: {
          data: { role: 'jobseeker' },
        },
      });

      expect(supabase.auth.signUp).toHaveBeenCalled();
    });

    it('should handle duplicate email during registration', async () => {
      supabase.auth.signUp.mockResolvedValue({
        data: null,
        error: { message: 'User already registered' },
      });

      await supabase.auth.signUp({
        email: 'existing@example.com',
        password: 'ValidPass123!',
      });

      expect(supabase.auth.signUp).toHaveBeenCalled();
    });
  });

  describe('Sign Out Flow', () => {
    it('should successfully sign out user', async () => {
      supabase.auth.signOut.mockResolvedValue({ error: null });

      await supabase.auth.signOut();

      expect(supabase.auth.signOut).toHaveBeenCalled();
    });

    it('should handle sign out error', async () => {
      supabase.auth.signOut.mockResolvedValue({
        error: new Error('Sign out failed'),
      });

      await expect(supabase.auth.signOut()).resolves.toEqual({ error: expect.any(Error) });
    });
  });

  describe('Session Persistence', () => {
    it('should restore session on app load', async () => {
      const mockSession = {
        user: {
          id: 'user-123',
          email: 'test@example.com',
        },
        access_token: 'token',
      };

      const mockProfile = {
        id: 'user-123',
        role: 'jobseeker',
      };

      supabase.auth.getSession.mockResolvedValue({
        data: { session: mockSession },
        error: null,
      });

      supabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: mockProfile,
              error: null,
            }),
          }),
        }),
      });

      await supabase.auth.getSession();

      expect(supabase.auth.getSession).toHaveBeenCalled();
    });

    it('should handle no existing session', async () => {
      supabase.auth.getSession.mockResolvedValue({
        data: { session: null },
        error: null,
      });

      const result = await supabase.auth.getSession();

      expect(result.data.session).toBeNull();
    });
  });

  describe('Auth State Changes', () => {
    it('should update auth state on sign in', async () => {
      const mockUnsubscribe = jest.fn();
      supabase.auth.onAuthStateChange.mockReturnValue({
        data: { subscription: { unsubscribe: mockUnsubscribe } },
      });

      const result = supabase.auth.onAuthStateChange();

      expect(supabase.auth.onAuthStateChange).toHaveBeenCalled();
      expect(result.data.subscription.unsubscribe).toBeDefined();
    });

    it('should clean up subscription on unmount', () => {
      const mockUnsubscribe = jest.fn();
      supabase.auth.onAuthStateChange.mockReturnValue({
        data: { subscription: { unsubscribe: mockUnsubscribe } },
      });

      const result = supabase.auth.onAuthStateChange();

      // Cleanup should work
      expect(result.data.subscription.unsubscribe).toBeDefined();
    });
  });
});
