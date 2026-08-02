// hooks/useRequireOnline.ts
//
// Shared guard for anything that mutates server state (submit, post, like,
// delete, edit, create, upload, manual refresh, etc.). Call `requireOnline()`
// at the top of the action handler; if the app is offline it shows a
// friendly, consistent message and returns `false` so the caller can bail
// out *before* attempting a network request that would just fail/hang.
//
// Usage:
//   const { requireOnline } = useRequireOnline();
//   const onSubmit = async () => {
//     if (!requireOnline()) return;
//     await doMutation();
//   };
import { useCallback } from "react";
import { toast } from "sonner-native";

import { useNetwork } from "@/contexts/NetworkContext";

const DEFAULT_MESSAGE =
  "This action needs an internet connection. Please check your connection and try again.";

export function useRequireOnline() {
  const { isOnline } = useNetwork();

  const requireOnline = useCallback(
    (message: string = DEFAULT_MESSAGE): boolean => {
      if (!isOnline) {
        toast.error(message);
        return false;
      }
      return true;
    },
    [isOnline],
  );

  return { isOnline, requireOnline };
}
