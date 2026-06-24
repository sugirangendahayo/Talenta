// contexts/NotificationContext.tsx
// Handles Expo push notification registration, foreground handling, and tap navigation
import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import { Platform } from "react-native";
import { useRouter } from "expo-router";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";

// ── Notification handler: show banners even while app is in foreground ────────
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

// ── Android channel ───────────────────────────────────────────────────────────
const ANDROID_CHANNEL_ID = "talenta-notifications";

async function createAndroidChannel() {
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync(ANDROID_CHANNEL_ID, {
      name: "Talenta Notifications",
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#0E7490",
      sound: "default",
      enableVibrate: true,
      showBadge: true,
    });
  }
}

// ── Context ───────────────────────────────────────────────────────────────────
interface NotificationContextType {
  expoPushToken: string | null;
  permissionStatus: Notifications.PermissionStatus | null;
  requestPermission: () => Promise<boolean>;
}

const NotificationContext = createContext<NotificationContextType>({
  expoPushToken: null,
  permissionStatus: null,
  requestPermission: async () => false,
});

export const useNotificationContext = () => useContext(NotificationContext);

// ── Provider ──────────────────────────────────────────────────────────────────
export function NotificationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useAuth();
  const router = useRouter();
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
  const [permissionStatus, setPermissionStatus] =
    useState<Notifications.PermissionStatus | null>(null);

  const notificationListener = useRef<Notifications.EventSubscription | null>(null);
  const responseListener = useRef<Notifications.EventSubscription | null>(null);

  // ── Request permission and get token ───────────────────────────────────────
  const requestPermission = async (): Promise<boolean> => {
    if (!Device.isDevice) {
      console.warn("[Notifications] Push notifications only work on physical devices.");
      return false;
    }

    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    setPermissionStatus(finalStatus);
    return finalStatus === "granted";
  };

  // ── Register push token with Supabase ──────────────────────────────────────
  const registerToken = async (userId: string) => {
    try {
      if (!Device.isDevice) return;

      const granted = await requestPermission();
      if (!granted) {
        console.warn("[Notifications] Permission denied — token not registered.");
        return;
      }

      await createAndroidChannel();

      // Get Expo push token
      const tokenResponse = await Notifications.getExpoPushTokenAsync({
        projectId: "faf1ba08-e828-4439-a54a-30fd460eefc2", // from app.json extra.eas.projectId
      });

      const token = tokenResponse.data;
      setExpoPushToken(token);

      // Upsert to Supabase — handles both new and existing tokens/devices
      const { error } = await supabase.from("push_tokens").upsert(
        {
          user_id: userId,
          token,
          platform: Platform.OS,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: "user_id,token",
          ignoreDuplicates: false,
        }
      );

      if (error) {
        console.error("[Notifications] Failed to store push token:", error);
      } else {
        console.log("[Notifications] Push token registered:", token);
      }
    } catch (err) {
      console.error("[Notifications] Token registration error:", err);
    }
  };

  // ── Remove token on sign-out ───────────────────────────────────────────────
  const removeToken = async (userId: string) => {
    if (!expoPushToken) return;
    try {
      await supabase
        .from("push_tokens")
        .delete()
        .eq("user_id", userId)
        .eq("token", expoPushToken);
      setExpoPushToken(null);
    } catch (err) {
      console.error("[Notifications] Failed to remove push token:", err);
    }
  };

  // ── Navigate based on notification data ────────────────────────────────────
  const handleNotificationNavigation = (
    notificationData: Record<string, string> | undefined
  ) => {
    if (!notificationData) return;
    const { type, job_id } = notificationData;

    switch (type) {
      // Employer receives: someone applied to their job
      case "new_application":
        if (job_id) {
          router.push({
            pathname: "/(employer-tabs)/employers/Applicants" as any,
            params: { jobId: job_id },
          });
        } else {
          router.push("/(employer-tabs)/employers/Applicants" as any);
        }
        break;

      // Job seeker receives: their application status changed
      case "application_status_changed":
        router.push("/(jobseeker-tabs)/jobseekers/Applications" as any);
        break;

      default:
        break;
    }
  };

  // ── Auth change effect — register/remove token ─────────────────────────────
  useEffect(() => {
    if (user) {
      registerToken(user.id);
    }
    // Note: we don't call removeToken on sign-out here to avoid race conditions;
    // the token stays in DB but becomes inactive once the user signs in on another account.
    // A cleanup job can remove stale tokens periodically.
  }, [user?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Notification listeners ─────────────────────────────────────────────────
  useEffect(() => {
    // Foreground listener: notification received while app is open
    notificationListener.current =
      Notifications.addNotificationReceivedListener((notification) => {
        console.log(
          "[Notifications] Foreground notification received:",
          notification.request.content.title
        );
        // The handler set above (setNotificationHandler) already shows the banner.
        // No additional action needed here — real-time Supabase updates handle in-app UI.
      });

    // Response listener: user tapped a notification (any app state)
    responseListener.current =
      Notifications.addNotificationResponseReceivedListener((response) => {
        console.log("[Notifications] Notification tapped:", response);
        const data = response.notification.request.content.data as
          | Record<string, string>
          | undefined;
        handleNotificationNavigation(data);
      });

    return () => {
      if (notificationListener.current) {
        notificationListener.current.remove();
      }
      if (responseListener.current) {
        responseListener.current.remove();
      }
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Handle notification that launched the app (terminated state) ───────────
  useEffect(() => {
    Notifications.getLastNotificationResponseAsync().then((response) => {
      if (response?.notification) {
        const data = response.notification.request.content.data as
          | Record<string, string>
          | undefined;
        // Small delay to let navigation stack mount before pushing a new route
        setTimeout(() => handleNotificationNavigation(data), 500);
      }
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <NotificationContext.Provider
      value={{ expoPushToken, permissionStatus, requestPermission }}
    >
      {children}
    </NotificationContext.Provider>
  );
}
