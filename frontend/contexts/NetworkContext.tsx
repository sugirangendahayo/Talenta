// contexts/NetworkContext.tsx
//
// Single, app-wide source of truth for connectivity state.
//
// Why this exists: without a centralized manager, every screen/hook would
// need its own `NetInfo.addEventListener` subscription, which duplicates
// listeners (memory leaks, redundant renders) and produces inconsistent
// "online/offline" opinions across the app. This provider is mounted ONCE
// at the root of the app (see `app/_layout.tsx`) and every screen/hook reads
// from it via `useNetwork()`.
//
// Design notes:
// - "isOnline" is a *debounced/confirmed* signal, not the raw NetInfo event.
//   Real devices fire bursts of connectivity events when switching between
//   Wi-Fi/cellular, toggling airplane mode, or on flaky connections. Naively
//   trusting every event causes banner flicker and repeated refetch storms.
//   We only flip to "offline" after connectivity has been bad for a short,
//   sustained window (`OFFLINE_CONFIRM_DELAY_MS`). Coming back online is
//   reported immediately (users want fast positive feedback).
// - `reconnectedAt` increments (as a timestamp) exactly once per confirmed
//   offline -> online transition. Data hooks watch this value (via
//   `useRefetchOnReconnect`) to trigger a single, intelligent refetch instead
//   of every screen independently re-subscribing to NetInfo.
// - All state updates that wouldn't change any observable field return the
//   previous state object so React can bail out of re-rendering consumers.
import NetInfo, {
  NetInfoState,
  NetInfoStateType,
} from "@react-native-community/netinfo";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { AppState } from "react-native";

// How long a "bad" connectivity reading must persist before we confirm the
// app is offline. Shields the UI from momentary blips (e.g. brief Wi-Fi
// hiccups, tower handoffs on mobile data) that resolve on their own.
const OFFLINE_CONFIRM_DELAY_MS = 1200;

export interface NetworkState {
  /** Debounced/confirmed connectivity — the value the rest of the app should trust. */
  isOnline: boolean;
  /** Raw reachability from the last NetInfo reading (null = unknown, common on some platforms). */
  isInternetReachable: boolean | null;
  /** Wi-Fi, cellular, none, etc. */
  connectionType: NetInfoStateType;
  /** True until the very first NetInfo reading resolves — avoids showing an offline banner on cold start before we actually know. */
  isChecking: boolean;
  /** Timestamp of the last time we were confirmed online. */
  lastOnlineAt: number | null;
  /** Timestamp of the last time we were confirmed offline. */
  lastOfflineAt: number | null;
  /** Timestamp updated exactly once per confirmed offline -> online transition. `null` until the first reconnect happens this session. */
  reconnectedAt: number | null;
}

const initialState: NetworkState = {
  isOnline: true,
  isInternetReachable: true,
  connectionType: NetInfoStateType.unknown,
  isChecking: true,
  lastOnlineAt: null,
  lastOfflineAt: null,
  reconnectedAt: null,
};

const NetworkContext = createContext<NetworkState>(initialState);

function rawStateIsOnline(state: NetInfoState): boolean {
  // `isConnected === false` is an unambiguous "no transport" signal.
  // `isInternetReachable === false` means we have a transport (e.g. Wi-Fi)
  // but it isn't actually routing to the internet (captive portal, etc.).
  // `null` reachability is treated as online — some platforms/situations
  // never resolve it, and treating it as offline would cause false positives.
  return state.isConnected !== false && state.isInternetReachable !== false;
}

