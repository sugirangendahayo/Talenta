import { useState, useCallback, useEffect, useRef } from "react";
import * as Linking from "expo-linking";
import * as WebBrowser from "expo-web-browser";
import { supabase } from "@/lib/supabase";
import {
  getEmployerPremiumStatus,
  createEmployerCheckoutSession,
  confirmEmployerCheckoutSession,
} from "@/lib/premiumService";
import { EmployerCertificate, PremiumPlan } from "@/types/verification.types";
import { toast } from "sonner-native";
import { useNetwork } from "@/contexts/NetworkContext";
import { useRefetchOnReconnect } from "@/hooks/useRefetchOnReconnect";
import { useRequireOnline } from "@/hooks/useRequireOnline";
import { useAuth } from "@/contexts/AuthContext";

export function usePremiumStatus() {
  const { isOnline } = useNetwork();
  const { requireOnline } = useRequireOnline();
  const { refreshProfile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [activating, setActivating] = useState(false);
  const [plan, setPlan] = useState<PremiumPlan>("free");
  const [certificate, setCertificate] = useState<EmployerCertificate | null>(null);
  // Defense-in-depth against double taps launching two Checkout sessions
  // before `activating` state has re-rendered the disabled button.
  const activatingRef = useRef(false);

  const fetchStatus = useCallback(async () => {
    if (!isOnline) {
      setLoading(false);
      return; // keep whatever premium status is already cached in memory
    }

    try {
      setLoading(true);
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) throw new Error("Not authenticated");

      const data = await getEmployerPremiumStatus(user.id);
      setPlan(data.plan);
      setCertificate(data.certificate);
    } catch (error: any) {
      console.error("Error fetching premium status:", error);
      toast.error(error.message || "Failed to load premium status");
    } finally {
      setLoading(false);
    }
  }, [isOnline]);

  const activatePlan = useCallback(
    async (selectedPlan: PremiumPlan) => {
      if (selectedPlan === "free") return false;
      if (activatingRef.current) return false; // already mid-checkout
      if (!requireOnline("You're offline. Reconnect to activate your plan.")) return false;

      activatingRef.current = true;
      setActivating(true);
      try {
        // Same deep-link pattern already used for Google Sign-In
        // (see components/auth/shared/GoogleAuthButton.tsx) — works in both
        // Expo Go (exp://) and standalone builds (talenta://).
        const redirectUrl = Linking.createURL("/payment/callback");

        const { url, sessionId } = await createEmployerCheckoutSession(selectedPlan, redirectUrl);

        const result = await WebBrowser.openAuthSessionAsync(url, redirectUrl);

        // IMPORTANT: never trust `result.type` or the redirect URL's own
        // `status` param as the source of truth. Many mobile browsers block
        // automatic redirects to custom URL schemes (talenta://...) unless
        // the user taps a link, which makes this browser session resolve as
        // "cancel"/"dismiss" even when the payment already succeeded on
        // Stripe's side (the webhook has likely already activated the plan
        // by this point). Always ask the server — which verifies directly
        // with Stripe — regardless of how this browser session ended.
        const confirmation = await confirmEmployerCheckoutSession(sessionId);

        if (confirmation.status === "completed") {
          await Promise.all([fetchStatus(), refreshProfile()]);
          return true;
        }

        if (confirmation.status === "expired") {
          toast.error("Your checkout session expired. Please try again.");
          return false;
        }

        // Server confirms it's genuinely still unpaid — now it's safe to use
        // the browser's own signal purely for friendlier wording.
        if (result.type === "cancel" || result.type === "dismiss") {
          toast.info("Payment cancelled");
        } else {
          toast.error(
            "We couldn't confirm your payment yet. If you completed checkout, this will update automatically shortly.",
          );
        }
        return false;
      } catch (error: any) {
        console.error("Activation error:", error);
        toast.error(error.message || "Failed to activate plan");
        return false;
      } finally {
        activatingRef.current = false;
        setActivating(false);
      }
    },
    [fetchStatus, refreshProfile, requireOnline],
  );

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  // Smart auto-refresh: when connectivity returns, silently refresh premium
  // status if this screen is focused.
  useRefetchOnReconnect(() => fetchStatus());

  return {
    loading,
    activating,
    plan,
    certificate,
    activatePlan,
    refreshStatus: fetchStatus,
  };
}
