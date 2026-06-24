// hooks/usePushNotification.ts
// Thin hook to send push notifications via the Supabase Edge Function
import { useCallback } from "react";
import { supabase } from "@/lib/supabase";

export interface PushNotificationPayload {
  recipientUserId: string;
  title: string;
  body: string;
  data?: Record<string, string>;
}

export function usePushNotification() {
  /**
   * Send a push notification to a specific user.
   * This calls our Supabase Edge Function which looks up the recipient's
   * Expo push token(s) and sends the notification via Expo's Push API.
   *
   * Errors are intentionally non-fatal — if the push fails, the primary
   * action (apply / status update) has already succeeded.
   */
  const sendPushToUser = useCallback(
    async ({
      recipientUserId,
      title,
      body,
      data = {},
    }: PushNotificationPayload): Promise<boolean> => {
      try {
        const { data: result, error } = await supabase.functions.invoke(
          "send-push-notification",
          {
            body: {
              recipientUserId,
              title,
              body,
              data,
              channelId: "talenta-notifications",
            },
          }
        );

        if (error) {
          console.warn("[PushNotification] Edge function error:", error);
          return false;
        }

        console.log(
          `[PushNotification] Sent to user ${recipientUserId}:`,
          result
        );
        return true;
      } catch (err) {
        console.warn("[PushNotification] Failed to send push notification:", err);
        return false;
      }
    },
    []
  );

  return { sendPushToUser };
}
