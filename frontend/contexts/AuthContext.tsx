import React, { createContext, useContext, useEffect, useState } from "react";
import {
  supabase,
  Role,
  JobseekerProfile,
  EmployerProfile,
} from "@/lib/supabase";
import { Session, User } from "@supabase/supabase-js";

interface AuthContextType {
  session: Session | null;
  user: User | null;
  role: Role | null;
  profile: JobseekerProfile | EmployerProfile | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  role: null,
  profile: null,
  loading: true,
  signOut: async () => {},
  refreshProfile: async () => {},
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

  // Fetch user profile based on role
  const fetchProfile = async (userId: string, userRole: Role) => {
    try {
      if (userRole === "jobseeker") {
        const { data, error } = await supabase
          .from("jobseeker_profiles")
          .select("*")
          .eq("id", userId)
          .maybeSingle(); // Returns null if not found (no error)

        if (error) {
          console.error("Error fetching jobseeker profile:", error);
          return false;
        }

        if (data) {
          setProfile(data);
          return true;
        } else {
          console.warn("Jobseeker profile not found");
          return false;
        }
      } else if (userRole === "employer") {
        const { data, error } = await supabase
          .from("employer_profiles")
          .select("*")
          .eq("id", userId)
          .maybeSingle();

        if (error) {
          console.error("Error fetching employer profile:", error);
          return false;
        }

        if (data) {
          setProfile(data);
          return true;
        } else {
          console.warn("Employer profile not found");
          return false;
        }
      }
      return false;
    } catch (error) {
      console.error("Unexpected error fetching profile:", error);
      return false;
    }
  };

  // Refresh profile data (call this manually after signup/profile updates)
  const refreshProfile = async () => {
    if (user && role) {
      await fetchProfile(user.id, role);
    }
  };

  // Initialize auth state
  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        // Fetch role from profiles table
        const { data: profileData, error } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", session.user.id)
          .single();

        if (!error && profileData) {
          const userRole = profileData.role as Role;
          setRole(userRole);
          await fetchProfile(session.user.id, userRole);
        }
      }

      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth event:", event);

      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        // Fetch role and profile
        const { data: profileData, error } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", session.user.id)
          .single();

        if (!error && profileData) {
          const userRole = profileData.role as Role;
          setRole(userRole);
          await fetchProfile(session.user.id, userRole);
        }
      } else {
        setRole(null);
        setProfile(null);
      }

      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Sign out function
  const signOut = async () => {
    await supabase.auth.signOut();
    setSession(null);
    setUser(null);
    setRole(null);
    setProfile(null);
  };

  const value = {
    session,
    user,
    role,
    profile,
    loading,
    signOut,
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
