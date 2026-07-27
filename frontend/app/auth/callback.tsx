import { useEffect } from "react";
import { View, ActivityIndicator, Text, StyleSheet } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner-native";

/**
 * Handles the deep-link callback from Google OAuth.
 * Supabase redirects to talenta://auth/callback?code=xxxx after the user
 * completes the Google consent screen.
 *
 * We exchange that code for a real session here, then AuthContext's
 * onAuthStateChange takes over and _layout.tsx navigates to the right screen.
 */
export default function AuthCallback() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    code?: string;
    error?: string;
    error_description?: string;
  }>();

  useEffect(() => {
    const handleCallback = async () => {
      const { code, error } = params;

      if (error) {
        console.warn("OAuth callback error:", error, params.error_description);
        // Surface the specific reason to the user — e.g. the guard that blocks
        // linking a Google sign-in to a pre-existing email/password account
        // returns its message here via `error_description`.
        toast.error(
          params.error_description || "Google sign-in failed. Please try again.",
          { duration: 4000 },
        );
        router.replace("/auth/signin");
        return;
      }

      if (code) {
        try {
          const { error: exchangeError } =
            await supabase.auth.exchangeCodeForSession(code);
          if (exchangeError) {
            console.warn("Code exchange error:", exchangeError.message);
            router.replace("/auth/signin");
          }
          // On success, onAuthStateChange in AuthContext fires and
          // _layout.tsx navigates to the correct dashboard automatically.
        } catch (err: any) {
          console.warn("Unexpected callback error:", err?.message || err);
          router.replace("/auth/signin");
        }
      } else {
        // No code, nothing to do — send back to sign-in
        router.replace("/auth/signin");
      }
    };

    handleCallback();
  }, [params.code, params.error, params.error_description]);

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <ActivityIndicator size="large" color="#0E7490" />
        <Text style={styles.title}>Signing you in</Text>
        <Text style={styles.subtitle}>Please wait a moment…</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 24,
    paddingVertical: 48,
    paddingHorizontal: 40,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 8,
    width: "100%",
    maxWidth: 340,
  },
  title: {
    marginTop: 20,
    fontSize: 20,
    fontWeight: "700",
    color: "#0f172a",
    letterSpacing: -0.3,
  },
  subtitle: {
    marginTop: 6,
    fontSize: 14,
    color: "#64748b",
    letterSpacing: 0.1,
  },
});
