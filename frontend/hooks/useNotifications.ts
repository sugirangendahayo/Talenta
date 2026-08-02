// hooks/useNotifications.ts
import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { RealtimeChannel } from "@supabase/supabase-js";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNetwork } from "@/contexts/NetworkContext";
import { useRefetchOnReconnect } from "@/hooks/useRefetchOnReconnect";
import { useRequireOnline } from "@/hooks/useRequireOnline";

export interface Notification {
  id: string;
  user_id: string;
  type:
    | "application_shortlisted"
    | "application_rejected"
    | "application_hired"
    | "new_application"
    | "interview_scheduled"
    | "interview_updated";
  title: string;
  message: string;
  job_id?: string;
  application_id?: string;
  interview_id?: string;
  is_read: boolean;
  read_at?: string;
  data?: {
    job_title?: string;
    company_name?: string;
    status?: string;
    [key: string]: any;
  };
  created_at: string;
}

export function useNotifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletedIds, setDeletedIds] = useState<Set<string>>(new Set());

  // This hook is mounted concurrently in several places at once (e.g. a
  // header badge AND the notifications screen for the same user). Supabase's
  // realtime client reuses an existing channel if one with the same topic
  // name is already subscribed, so giving every mount the exact same channel
  // name causes "cannot add postgres_changes callbacks after subscribe()"
  // once a 2nd instance tries to attach its own listeners. A per-instance id
  // (generated once, not on every effect run) keeps channel names unique per
  // mounted instance while still being stable across re-renders/token
  // refreshes of that same instance.
  const instanceIdRef = useRef(
    `${Date.now()}-${Math.random().toString(36).slice(2)}`,
  );
  const { isOnline } = useNetwork();
  const { requireOnline } = useRequireOnline();
  const hasLoadedOnceRef = useRef(false);

  // Fetch notifications
  const fetchNotifications = async () => {
    if (!user) return;

    // Offline: keep whatever notifications are already loaded (realtime
    // updates simply won't arrive until we're back online, at which point
    // `useRefetchOnReconnect` below re-syncs anything that was missed).
    if (!isOnline) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Load deleted IDs from AsyncStorage (fast path, cleared on reinstall)
      const storedDeletedIds = await AsyncStorage.getItem(`deleted_notifications_${user.id}`);
      const localDeletedIds = new Set<string>(storedDeletedIds ? JSON.parse(storedDeletedIds) : []);
      setDeletedIds(localDeletedIds);

      // Load the "cleared before" cutoff from Supabase user metadata (survives reinstall)
      let clearedBeforeTs: Date | null = null;
      const { data: { user: freshUser } } = await supabase.auth.getUser();
      const clearedAt = freshUser?.user_metadata?.notifications_cleared_at as string | undefined;
      if (clearedAt) {
        clearedBeforeTs = new Date(clearedAt);
      }

      const { data, error: fetchError } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(50);

      if (fetchError) throw fetchError;

      // Filter out:
      // 1. Notifications locally marked as deleted (per-session)
      // 2. Notifications created before the global "cleared_before" cutoff (cross-install)
      const activeNotifications = (data || []).filter((n) => {
        if (localDeletedIds.has(n.id)) return false;
        if (clearedBeforeTs && new Date(n.created_at) <= clearedBeforeTs) return false;
        return true;
      });

      // De-duplicate defensively in case of any backend/race duplicates
      const dedupedMap = new Map<string, Notification>();
      for (const n of activeNotifications) {
        if (!dedupedMap.has(n.id)) dedupedMap.set(n.id, n);
      }
      const dedupedNotifications = Array.from(dedupedMap.values());

      setNotifications(dedupedNotifications);
      hasLoadedOnceRef.current = true;
    } catch (err) {
      console.error("Error fetching notifications:", err);
      setError(
        err instanceof Error ? err.message : "Failed to load notifications",
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Mark notification as read
  const markAsRead = async (notificationId: string) => {
    if (!requireOnline("You're offline. This will sync once you're back online.")) return;
    try {
      const { error: updateError } = await supabase
        .from("notifications")
        .update({
          is_read: true,
          read_at: new Date().toISOString(),
        })
        .eq("id", notificationId);

      if (updateError) throw updateError;

      // Update local state
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === notificationId
            ? { ...n, is_read: true, read_at: new Date().toISOString() }
            : n,
        ),
      );
    } catch (err) {
      console.error("Error marking notification as read:", err);
    }
  };

  // Mark all as read
  const markAllAsRead = async () => {
    if (!user) return;
    if (!requireOnline("You're offline. This will sync once you're back online.")) return;

    try {
      const unreadIds = notifications
        .filter((n) => !n.is_read)
        .map((n) => n.id);

      if (unreadIds.length === 0) return;

      const { error: updateError } = await supabase
        .from("notifications")
        .update({
          is_read: true,
          read_at: new Date().toISOString(),
        })
        .in("id", unreadIds);

      if (updateError) throw updateError;

      // Update local state
      setNotifications((prev) =>
        prev.map((n) => ({
          ...n,
          is_read: true,
          read_at: n.read_at || new Date().toISOString(),
        })),
      );
    } catch (err) {
      console.error("Error marking all as read:", err);
    }
  };

  // Delete notification
  const deleteNotification = async (notificationId: string) => {
    if (!requireOnline("You're offline. Reconnect to delete this notification.")) return;
    try {
      // Optimistically hide locally via AsyncStorage in case DB delete is blocked by RLS
      const newDeletedIds = new Set(deletedIds);
      newDeletedIds.add(notificationId);
      setDeletedIds(newDeletedIds);
      await AsyncStorage.setItem(`deleted_notifications_${user?.id}`, JSON.stringify([...newDeletedIds]));

      // Update local state immediately
      setNotifications((prev) => prev.filter((n) => n.id !== notificationId));

      // Try database delete, but don't fail if it doesn't work (silent RLS rejection)
      const { error: deleteError } = await supabase
        .from("notifications")
        .delete()
        .eq("id", notificationId);

      if (deleteError) {
        console.warn("DB delete failed, but hidden locally:", deleteError);
      }
    } catch (err) {
      console.error("Error deleting notification:", err);
    }
  };

  // Clear all notifications locally + persist cutoff timestamp to Supabase user metadata
  const clearAllNotifications = async () => {
    if (!user) return;
    if (!requireOnline("You're offline. Reconnect to clear your notifications.")) return;
    try {
      const allIds = notifications.map(n => n.id);

      // 1. Update local state immediately
      setNotifications([]);

      // 2. Persist deleted IDs to AsyncStorage (fast path, covers this install)
      const newDeletedIds = new Set([...deletedIds, ...allIds]);
      setDeletedIds(newDeletedIds);
      if (allIds.length > 0) {
        await AsyncStorage.setItem(`deleted_notifications_${user.id}`, JSON.stringify([...newDeletedIds]));
      }

      // 3. Persist a "cleared_before" timestamp in Supabase user metadata so
      //    notifications cleared before this moment stay hidden even after reinstall.
      const clearedAt = new Date().toISOString();
      await supabase.auth.updateUser({
        data: { notifications_cleared_at: clearedAt },
      });

      // 4. Attempt DB delete silently (works if RLS allows it)
      if (allIds.length > 0) {
        await supabase
          .from("notifications")
          .delete()
          .in("id", allIds);
      }
    } catch (err) {
      console.error("Error clearing notifications:", err);
    }
  };

  // Subscribe to real-time notifications
  useEffect(() => {
    if (!user) return;

    fetchNotifications();

    // Subscribe to real-time changes
    const channelId = `notifications:${user.id}:${instanceIdRef.current}`;
    const channel: RealtimeChannel = supabase
      .channel(channelId)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          console.log("New notification received:", payload);
          const newNotification = payload.new as Notification;

          // Avoid duplicates: skip if we already have this notification
          // (can happen if a refetch races with the realtime event, or if
          // the subscription briefly overlaps during a token refresh).
          setNotifications((prev) => {
            if (prev.some((n) => n.id === newNotification.id)) return prev;
            return [newNotification, ...prev];
          });

          // Optional: Show local notification/alert
          // You can integrate react-native-push-notification here
        },
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          const updatedNotification = payload.new as Notification;
          setNotifications((prev) =>
            prev.map((n) =>
              n.id === updatedNotification.id ? updatedNotification : n,
            ),
          );
        },
      )
      .on(
        "postgres_changes",
        {
          event: "DELETE",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          const deletedId = payload.old.id;
          setNotifications((prev) => prev.filter((n) => n.id !== deletedId));
        },
      )
      .subscribe();

    // Cleanup
    return () => {
      supabase.removeChannel(channel);
    };
    // Depend only on the user id (not the full user object) since Supabase
    // creates a new `user` object reference on every token refresh, which
    // would otherwise tear down and re-create this subscription repeatedly
    // and could momentarily double-subscribe, causing duplicate notifications.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  // Realtime updates simply don't arrive while offline, so once connectivity
  // returns we do one lightweight refetch to reconcile anything that was
  // missed (new/updated/deleted notifications during the outage).
  useRefetchOnReconnect(fetchNotifications, {
    enabled: hasLoadedOnceRef.current,
  });

  // Derive unread count directly from the (deduped) notifications list so it
  // can never drift out of sync from manual increment/decrement bookkeeping.
  const unreadCount = notifications.reduce(
    (count, n) => (n.is_read ? count : count + 1),
    0,
  );

  return {
    notifications,
    unreadCount,
    isLoading,
    error,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAllNotifications,
    refetch: fetchNotifications,
  };
}
