// app/(jobseekers)/notifications.tsx
import React from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useTranslation } from "react-i18next";
import { useNotifications, Notification } from "@/hooks/useNotifications";

export default function NotificationsScreen() {
  const {
    notifications,
    unreadCount,
    isLoading,
    error,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    refetch,
  } = useNotifications();
  const { t } = useTranslation(["common", "jobs"]);

  const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const getNotificationIcon = (type: Notification["type"]) => {
    switch (type) {
      case "application_shortlisted":
        return { name: "checkmark-circle" as const, color: "#10B981" };
      case "application_hired":
        return { name: "trophy" as const, color: "#F59E0B" };
      case "application_rejected":
        return { name: "close-circle" as const, color: "#EF4444" };
      case "interview_scheduled":
        return { name: "calendar" as const, color: "#3B82F6" };
      case "interview_updated":
        return { name: "time" as const, color: "#8B5CF6" };
      case "new_application":
        return { name: "briefcase" as const, color: "#0E7490" };
      default:
        return { name: "notifications" as const, color: "#6B7280" };
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return t("jobs:time.justNow", { defaultValue: "Just now" });
    if (seconds < 3600) return t("jobs:time.minutesAgo", { count: Math.floor(seconds / 60), defaultValue: `${Math.floor(seconds / 60)}m ago` });
    if (seconds < 86400) return t("jobs:time.hoursAgo", { count: Math.floor(seconds / 3600), defaultValue: `${Math.floor(seconds / 3600)}h ago` });
    if (seconds < 604800) return t("jobs:time.daysAgo", { days: Math.floor(seconds / 86400), defaultValue: `${Math.floor(seconds / 86400)}d ago` });
    return date.toLocaleDateString();
  };

  const handleNotificationPress = async (notification: Notification) => {
    // Mark as read
    if (!notification.is_read) {
      await markAsRead(notification.id);
    }

    // Navigate based on type
    if (notification.application_id) {
      router.push({
        pathname: "/(jobseeker-tabs)/jobseekers/Applications",
      });
    }
  };

  const renderNotification = ({ item }: { item: Notification }) => {
    const icon = getNotificationIcon(item.type);

    return (
      <TouchableOpacity
        onPress={() => handleNotificationPress(item)}
        className={`mx-4 mb-3 p-4 rounded-2xl border ${
          item.is_read
            ? "bg-white dark:bg-[#080A08] border-gray-200 dark:border-[#2a2a2a]"
            : "bg-cyan-50 border-cyan-200"
        }`}
        style={{
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.05,
          shadowRadius: 2,
        }}
      >
        <View className="flex-row">
          {/* Icon */}
          <View
            className="w-12 h-12 rounded-full items-center justify-center mr-3"
            style={{ backgroundColor: `${icon.color}15` }}
          >
            <Ionicons name={icon.name} size={24} color={icon.color} />
          </View>

          {/* Content */}
          <View className="flex-1">
            <View className="flex-row items-start justify-between mb-1">
              <Text className="flex-1 font-quicksandBold text-base text-gray-900 dark:text-gray-100">
                {item.title}
              </Text>
              {!item.is_read && (
                <View className="w-2 h-2 bg-cyan-600 rounded-full ml-2 mt-2" />
              )}
            </View>

            <Text className="font-quicksandMedium text-sm text-gray-600 dark:text-gray-400 mb-2">
              {item.message}
            </Text>

            {/* Job info */}
            {item.data?.job_title && (
              <View className="flex-row items-center mb-2">
                <Ionicons name="briefcase-outline" size={14} color="#6B7280" />
                <Text className="ml-1 font-quicksandMedium text-xs text-gray-500 dark:text-gray-400">
                  {item.data.job_title}
                  {item.data.company_name && ` • ${item.data.company_name}`}
                </Text>
              </View>
            )}

            {/* Time */}
            <Text className="font-quicksandMedium text-xs text-gray-400">
              {formatTimeAgo(item.created_at)}
            </Text>
          </View>

          {/* Delete button */}
          <TouchableOpacity
            onPress={() => deleteNotification(item.id)}
            className="ml-2 p-2"
          >
            <Ionicons name="trash-outline" size={18} color="#9CA3AF" />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => (
    <View className="flex-1 items-center justify-center px-6 py-20">
      <View
        className="w-24 h-24 rounded-full bg-gray-100 dark:bg-[#141414] items-center justify-center mb-6"
        style={{
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
        }}
      >
        <Ionicons name="notifications-off-outline" size={48} color="#9CA3AF" />
      </View>
      <Text className="font-quicksandBold text-xl text-gray-900 dark:text-gray-100 mb-2">
        {t("common:notificationsScreen.emptyTitle", { defaultValue: "No Notifications Yet" })}
      </Text>
      <Text className="font-quicksandMedium text-sm text-gray-500 dark:text-gray-400 text-center">
        {t("common:notificationsScreen.emptyMessage", { defaultValue: "When you receive updates about your applications, they'll appear here." })}
      </Text>
    </View>
  );

  if (error) {
    return (
      <SafeAreaView className="flex-1 bg-white dark:bg-[#080A08]">
        <View className="flex-1 items-center justify-center px-6">
          <Ionicons name="alert-circle-outline" size={64} color="#EF4444" />
          <Text className="font-quicksandBold text-xl text-gray-900 dark:text-gray-100 mt-4 mb-2">
            {t("common:messages.somethingWentWrong", { defaultValue: "Something went wrong. Please try again." })}
          </Text>
          <Text className="font-quicksandMedium text-sm text-gray-500 dark:text-gray-400 text-center mb-6">
            {error}
          </Text>
          <TouchableOpacity
            onPress={refetch}
            className="px-6 py-3 bg-cyan-700 dark:bg-cyan-800 rounded-xl"
          >
            <Text className="font-quicksandBold text-white">{t("common:buttons.retry", { defaultValue: "Try Again" })}</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-[#080A08]">
      {/* Header */}
      <View className="bg-white dark:bg-[#080A08] border-b border-gray-200 dark:border-[#2a2a2a] px-4 py-4">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center">
            <TouchableOpacity onPress={() => router.back()} className="mr-3">
              <Ionicons name="arrow-back" size={24} color="#111827" />
            </TouchableOpacity>
            <View>
              <Text className="font-quicksandBold text-2xl text-gray-900 dark:text-gray-100">
                {t("common:notificationsScreen.title", { defaultValue: "Notifications" })}
              </Text>
              {unreadCount > 0 && (
                <Text className="font-quicksandMedium text-sm text-cyan-600 dark:text-cyan-400">
                  {t("common:notificationsScreen.unreadCount", { count: unreadCount, defaultValue: `${unreadCount} unread` })}
                </Text>
              )}
            </View>
          </View>

          {/* Mark all as read */}
          {unreadCount > 0 && (
            <TouchableOpacity
              onPress={markAllAsRead}
              className="px-4 py-2 bg-cyan-50 rounded-lg"
            >
              <Text className="font-quicksandBold text-sm text-cyan-700">
                {t("common:notificationsScreen.markAllRead", { defaultValue: "Mark all read" })}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Notifications List */}
      {isLoading && notifications.length === 0 ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#0E7490" />
          <Text className="font-quicksandMedium text-gray-500 dark:text-gray-400 mt-4">
            {t("common:notificationsScreen.loading", { defaultValue: "Loading notifications..." })}
          </Text>
        </View>
      ) : (
        <FlatList
          data={notifications}
          renderItem={renderNotification}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{
            paddingTop: 16,
            paddingBottom: 24,
            flexGrow: 1,
          }}
          ListEmptyComponent={renderEmptyState}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#0E7490"
            />
          }
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}
