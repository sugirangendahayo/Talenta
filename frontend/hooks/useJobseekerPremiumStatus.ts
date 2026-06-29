import { useState, useCallback, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { getJobseekerPremiumStatus, simulateJobseekerPaymentAndActivate, JobseekerPremiumPlan, JobseekerCertificate } from "@/lib/jobseekerPremiumService";
import { toast } from "sonner-native";

export function useJobseekerPremiumStatus() {
  const [loading, setLoading] = useState(true);
  const [activating, setActivating] = useState(false);
  const [plan, setPlan] = useState<JobseekerPremiumPlan>("free");
  const [certificate, setCertificate] = useState<JobseekerCertificate | null>(null);

  const fetchStatus = useCallback(async () => {
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
  }, []);

  const activatePlan = useCallback(
    async (selectedPlan: JobseekerPremiumPlan) => {
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
    [fetchStatus]
  );

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  return {
    loading,
    activating,
    plan,
    certificate,
    activatePlan,
    refreshStatus: fetchStatus,
  };
}
