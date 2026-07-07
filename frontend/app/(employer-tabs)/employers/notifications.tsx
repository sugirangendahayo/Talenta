// app/(employer-tabs)/employers/notifications.tsx
import React from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  TextInput,
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
  const [searchQuery, setSearchQuery] = React.useState("");

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  // All icons are neutral gray — the title text carries the meaning,
  // not a green checkmark or red X that reads like phone emojis.
  const getNotificationIcon = (type: Notification["type"]) => {
    switch (type) {
      case "new_application":
        return "document-text-outline" as const;
      case "business_approved":
        return "business-outline" as const;
      case "business_rejected":
        return "business-outline" as const;
      default:
        return "notifications-outline" as const;
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60)
      return t("jobs:time.justNow", { defaultValue: "Just now" });
    if (seconds < 3600)
      return t("jobs:time.minutesAgo", {
        count: Math.floor(seconds / 60),
        defaultValue: `${Math.floor(seconds / 60)}m ago`,
      });
    if (seconds < 86400)
      return t("jobs:time.hoursAgo", {
        count: Math.floor(seconds / 3600),
        defaultValue: `${Math.floor(seconds / 3600)}h ago`,
      });
    if (seconds < 604800)
      return t("jobs:time.daysAgo", {
        days: Math.floor(seconds / 86400),
        defaultValue: `${Math.floor(seconds / 86400)}d ago`,
      });
    return date.toLocaleDateString();
  };

  const handleNotificationPress = async (notification: Notification) => {
    if (!notification.is_read) {
      await markAsRead(notification.id);
    }
    if (notification.type === "new_application") {
      router.push({ pathname: "/(employer-tabs)/employers/Applicants" });
    } else if (
      notification.type === "business_approved" ||
      notification.type === "business_rejected"
    ) {
      router.push({ pathname: "/(employer-tabs)/employers/Profile" });
    }
  };

  const filteredNotifications = React.useMemo(() => {
    if (!searchQuery) return notifications;
    const q = searchQuery.toLowerCase();
    return notifications.filter(
      (n) =>
        n.title.toLowerCase().includes(q) ||
        n.message.toLowerCase().includes(q) ||
        n.data?.company_name?.toLowerCase().includes(q) ||
        n.data?.job_title?.toLowerCase().includes(q)
    );
  }, [notifications, searchQuery]);

  const renderNotification = ({ item }: { item: Notification }) => {
    const iconName = getNotificationIcon(item.type);

    return (
      <TouchableOpacity
        onPress={() => handleNotificationPress(item)}
        activeOpacity={0.75}
        className={`mx-4 mb-3 p-4 rounded-2xl border ${
          item.is_read
            ? "bg-white dark:bg-[#0E0E0E] border-gray-100 dark:border-[#1f1f1f]"
            : "bg-cyan-50 dark:bg-cyan-900/10 border-cyan-100 dark:border-cyan-800/30"
        }`}
      >
        <View className="flex-row items-start">
          {/* Icon container — always neutral, no color-coding */}
          <View className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-[#1a1a1a] items-center justify-center mr-3 mt-0.5 flex-shrink-0">
            <Ionicons name={iconName} size={18} color="#6B7280" />
          </View>

          {/* Content */}
          <View className="flex-1">
            <View className="flex-row items-start justify-between mb-0.5" style={{ gap: 8 }}>
              <Text
                className="font-quicksandBold text-sm text-gray-800 dark:text-gray-100 flex-1"
                numberOfLines={2}
              >
                {item.title}
              </Text>
              {/* Unread dot — top right, not competing with the title */}
              {!item.is_read && (
                <View className="w-1.5 h-1.5 bg-cyan-600 rounded-full mt-1.5 flex-shrink-0" />
              )}
            </View>

            <Text className="font-quicksandMedium text-xs text-gray-500 dark:text-gray-400 leading-5 mb-2">
              {item.message}
            </Text>

            {/* Job meta — only when present */}
            {(item.data?.job_title || item.data?.applicant_name) && (
              <View className="flex-row items-center flex-wrap mb-1.5" style={{ gap: 4 }}>
                {item.data?.job_title && (
                  <Text className="font-quicksandMedium text-xs text-gray-400 dark:text-gray-500">
                    {item.data.job_title}
                  </Text>
                )}
                {item.data?.job_title && item.data?.applicant_name && (
                  <Text className="font-quicksandMedium text-xs text-gray-300 dark:text-gray-600">
                    ·
                  </Text>
                )}
                {item.data?.applicant_name && (
                  <Text className="font-quicksandMedium text-xs text-gray-400 dark:text-gray-500">
                    {item.data.applicant_name}
                  </Text>
                )}
              </View>
            )}

            <Text className="font-quicksandMedium text-[11px] text-gray-400 dark:text-gray-500">
              {formatTimeAgo(item.created_at)}
            </Text>
          </View>

          {/* Delete */}
          <TouchableOpacity
            onPress={() => deleteNotification(item.id)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            className="ml-2 mt-0.5 flex-shrink-0"
          >
            <Ionicons name="trash-outline" size={16} color="#D1D5DB" />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => (
    <View className="flex-1 items-center justify-center px-6 py-20">
      <View className="w-20 h-20 rounded-full bg-gray-100 dark:bg-[#141414] items-center justify-center mb-5">
        <Ionicons name="notifications-off-outline" size={36} color="#9CA3AF" />
      </View>
      <Text className="font-quicksandBold text-xl text-gray-800 dark:text-gray-100 text-center mb-2">
        {t("common:notificationsScreen.emptyTitle", {
          defaultValue: "No Notifications Yet",
        })}
      </Text>
      <Text className="font-quicksandMedium text-sm text-gray-500 dark:text-gray-400 text-center leading-5 px-4">
        {t("common:notificationsScreen.emptyMessage", {
          defaultValue:
            "Updates about your applications will appear here.",
        })}
      </Text>
    </View>
  );

  if (error) {
    return (
      <SafeAreaView className="flex-1 bg-white dark:bg-[#080A08]">
        <View className="flex-1 items-center justify-center px-6">
          <Ionicons name="alert-circle-outline" size={48} color="#9CA3AF" />
          <Text className="font-quicksandBold text-lg text-gray-800 dark:text-gray-100 mt-4 mb-2 text-center">
            {t("common:messages.somethingWentWrong", {
              defaultValue: "Something went wrong",
            })}
          </Text>
          <Text className="font-quicksandMedium text-sm text-gray-500 dark:text-gray-400 text-center mb-6">
            {error}
          </Text>
          <TouchableOpacity
            onPress={refetch}
            className="px-6 py-3 bg-cyan-700 rounded-xl"
          >
            <Text className="font-quicksandBold text-white text-sm">
              {t("common:buttons.retry", { defaultValue: "Try Again" })}
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-[#080A08]">
      {/* ── Header ─────────────────────────────────────────────────────────
          Layout: back button + title stack on one row, mark-all button
          lives BELOW as a standalone line so long locale strings never
          collide. Search sits in its own row beneath that.              */}
      <View className="bg-white dark:bg-[#080A08] border-b border-gray-100 dark:border-[#2a2a2a] px-4 pt-4 pb-3">

        {/* Row 1: back + title */}
        <View className="flex-row items-center mb-3" style={{ gap: 10 }}>
          <TouchableOpacity
            onPress={() => router.back()}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            className="w-9 h-9 rounded-full bg-gray-100 dark:bg-[#1a1a1a] items-center justify-center flex-shrink-0"
          >
            <Ionicons name="arrow-back" size={18} color="#374151" />
          </TouchableOpacity>

          <View className="flex-1">
            <Text className="font-quicksandBold text-2xl text-gray-800 dark:text-gray-100">
              {t("common:notificationsScreen.title", {
                defaultValue: "Notifications",
              })}
            </Text>
            {unreadCount > 0 && (
              <Text className="font-quicksandMedium text-xs text-cyan-600 dark:text-cyan-400 mt-0.5">
                {t("common:notificationsScreen.unreadCount", {
                  count: unreadCount,
                  defaultValue: `${unreadCount} unread`,
                })}
              </Text>
            )}
          </View>

          {/* Mark all — icon-only on the right, label tooltip avoided */}
          {unreadCount > 0 && (
            <TouchableOpacity
              onPress={markAllAsRead}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              className="flex-row items-center gap-1.5 px-3 py-1.5 bg-cyan-50 dark:bg-cyan-900/20 rounded-full border border-cyan-100 dark:border-cyan-800/30"
            >
              <Ionicons name="checkmark-done-outline" size={14} color="#0E7490" />
              <Text className="font-quicksandBold text-xs text-cyan-700 dark:text-cyan-400">
                {t("common:notificationsScreen.markAllRead", {
                  defaultValue: "Mark all read",
                })}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Row 2: search */}
        <View className="flex-row items-center bg-gray-50 dark:bg-[#141414] border border-gray-200 dark:border-[#2a2a2a] rounded-2xl px-3.5 py-2.5" style={{ gap: 8 }}>
          <Ionicons name="search-outline" size={16} color="#9CA3AF" />
          <TextInput
            className="flex-1 font-quicksandMedium text-sm text-gray-800 dark:text-gray-100"
            placeholder={t("common:search", {
              defaultValue: "Search notifications…",
            })}
            placeholderTextColor="#9CA3AF"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              onPress={() => setSearchQuery("")}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons name="close-circle" size={16} color="#9CA3AF" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* ── List ─────────────────────────────────────────────────────────── */}
      {isLoading && notifications.length === 0 ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#0E7490" />
          <Text className="font-quicksandMedium text-sm text-gray-500 dark:text-gray-400 mt-4">
            {t("common:notificationsScreen.loading", {
              defaultValue: "Loading notifications…",
            })}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredNotifications}
          renderItem={renderNotification}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{
            paddingTop: 16,
            paddingBottom: 40,
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