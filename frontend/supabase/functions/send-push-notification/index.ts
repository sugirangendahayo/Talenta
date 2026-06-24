// supabase/functions/send-push-notification/index.ts
// Sends Expo push notifications to a specific user via their stored push token(s)
/* eslint-disable import/no-unresolved */
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface PushPayload {
  recipientUserId: string;
  title: string;
  body: string;
  data?: Record<string, string>;
  sound?: "default" | null;
  badge?: number;
  channelId?: string;
}

interface ExpoPushMessage {
  to: string;
  title: string;
  body: string;
  data?: Record<string, string>;
  sound?: "default" | null;
  badge?: number;
  channelId?: string;
  priority?: "default" | "normal" | "high";
}

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders, status: 204 });
  }

  try {
    if (req.method !== "POST") {
      return new Response(JSON.stringify({ error: "Method not allowed" }), {
        status: 405,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const payload: PushPayload = await req.json();
    const {
      recipientUserId,
      title,
      body,
      data = {},
      sound = "default",
      badge,
      channelId = "talenta-notifications",
    } = payload;

    if (!recipientUserId || !title || !body) {
      return new Response(
        JSON.stringify({ error: "recipientUserId, title, and body are required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Initialize Supabase with service-role key for privileged DB access
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Fetch all push tokens for this user (they may have multiple devices)
    const { data: tokenRows, error: tokenError } = await supabaseAdmin
      .from("push_tokens")
      .select("token, platform")
      .eq("user_id", recipientUserId);

    if (tokenError) {
      console.error("Error fetching push tokens:", tokenError);
      return new Response(
        JSON.stringify({ error: "Failed to fetch push tokens" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    if (!tokenRows || tokenRows.length === 0) {
      console.log(`No push tokens found for user ${recipientUserId}`);
      return new Response(
        JSON.stringify({ sent: 0, message: "No push tokens registered for this user" }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Filter for valid Expo push tokens
    const validTokens = tokenRows
      .map((row: { token: string; platform: string }) => row.token)
      .filter(
        (token: string) =>
          token.startsWith("ExponentPushToken[") ||
          token.startsWith("ExpoPushToken[")
      );

    if (validTokens.length === 0) {
      console.log("No valid Expo push tokens found");
      return new Response(
        JSON.stringify({ sent: 0, message: "No valid Expo push tokens" }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Build Expo push messages — one per token
    const messages: ExpoPushMessage[] = validTokens.map((token: string) => ({
      to: token,
      title,
      body,
      data,
      sound,
      badge,
      channelId,
      priority: "high",
    }));

    // Send to Expo Push API
    const expoResponse = await fetch("https://exp.host/--/api/v2/push/send", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Accept-Encoding": "gzip, deflate",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(messages),
    });

    const expoResult = await expoResponse.json();

    // Log any errors from Expo
    if (Array.isArray(expoResult.data)) {
      const errors = expoResult.data.filter(
        (r: { status: string }) => r.status !== "ok"
      );
      if (errors.length > 0) {
        console.error("Expo push errors:", JSON.stringify(errors));
      }
    }

    console.log(
      `Successfully sent ${messages.length} push notification(s) to user ${recipientUserId}`
    );

    return new Response(
      JSON.stringify({
        sent: messages.length,
        expoResponse: expoResult,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (err) {
    console.error("Unhandled error in send-push-notification:", err);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
