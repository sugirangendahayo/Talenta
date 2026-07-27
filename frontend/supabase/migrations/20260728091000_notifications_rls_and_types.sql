-- =============================================================================
-- Fix notification deletion/read-state not persisting, and extend types for
-- moderation actions so the affected user can actually be notified.
--
-- Bug: `useNotifications.deleteNotification()` deletes locally (AsyncStorage)
-- and *tries* a DB delete, but silently swallows the failure ("Try database
-- delete, but don't fail if it doesn't work (silent RLS rejection)"). That
-- comment is a tell: there was never a DELETE policy scoping notifications to
-- their owner, so the row survives in the database forever. Any other
-- device/session/reinstall that doesn't have that specific ID in its local
-- AsyncStorage cache sees the "deleted" notification reappear.
-- =============================================================================

drop policy if exists "Users can view their own notifications" on public.notifications;
create policy "Users can view their own notifications"
  on public.notifications for select
  using (auth.uid() = user_id);

drop policy if exists "Users can update their own notifications" on public.notifications;
create policy "Users can update their own notifications"
  on public.notifications for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users can delete their own notifications" on public.notifications;
create policy "Users can delete their own notifications"
  on public.notifications for delete
  using (auth.uid() = user_id);

-- Extend the notification `type` check constraint so moderation actions
-- (ban/unban/suspend/unsuspend/under_review/warning/verification revoked) can
-- actually notify the affected user instead of only leaving an internal
-- audit-trail row that the user never sees.
alter table public.notifications drop constraint if exists notifications_type_check;
alter table public.notifications add constraint notifications_type_check check (
  type::text = any (array[
    'application_shortlisted',
    'application_rejected',
    'application_hired',
    'new_application',
    'interview_scheduled',
    'interview_updated',
    'business_approved',
    'business_rejected',
    'moderation_warning',
    'moderation_suspension',
    'moderation_unsuspended',
    'moderation_banned',
    'moderation_unbanned',
    'moderation_under_review',
    'moderation_verification_revoked'
  ]::text[])
);
