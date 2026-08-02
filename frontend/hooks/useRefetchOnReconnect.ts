// hooks/useRefetchOnReconnect.ts
//
// Drop-in hook that lets any existing data-fetching hook opt into "smart
// refresh on reconnect" without duplicating NetInfo listeners.
//
// Design goals (see task requirements #8 and #9):
// - Only refetch the ACTIVE screen — gated on `useIsFocused()`, so
//   backgrounded tab screens don't all refetch at once when connectivity
//   returns (avoids flooding the backend).
// - Refetch at most once per confirmed reconnect event — `NetworkContext`
//   already debounces/confirms transitions, and this hook additionally
//   dedupes by the `reconnectedAt` timestamp so a single reconnect can never
//   trigger more than one refetch per consumer.
// - Respects a minimum interval since the hook's own last run, so a screen
//   that just fetched moments before losing connectivity won't immediately
//   re-fetch again the instant it's back (avoids redundant calls on rapid
//   flaky disconnect/reconnect cycles).
// - Uses a ref to always call the *latest* `refetch` closure without adding
//   it to the effect's dependency array — many hooks recreate their fetch
//   function on every param change (category, search query, filters, etc.),
//   and we don't want that alone to be mistaken for a "reconnect" event.
//
// Usage inside a data hook:
//   useRefetchOnReconnect(() => fetchJobs(undefined, true), {
//     enabled: jobs.length > 0, // only worth auto-refreshing if we've loaded before
//   });
import { useIsFocused } from "@react-navigation/native";
import { useEffect, useRef } from "react";

import { useNetwork } from "@/contexts/NetworkContext";

interface UseRefetchOnReconnectOptions {
  /** Skip auto-refresh entirely (e.g. no cached data yet, or feature not applicable). Default: true. */
  enabled?: boolean;
  /** Minimum time (ms) between auto-refetches triggered by this hook instance. Default: 15s. */
  minIntervalMs?: number;
}

export function useRefetchOnReconnect(
  refetch: () => void,
  options: UseRefetchOnReconnectOptions = {},
) {
  const { enabled = true, minIntervalMs = 15000 } = options;
  const { reconnectedAt } = useNetwork();
  const isFocused = useIsFocused();

  const refetchRef = useRef(refetch);
  useEffect(() => {
    refetchRef.current = refetch;
  }, [refetch]);

  const lastRunAtRef = useRef(0);
  const lastHandledReconnectRef = useRef<number | null>(null);

  useEffect(() => {
    if (!reconnectedAt) return;
    if (!enabled) return;
    // Already handled this exact reconnect event for this consumer.
    if (lastHandledReconnectRef.current === reconnectedAt) return;
    // Screen isn't active right now — wait. This effect re-runs when
    // `isFocused` flips to true (still with the same `reconnectedAt`),
    // so the refetch happens the moment the user comes back to the screen.
    if (!isFocused) return;

    lastHandledReconnectRef.current = reconnectedAt;

    const now = Date.now();
    if (now - lastRunAtRef.current < minIntervalMs) return;

    lastRunAtRef.current = now;
    refetchRef.current();
  }, [reconnectedAt, isFocused, enabled, minIntervalMs]);
}
