// hooks/useNotifications.ts
//
// Thin compatibility shim. The actual state now lives in a single shared
// `NotificationsDataProvider` (see contexts/NotificationsDataContext.tsx) so
// every screen/component reads and mutates the exact same notifications
// list instead of each maintaining its own out-of-sync copy. This keeps all
// existing `import { useNotifications } from "@/hooks/useNotifications"`
// call sites working unchanged.
export { useNotificationsData as useNotifications } from "@/contexts/NotificationsDataContext";
export type { Notification } from "@/contexts/NotificationsDataContext";
