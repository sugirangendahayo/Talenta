import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
} from "react";
import {
  supabase,
  Role,
  JobseekerProfile,
  EmployerProfile,
} from "@/lib/supabase";
import { Session, User } from "@supabase/supabase-js";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { applyUserLanguage, resetToDeviceLanguage } from "@/i18n/config";

interface AuthContextType {
  session: Session | null;
  user: User | null;
  role: Role | null;
  profile: JobseekerProfile | EmployerProfile | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  // NEW: Add onboarding state
  hasSeenOnboarding: boolean | null;
  setHasSeenOnboarding: (value: boolean) => void;
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  role: null,
  profile: null,
  loading: true,
  signOut: async () => {},
  refreshProfile: async () => {},
  // NEW: Defaults for onboarding
  hasSeenOnboarding: null,
  setHasSeenOnboarding: () => {},
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<Role | null>(null);
  const [profile, setProfile] = useState<
    JobseekerProfile | EmployerProfile | null
  >(null);
  const [loading, setLoading] = useState(true);
  // NEW: State for onboarding
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState<boolean | null>(
    null,
  );

  // Use ref to prevent race conditions
  const isMounted = useRef(true);
  const fetchingProfile = useRef(false);

  // NEW: Load onboarding status on mount
  useEffect(() => {
    const loadOnboardingStatus = async () => {
      try {
        const value = await AsyncStorage.getItem("hasSeenOnboarding");
        setHasSeenOnboarding(value === "true");
      } catch (error) {
        console.error("Error loading onboarding status:", error);
        setHasSeenOnboarding(false); // Default to false on error
      }
    };
    loadOnboardingStatus();
  }, []);

  // Fetch user profile based on role (memoized)
  const fetchProfile = useCallback(
    async (userId: string, userRole: Role): Promise<void> => {
      // Prevent duplicate fetches
      if (fetchingProfile.current) {
        return;
      }

      fetchingProfile.current = true;

      try {
        if (userRole === "jobseeker") {
          const { data, error } = await supabase
            .from("jobseeker_profiles")
            .select("*")
            .eq("id", userId)
            .single();

          if (error) {
            // Profile might not exist for new users - this is OK
            if (error.code === "PGRST116") {
              console.log("Jobseeker profile not found - new user");
              if (isMounted.current) setProfile(null);
              return;
            }
            throw error;
          }

          if (isMounted.current) {
            setProfile(data);
          }
        } else if (userRole === "employer") {
          const { data, error } = await supabase
            .from("employer_profiles")
            .select("*")
            .eq("id", userId)
            .single();

          if (error) {
            if (error.code === "PGRST116") {
              console.log("Employer profile not found - new user");
              if (isMounted.current) setProfile(null);
              return;
            }
            throw error;
          }

          if (isMounted.current) {
            setProfile(data);
          }
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
        if (isMounted.current) {
          setProfile(null);
        }
      } finally {
        fetchingProfile.current = false;
      }
    },
    [],
  );

  // Refresh profile data (exposed to components).
  // We reset the mutex first so an in-flight background fetch never blocks
  // an explicit refresh triggered by the user (e.g. after image upload).
  const refreshProfile = useCallback(async () => {
    if (user && role) {
      fetchingProfile.current = false; // allow the fetch to proceed
      await fetchProfile(user.id, role);
    }
  }, [user, role, fetchProfile]);

  // Initialize auth state
  useEffect(() => {
    isMounted.current = true;

    const initAuth = async () => {
      try {
        // Get initial session
        const {
          data: { session: initialSession },
        } = await supabase.auth.getSession();

        if (!isMounted.current) return;

        setSession(initialSession);
        setUser(initialSession?.user ?? null);

        if (initialSession?.user) {
          // Fetch role from profiles table
          const { data: profileData, error } = await supabase
            .from("profiles")
            .select("role")
            .eq("id", initialSession.user.id)
            .single();

          if (!isMounted.current) return;

          if (!error && profileData) {
            const userRole = profileData.role as Role;
            setRole(userRole);
            await fetchProfile(initialSession.user.id, userRole);
            // Apply this user's saved language preference
            await applyUserLanguage(initialSession.user.id);
          }
        }
      } catch (error) {
        console.error("Error initializing auth:", error);
      } finally {
        if (isMounted.current) {
          setLoading(false);
        }
      }
    };

    
    initAuth();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      if (!isMounted.current) return;

      console.log("Auth state changed:", event);

      // When signing in, hold loading=true so _layout doesn't prematurely
      // redirect to complete-oauth-profile before the role has been fetched.
      if (event === "SIGNED_IN") {
        setLoading(true);
      }

      setSession(newSession);
      setUser(newSession?.user ?? null);

      if (newSession?.user) {
        // Fetch role and profile
        const { data: profileData, error } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", newSession.user.id)
          .single();

        if (!isMounted.current) return;

        if (!error && profileData) {
          const userRole = profileData.role as Role;
          setRole(userRole);
          await fetchProfile(newSession.user.id, userRole);
          // Apply this user's saved language preference
          await applyUserLanguage(newSession.user.id);
        }
      } else {
        setRole(null);
        setProfile(null);
      }

      if (isMounted.current) {
        setLoading(false);
      }
    });

    return () => {
      isMounted.current = false;
      subscription.unsubscribe();
    };
  }, [fetchProfile]);

  // Sign out function (memoized)
  const signOut = useCallback(async () => {
    try {
      await supabase.auth.signOut();
      setSession(null);
      setUser(null);
      setRole(null);
      setProfile(null);
      // Reset language to device/global default so it doesn't bleed into the next user's session
      await resetToDeviceLanguage();
    } catch (error) {
      console.error("Error signing out:", error);
      throw error;
    }
  }, []);

  const value = {
    session,
    user,
    role,
    profile,
    loading,
    signOut,
    refreshProfile,
    // NEW: Include in context value
    hasSeenOnboarding,
    setHasSeenOnboarding,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
