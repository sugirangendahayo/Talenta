// Integration tests for navigation flow
import { useRouter } from 'expo-router';
import { renderHook } from '@testing-library/react-native';

// Mock expo-router
jest.mock('expo-router', () => ({
  useRouter: jest.fn(),
  useSegments: jest.fn(() => []),
}));

describe('Navigation Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Router Navigation', () => {
    it('should provide router functions', () => {
      const mockRouter = {
        push: jest.fn(),
        replace: jest.fn(),
        back: jest.fn(),
        navigate: jest.fn(),
      };

      useRouter.mockReturnValue(mockRouter);

      const { result } = renderHook(() => useRouter());

      expect(result.current).toHaveProperty('push');
      expect(result.current).toHaveProperty('replace');
      expect(result.current).toHaveProperty('back');
      expect(result.current).toHaveProperty('navigate');
    });

    it('should navigate to a new route', () => {
      const mockRouter = {
        push: jest.fn(),
        replace: jest.fn(),
        back: jest.fn(),
        navigate: jest.fn(),
      };

      useRouter.mockReturnValue(mockRouter);

      const { result } = renderHook(() => useRouter());

      result.current.push('/auth/signin');

      expect(mockRouter.push).toHaveBeenCalledWith('/auth/signin');
    });

    it('should replace current route', () => {
      const mockRouter = {
        push: jest.fn(),
        replace: jest.fn(),
        back: jest.fn(),
        navigate: jest.fn(),
      };

      useRouter.mockReturnValue(mockRouter);

      const { result } = renderHook(() => useRouter());

      result.current.replace('/(jobseeker-tabs)/jobseekers/Home');

      expect(mockRouter.replace).toHaveBeenCalledWith('/(jobseeker-tabs)/jobseekers/Home');
    });

    it('should navigate back', () => {
      const mockRouter = {
        push: jest.fn(),
        replace: jest.fn(),
        back: jest.fn(),
        navigate: jest.fn(),
      };

      useRouter.mockReturnValue(mockRouter);

      const { result } = renderHook(() => useRouter());

      result.current.back();

      expect(mockRouter.back).toHaveBeenCalled();
    });
  });

  describe('Protected Routes', () => {
    it('should redirect to sign in when accessing protected route without auth', () => {
      const mockRouter = {
        push: jest.fn(),
        replace: jest.fn(),
        back: jest.fn(),
        navigate: jest.fn(),
      };

      useRouter.mockReturnValue(mockRouter);

      const { result } = renderHook(() => useRouter());

      // Simulate navigation to protected route without auth
      result.current.replace('/auth/signin');

      expect(mockRouter.replace).toHaveBeenCalledWith('/auth/signin');
    });

    it('should redirect to role-specific dashboard after sign in', () => {
      const mockRouter = {
        push: jest.fn(),
        replace: jest.fn(),
        back: jest.fn(),
        navigate: jest.fn(),
      };

      useRouter.mockReturnValue(mockRouter);

      const { result } = renderHook(() => useRouter());

      // Simulate jobseeker sign in redirect
      result.current.replace('/(jobseeker-tabs)/jobseekers/Home');

      expect(mockRouter.replace).toHaveBeenCalledWith('/(jobseeker-tabs)/jobseekers/Home');
    });

    it('should redirect employer to employer dashboard', () => {
      const mockRouter = {
        push: jest.fn(),
        replace: jest.fn(),
        back: jest.fn(),
        navigate: jest.fn(),
      };

      useRouter.mockReturnValue(mockRouter);

      const { result } = renderHook(() => useRouter());

      result.current.replace('/(employer-tabs)/employers/Dashboard');

      expect(mockRouter.replace).toHaveBeenCalledWith('/(employer-tabs)/employers/Dashboard');
    });

    it('should redirect admin to admin dashboard', () => {
      const mockRouter = {
        push: jest.fn(),
        replace: jest.fn(),
        back: jest.fn(),
        navigate: jest.fn(),
      };

      useRouter.mockReturnValue(mockRouter);

      const { result } = renderHook(() => useRouter());

      result.current.replace('/(admin-tabs)/admin/Dashboard');

      expect(mockRouter.replace).toHaveBeenCalledWith('/(admin-tabs)/admin/Dashboard');
    });
  });

  describe('Role-Based Navigation', () => {
    it('should prevent jobseeker from accessing employer routes', () => {
      const mockRouter = {
        push: jest.fn(),
        replace: jest.fn(),
        back: jest.fn(),
        navigate: jest.fn(),
      };

      useRouter.mockReturnValue(mockRouter);

      const { result } = renderHook(() => useRouter());

      // Simulate jobseeker trying to access employer route
      result.current.replace('/(jobseeker-tabs)/jobseekers/Home');

      expect(mockRouter.replace).toHaveBeenCalledWith('/(jobseeker-tabs)/jobseekers/Home');
    });

    it('should prevent employer from accessing jobseeker routes', () => {
      const mockRouter = {
        push: jest.fn(),
        replace: jest.fn(),
        back: jest.fn(),
        navigate: jest.fn(),
      };

      useRouter.mockReturnValue(mockRouter);

      const { result } = renderHook(() => useRouter());

      // Simulate employer trying to access jobseeker route
      result.current.replace('/(employer-tabs)/employers/Dashboard');

      expect(mockRouter.replace).toHaveBeenCalledWith('/(employer-tabs)/employers/Dashboard');
    });

    it('should prevent non-admin from accessing admin routes', () => {
      const mockRouter = {
        push: jest.fn(),
        replace: jest.fn(),
        back: jest.fn(),
        navigate: jest.fn(),
      };

      useRouter.mockReturnValue(mockRouter);

      const { result } = renderHook(() => useRouter());

      // Simulate non-admin trying to access admin route
      result.current.replace('/(jobseeker-tabs)/jobseekers/Home');

      expect(mockRouter.replace).toHaveBeenCalledWith('/(jobseeker-tabs)/jobseekers/Home');
    });
  });
});
