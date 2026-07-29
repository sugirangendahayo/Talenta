import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { NotificationProvider } from "@/contexts/NotificationContext";
import { ThemeProvider, ThemeSync, useTheme } from "@/contexts/ThemeContext";
import "@/i18n/config"; // Import i18n configuration
import {
  Quicksand_400Regular,
  Quicksand_500Medium,
  Quicksand_600SemiBold,
  Quicksand_700Bold,
  useFonts,
} from "@expo-google-fonts/quicksand";
import { Stack, useRouter, useSegments } from "expo-router";
import { useEffect, useState } from "react";
import { Image, Text as RNText, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import "react-native-url-polyfill/auto";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { Toaster } from "sonner-native";
import "../global.css";

export const unstable_settings = { anchor: "(jobseeker-tabs)" };

function useAppBackground() {
  const { isDark } = useTheme();
  return isDark ? "#080A08" : "#ffffff";
}

// Navigation logic component
function RootLayoutNav() {
  const { user, role, loading: authLoading, hasSeenOnboarding } = useAuth();
  const { loadThemeForUser, resetTheme } = useTheme();
  const segments = useSegments();
  const router = useRouter();
  const [isReady, setIsReady] = useState(false);
  const APP_BACKGROUND = useAppBackground();

  // Set isReady when hasSeenOnboarding is loaded (not null)
  useEffect(() => {
    if (hasSeenOnboarding !== null) {
      setIsReady(true);
    }
  }, [hasSeenOnboarding]);

  const [authThemeReady, setAuthThemeReady] = useState(false);

  // Load the correct per-user theme when auth state resolves
  useEffect(() => {
    if (user && role) {
      setAuthThemeReady(false);
      loadThemeForUser(user.id, role).then(() => {
        setAuthThemeReady(true);
      });
    } else if (user && !role) {
      // New OAuth user needs to pick a role — no theme to load yet
      setAuthThemeReady(true);
    } else if (!user && isReady) {
      // Signed out – reset to app default (light)
      resetTheme();
      setAuthThemeReady(true);
    }
  }, [user, role, isReady]); // eslint-disable-line react-hooks/exhaustive-deps

  // Navigation logic
  useEffect(() => {
    // Wait until both auth and onboarding status are loaded
    if (!isReady || authLoading || !authThemeReady) return;

    const inAuthGroup = segments[0] === "auth";
    const inWelcomeGroup = segments[0] === "welcome";
    const inJobseekerTabs = segments[0] === "(jobseeker-tabs)";
    const inEmployerTabs = segments[0] === "(employer-tabs)";
    const inAdminTabs = segments[0] === "(admin-tabs)";

    // PRIORITY 1: Show onboarding if user hasn't seen it (regardless of auth status)
    if (hasSeenOnboarding === false && !inWelcomeGroup) {
      console.log("→ Redirecting to onboarding");
      router.replace("/welcome/Step1");
      return;
    }

    // PRIORITY 2: User has seen onboarding but is not logged in
    if (
      hasSeenOnboarding === true &&
      !user &&
      !inAuthGroup &&
      !inWelcomeGroup
    ) {
      console.log(" Redirecting, to signin (not logged in)");
      router.replace("/auth/signin");
      return;
    }

      // User is logged in but missing a role (e.g., new Google OAuth user)
      const onOAuthScreens = segments[1] === "complete-oauth-profile";
      if (user && !role && !onOAuthScreens) {
        console.log("→ Redirecting to complete-oauth-profile (logged in, missing role)");
        router.replace("/auth/complete-oauth-profile");
        return;
      }

      // Redirect away from auth/welcome screens to role dashboard,
      // EXCEPT for the reset-password screen which needs to be accessible during recovery.
      if (user && role) {
        if ((inAuthGroup && segments[1] !== "reset-password") || inWelcomeGroup) {
          console.log("→ Redirecting to dashboard (logged in, on auth screen)");
          if (role === "jobseeker") {
            router.replace("/(jobseeker-tabs)/jobseekers/Home");
          } else if (role === "employer") {
            router.replace("/(employer-tabs)/employers/Dashboard");
          } else if (role === "admin") {
            router.replace("/(admin-tabs)/admin/Dashboard");
          }
          return;
        }

        // Block non-admin from admin tabs
        if (role !== "admin" && inAdminTabs) {
          console.log("→ Non-admin tried to access admin tabs");
          if (role === "jobseeker") {
            router.replace("/(jobseeker-tabs)/jobseekers/Home");
          } else {
            router.replace("/(employer-tabs)/employers/Dashboard");
          }
          return;
        }

        // Prevent cross-role access between jobseeker/employer tabs
        if (role === "jobseeker" && inEmployerTabs) {
          console.log("→ Jobseeker tried to access employer tabs");
          router.replace("/(jobseeker-tabs)/jobseekers/Home");
        } else if (role === "employer" && inJobseekerTabs) {
          console.log("→ Employer tried to access jobseeker tabs");
          router.replace("/(employer-tabs)/employers/Dashboard");
        } else if (role === "admin" && (inJobseekerTabs || inEmployerTabs)) {
          console.log("→ Admin redirected to admin tabs");
          router.replace("/(admin-tabs)/admin/Dashboard");
        }
      }
  }, [user, role, authLoading, segments, hasSeenOnboarding, isReady]);

  // Show loading screen while checking initial state
  if (!isReady || authLoading || hasSeenOnboarding === null) {
    // UPDATED: Add check for hasSeenOnboarding === null
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: APP_BACKGROUND,
        }}
      >
        {/* Centered Image */}
        {/* if background is black let's use the  the white background image of talenta otherwise we use that android-icon-foreground.png */}
        {APP_BACKGROUND === "#080A08" ? (
          <Image
            source={require("../assets/images/android-icon-foreground-white-removebg.png")}
            style={{
              width: 120,
              height: 120,
              resizeMode: "contain",
            }}
          />
        ) : (
          <Image
            source={require("../assets/images/android-icon-foreground.png")}
            style={{
              width: 120,
              height: 120,
              resizeMode: "contain",
            }}
          />
        )}

        {/* Bottom Text */}
        <RNText
          className="text-black dark:text-white font-quicksandBold text-lg"
          style={{
            position: "absolute",
            bottom: 40,
            alignSelf: "center",
          }}
        >
          Talenta
        </RNText>
      </View>
    );
  }

  return (
    <Stack
      screenOptions={{
        contentStyle: { backgroundColor: APP_BACKGROUND },
      }}
    >
      {/* Index redirect - no header */}
      <Stack.Screen name="index" options={{ headerShown: false }} />

      {/* Welcome screens */}
      <Stack.Screen name="welcome/Step1" options={{ headerShown: false }} />
      <Stack.Screen name="welcome/Step2" options={{ headerShown: false }} />

      {/* Tab layouts */}
      <Stack.Screen name="(jobseeker-tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="(employer-tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="(admin-tabs)" options={{ headerShown: false }} />

      {/* Shared screens — accessible from every role tab group */}
      <Stack.Screen name="(shared)" options={{ headerShown: false }} />

      {/* Job seeker screens */}
      <Stack.Screen
        name="jobseekers/job-details/[id]"
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="jobseekers/complete-profile"
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="jobseekers/upload-cv"
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="jobseekers/Applications"
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="jobseekers/notifications"
        options={{ headerShown: false }}
      />
      {/* Employer screens */}
      <Stack.Screen
        name="employer/job-details/[id]"
        options={{ headerShown: false }}
      />

      {/* Shared layout screens */}
      <Stack.Screen
        name="layout/ui/ThemeScreen"
        options={{ headerShown: false }}
      />

      {/* Auth screens */}
      <Stack.Screen name="auth/signin" options={{ headerShown: false }} />
      <Stack.Screen name="auth/signup" options={{ headerShown: false }} />
      <Stack.Screen name="auth/verify-email" options={{ headerShown: false }} />
      <Stack.Screen name="auth/forgot-password" options={{ headerShown: false }} />
      <Stack.Screen name="auth/reset-password" options={{ headerShown: false }} />
      <Stack.Screen name="auth/callback" options={{ headerShown: false }} />
      <Stack.Screen name="auth/complete-oauth-profile" options={{ headerShown: false }} />

      {/* Employer screens */}
      <Stack.Screen name="employer/post-job" options={{ headerShown: false }} />
      <Stack.Screen
        name="employer/complete-profile"
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="employer/upload-documents"
        options={{ headerShown: false }}
      />
      <Stack.Screen name="employer/notifications" options={{ headerShown: false }} />
      <Stack.Screen name="employer/contact" options={{ headerShown: false }} />
      <Stack.Screen name="employer/applications" options={{ headerShown: false }} />
      <Stack.Screen name="employer/business-verification" options={{ headerShown: false }} />


      {/* Admin screens */}
      <Stack.Screen name="admin/Users" options={{ headerShown: false }} />

      {/* Shared screens (accessible by all roles) */}
      <Stack.Screen name="shared/privacy-security" options={{ headerShown: false }} />

    </Stack>
  );
}

