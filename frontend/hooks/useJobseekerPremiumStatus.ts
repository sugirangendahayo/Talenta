import { useState, useCallback, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { getJobseekerPremiumStatus, simulateJobseekerPaymentAndActivate, JobseekerPremiumPlan, JobseekerCertificate } from "@/lib/jobseekerPremiumService";
import { toast } from "sonner-native";
import { useNetwork } from "@/contexts/NetworkContext";
import { useRefetchOnReconnect } from "@/hooks/useRefetchOnReconnect";
import { useRequireOnline } from "@/hooks/useRequireOnline";

export function useJobseekerPremiumStatus() {
  const { isOnline } = useNetwork();
  const { requireOnline } = useRequireOnline();
  const [loading, setLoading] = useState(true);
  const [activating, setActivating] = useState(false);
  const [plan, setPlan] = useState<JobseekerPremiumPlan>("free");
  const [certificate, setCertificate] = useState<JobseekerCertificate | null>(null);

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

      const data = await getJobseekerPremiumStatus(user.id);
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
    async (selectedPlan: JobseekerPremiumPlan) => {
      if (!requireOnline("You're offline. Reconnect to activate your plan.")) return false;

      try {
        setActivating(true);
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) throw new Error("Not authenticated");

        await simulateJobseekerPaymentAndActivate(user.id, selectedPlan);
        await fetchStatus();
        return true;
      } catch (error: any) {
        console.error("Activation error:", error);
        toast.error(error.message || "Failed to activate plan");
        return false;
      } finally {
        setActivating(false);
      }
    },
    [fetchStatus, requireOnline]
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
