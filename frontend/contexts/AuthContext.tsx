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
import { withTimeout } from "@/utils/withTimeout";

// Safety cap for the auth bootstrap network calls (getSession, role/profile
// lookups). Without this, a stalled connection right as the app launches or
// resumes from background can leave `loading` stuck at `true` forever,
// which shows as the app being stuck on the splash screen until force-closed
// and reopened.
const AUTH_TIMEOUT_MS = 12000;

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

  // Self-heal a missing role-specific profile row.
  //
  // The row is normally created server-side by the `handle_new_user_role_profile`
  // trigger the moment `auth.users` gets a new row, using the signup metadata
  // passed via `options.data`. This is a defense-in-depth fallback for the
  // rare case that insert didn't happen (e.g. migration not yet deployed, or
  // an unexpected trigger failure) — it runs with a real authenticated
  // session, so RLS (`auth.uid() = id`) is satisfied naturally.
  const selfHealRoleProfile = useCallback(
    async (
      authUser: User,
      userRole: Role,
    ): Promise<JobseekerProfile | EmployerProfile | null> => {
      const meta = authUser.user_metadata || {};

      try {
        if (userRole === "jobseeker" && meta.username) {
          const { data, error } = await supabase
            .from("jobseeker_profiles")
            .insert({
              id: authUser.id,
              full_name: meta.full_name || "",
              username: meta.username,
              email: authUser.email || "",
              profile_completed: false,
            })
            .select()
            .single();

          if (!error) return data;
          if (error.code !== "23505") throw error; // ignore "already exists" races
        } else if (userRole === "employer" && meta.company_username) {
          const { data, error } = await supabase
            .from("employer_profiles")
            .insert({
              id: authUser.id,
              company_name: meta.company_name || "",
              company_username: meta.company_username,
              email: authUser.email || "",
              company_website: meta.website || null,
              profile_completed: false,
              is_verified: false,
            })
            .select()
            .single();

          if (!error) return data;
          if (error.code !== "23505") throw error;
        } else {
          // No signup metadata to self-heal from (e.g. a Google OAuth user who
          // hasn't finished "complete-oauth-profile" yet) — nothing to do here.
          return null;
        }
      } catch (error) {
        console.error("Error self-healing role profile:", error);
        return null;
      }

      // Row already existed (created concurrently) — fetch it.
      const table = userRole === "jobseeker" ? "jobseeker_profiles" : "employer_profiles";
      const { data } = await supabase.from(table).select("*").eq("id", authUser.id).single();
      return data ?? null;
    },
    [],
  );

  // Fetch user profile based on role (memoized)
  const fetchProfile = useCallback(
    async (authUser: User, userRole: Role): Promise<void> => {
      // Prevent duplicate fetches
      if (fetchingProfile.current) {
        return;
      }

      fetchingProfile.current = true;
      const userId = authUser.id;

      try {
        if (userRole === "jobseeker") {
          const { data, error } = await supabase
            .from("jobseeker_profiles")
            .select("*")
            .eq("id", userId)
            .single();

          if (error) {
            // Profile might not exist yet — try to self-heal before giving up.
            if (error.code === "PGRST116") {
              console.log("Jobseeker profile not found - attempting self-heal");
              const healed = await selfHealRoleProfile(authUser, userRole);
              if (isMounted.current) setProfile(healed);
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
              console.log("Employer profile not found - attempting self-heal");
              const healed = await selfHealRoleProfile(authUser, userRole);
              if (isMounted.current) setProfile(healed);
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
    [selfHealRoleProfile],
  );

  // Refresh profile data (exposed to components).
  // We reset the mutex first so an in-flight background fetch never blocks
  // an explicit refresh triggered by the user (e.g. after image upload).
  const refreshProfile = useCallback(async () => {
    if (user && role) {
      fetchingProfile.current = false; // allow the fetch to proceed
      await fetchProfile(user, role);
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
        } = await withTimeout(
          supabase.auth.getSession(),
          AUTH_TIMEOUT_MS,
          "getSession()",
        );

        if (!isMounted.current) return;

        setSession(initialSession);
        setUser(initialSession?.user ?? null);

        if (initialSession?.user) {
          // Fetch role from profiles table
          const { data: profileData, error } = await withTimeout(
            supabase
              .from("profiles")
              .select("role")
              .eq("id", initialSession.user.id)
              .single(),
            AUTH_TIMEOUT_MS,
            "profile role lookup",
          );

          if (!isMounted.current) return;

          if (!error && profileData) {
            const userRole = profileData.role as Role;
            setRole(userRole);
            await withTimeout(
              fetchProfile(initialSession.user, userRole),
              AUTH_TIMEOUT_MS,
              "fetchProfile",
            );
            // Apply this user's saved language preference (local-only, no network)
            await applyUserLanguage(initialSession.user.id);
          }
        }
      } catch (error) {
        // Includes timeouts from withTimeout() above — we don't want a stalled
        // network call to leave the splash screen up forever, so we log and
        // fall through to releasing `loading` in the finally block below.
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

      try {
        if (newSession?.user) {
          // Fetch role and profile — guarded with a timeout so a stalled
          // connection (e.g. right after a TOKEN_REFRESHED on app resume)
          // can't leave `loading` stuck at `true` forever.
          const { data: profileData, error } = await withTimeout(
            supabase
              .from("profiles")
              .select("role")
              .eq("id", newSession.user.id)
              .single(),
            AUTH_TIMEOUT_MS,
            "profile role lookup",
          );

          if (!isMounted.current) return;

          if (!error && profileData) {
            const userRole = profileData.role as Role;
            setRole(userRole);
            await withTimeout(
              fetchProfile(newSession.user, userRole),
              AUTH_TIMEOUT_MS,
              "fetchProfile",
            );
            // Apply this user's saved language preference (local-only, no network)
            await applyUserLanguage(newSession.user.id);
          }
        } else {
          setRole(null);
          setProfile(null);
        }
      } catch (error) {
        console.error("Error handling auth state change:", error);
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