export default function RootLayout() {
  useEffect(() => {
    const testConnection = async () => {
      try {
        const response = await fetch(
          "https://ssaqohliglvwqwialomg.supabase.co/auth/v1/health",
          {
            headers: {
              apikey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!,
            },
          },
        );
        const text = await response.text();
        console.log("Health check status:", response.status);
        console.log("Health check body:", text);
      } catch (e) {
        console.log("Health check failed:", e);
      }
    };
    testConnection();
  }, []);
  const [fontsLoaded] = useFonts({
    Quicksand_400Regular,
    Quicksand_500Medium,
    Quicksand_600SemiBold,
    Quicksand_700Bold,
  });

  if (!fontsLoaded) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#ffffff",
        }}
      >
        <Image
          source={require("../assets/images/android-icon-foreground.png")}
          style={{ width: 120, height: 120, resizeMode: "contain" }}
        />
      </View>
    );
  }

  // Apply default font
  (RNText as any).defaultProps = (RNText as any).defaultProps || {};
  (RNText as any).defaultProps.style = { fontFamily: "Quicksand_400Regular" };

  return (
    <ThemeProvider>
      <ThemeSync />
      <GestureHandlerRootView style={{ flex: 1 }}>
        <KeyboardProvider>
          <SafeAreaProvider>
            <AuthProvider>
              <NotificationProvider>
                <RootLayoutNav />
                <Toaster
                  position="top-center"
                  duration={2000}
                  richColors
                  visibleToasts={2}
                />
              </NotificationProvider>
            </AuthProvider>
          </SafeAreaProvider>
        </KeyboardProvider>
      </GestureHandlerRootView>
    </ThemeProvider>
  );
}
