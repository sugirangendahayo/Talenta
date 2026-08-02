// contexts/JobsRefreshContext.tsx
//
// Tiny app-wide signal for "an employer just posted/updated a job".
//
// Why this exists: the "+" post-job button lives in the employer tab bar
// (`app/(employer-tabs)/_layout.tsx`), completely outside the Dashboard and
// Jobs screens' component trees. Those screens each own their own
// data-fetching hook/state, so there was previously no way for a successful
// post to tell them "go fetch again" — the employer had to manually
// pull-to-refresh, and even then only the screen they happened to be on
// would update.
//
// This context is a minimal pub/sub: `notifyJobPosted()` bumps a counter,
// and any screen that cares (Dashboard, Jobs) watches that counter via a
// `useEffect` and silently refetches. Because tab screens stay mounted in
// the background, this refetch happens immediately regardless of which tab
// the employer is actually looking at — so by the time they switch tabs the
// data is already correct, with no stale "sitting there until app restart"
// state and no jarring full-screen reload.
import React, { createContext, useCallback, useContext, useMemo, useState } from "react";

interface JobsRefreshContextType {
  /** Increments every time a job is created/updated/posted. Starts at 0 —
   * treat 0 as "no refresh requested yet" so mount-time effects can ignore it. */
  refreshKey: number;
  /** Call after a job is successfully created, edited, or its status changes. */
  notifyJobPosted: () => void;
}

const JobsRefreshContext = createContext<JobsRefreshContextType>({
  refreshKey: 0,
  notifyJobPosted: () => {},
});

export const useJobsRefresh = () => useContext(JobsRefreshContext);

export function JobsRefreshProvider({ children }: { children: React.ReactNode }) {
  const [refreshKey, setRefreshKey] = useState(0);

  const notifyJobPosted = useCallback(() => {
    setRefreshKey((k) => k + 1);
  }, []);

  const value = useMemo(() => ({ refreshKey, notifyJobPosted }), [refreshKey, notifyJobPosted]);

  return (
    <JobsRefreshContext.Provider value={value}>
      {children}
    </JobsRefreshContext.Provider>
  );
}