export function NetworkProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<NetworkState>(initialState);

  // Tracks whether we're *currently* in the confirmed-online regime, so we
  // know whether a bad reading represents a fresh transition (start the
  // debounce timer) or a continuation of an already-confirmed offline period
  // (no need to keep restarting timers).
  const wasOnlineRef = useRef(true);
  const offlineTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearOfflineTimer = useCallback(() => {
    if (offlineTimerRef.current) {
      clearTimeout(offlineTimerRef.current);
      offlineTimerRef.current = null;
    }
  }, []);

  const applyNetInfoState = useCallback(
    (netState: NetInfoState) => {
      const online = rawStateIsOnline(netState);

      if (online) {
        // Connection is good (or recovered) — cancel any pending "confirm
        // offline" timer and report online immediately.
        clearOfflineTimer();
        wasOnlineRef.current = true;

        setState((prev) => {
          const cameFromOffline = !prev.isOnline;
          const nothingChanged =
            !cameFromOffline &&
            !prev.isChecking &&
            prev.isInternetReachable === netState.isInternetReachable &&
            prev.connectionType === netState.type;

          if (nothingChanged) return prev; // bail out, no re-render needed

          const now = Date.now();
          return {
            ...prev,
            isOnline: true,
            isInternetReachable: netState.isInternetReachable,
            connectionType: netState.type,
            isChecking: false,
            lastOnlineAt: now,
            reconnectedAt: cameFromOffline ? now : prev.reconnectedAt,
          };
        });
        return;
      }

      // Bad reading. If we were previously confirmed online, start (or keep)
      // a debounce timer before flipping the global state to offline.
      if (wasOnlineRef.current) {
        if (!offlineTimerRef.current) {
          offlineTimerRef.current = setTimeout(() => {
            offlineTimerRef.current = null;
            wasOnlineRef.current = false;
            setState((prev) => ({
              ...prev,
              isOnline: false,
              isInternetReachable: netState.isInternetReachable,
              connectionType: netState.type,
              isChecking: false,
              lastOfflineAt: Date.now(),
            }));
          }, OFFLINE_CONFIRM_DELAY_MS);
        }
        return;
      }

      // Already confirmed offline — just keep metadata fresh without
      // triggering extra renders unless something actually changed.
      setState((prev) => {
        if (
          !prev.isChecking &&
          prev.isOnline === false &&
          prev.isInternetReachable === netState.isInternetReachable &&
          prev.connectionType === netState.type
        ) {
          return prev;
        }
        return {
          ...prev,
          isOnline: false,
          isInternetReachable: netState.isInternetReachable,
          connectionType: netState.type,
          isChecking: false,
        };
      });
    },
    [clearOfflineTimer],
  );

  useEffect(() => {
    let mounted = true;

    // Resolve the real state immediately on mount instead of waiting for the
    // first event, so app cold-start (possibly already offline) is detected
    // right away.
    NetInfo.fetch().then((s) => {
      if (mounted) applyNetInfoState(s);
    });

    // Single, app-wide subscription — never duplicated per-screen.
    const unsubscribe = NetInfo.addEventListener((s) => {
      if (mounted) applyNetInfoState(s);
    });

    // Edge case: returning from background/airplane-mode toggles can leave
    // the last-known NetInfo event stale for a moment. Force a fresh read
    // whenever the app becomes active again.
    const appStateSub = AppState.addEventListener("change", (next) => {
      if (next === "active" && mounted) {
        NetInfo.fetch().then((s) => {
          if (mounted) applyNetInfoState(s);
        });
      }
    });

    return () => {
      mounted = false;
      unsubscribe();
      appStateSub.remove();
      clearOfflineTimer();
    };
  }, [applyNetInfoState, clearOfflineTimer]);

  // Value only changes when `state` changes (which itself is guarded above
  // against no-op updates), so consumers don't re-render needlessly.
  const value = useMemo(() => state, [state]);

  return (
    <NetworkContext.Provider value={value}>{children}</NetworkContext.Provider>
  );
}

/** Read the app's global connectivity state. Safe to call from anywhere in the tree. */
export function useNetwork(): NetworkState {
  const ctx = useContext(NetworkContext);
  if (!ctx) {
    throw new Error("useNetwork must be used within a NetworkProvider");
  }
  return ctx;
}
