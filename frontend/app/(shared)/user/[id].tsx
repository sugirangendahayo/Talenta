// app/(shared)/user/[id].tsx
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useLocalSearchParams, useRouter, Stack } from "expo-router";
import { supabase } from "@/lib/supabase";
import { MaterialIcons, Ionicons } from "@expo/vector-icons";
import { ReportModal } from "@/components/moderation/ReportModal";
import { ModerationPanel } from "@/components/admin/ModerationPanel";
import { useAuth } from "@/contexts/AuthContext";
import UserAvatar from "@/components/common/UserAvatar";
import { useTranslation } from "react-i18next";

// ── Status presentation — same pattern as ApplicationCard / EmployerJobsList ──
const ACCOUNT_STATUS_META: Record<
  string,
  { badgeBg: string; badgeText: string; dotClass: string; accentHex: string }
> = {
  active: {
    badgeBg:   "bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800",
    badgeText: "text-emerald-700 dark:text-emerald-400",
    dotClass:  "bg-emerald-500",
    accentHex: "#059669",
  },
  suspended: {
    badgeBg:   "bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800",
    badgeText: "text-amber-700 dark:text-amber-400",
    dotClass:  "bg-amber-500",
    accentHex: "#D97706",
  },
  under_review: {
    badgeBg:   "bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800",
    badgeText: "text-amber-700 dark:text-amber-400",
    dotClass:  "bg-amber-400",
    accentHex: "#D97706",
  },
  banned: {
    badgeBg:   "bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800",
    badgeText: "text-red-700 dark:text-red-400",
    dotClass:  "bg-red-500",
    accentHex: "#DC2626",
  },
};
const DEFAULT_STATUS_META = ACCOUNT_STATUS_META.active;

export default function UserProfileScreen() {
  const { id, role } = useLocalSearchParams<{ id: string; role?: string }>();
  const { t } = useTranslation("profile");
  const router = useRouter();
  const { user: currentUser, profile: currentProfile, role: currentRole } = useAuth();

  const [profileData, setProfileData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [reportModalVisible, setReportModalVisible] = useState(false);
  const [accountStatus, setAccountStatus] = useState<
    "active" | "suspended" | "banned" | "under_review"
  >("active");

  useEffect(() => {
    fetchProfile();
  }, [id]);

  const fetchProfile = async () => {
    if (!id) return;
    setLoading(true);
    try {
      let targetRole = role;
      let status = "active";

      if (!targetRole) {
        const { data: baseProfile } = await supabase
          .from("profiles")
          .select("role, account_status")
          .eq("id", id)
          .single();
        if (baseProfile) {
          targetRole = baseProfile.role;
          status = baseProfile.account_status || "active";
        }
      }

      setAccountStatus(status as any);

      if (targetRole === "employer") {
        const { data, error } = await supabase
          .from("employer_profiles")
          .select("*")
          .eq("id", id)
          .single();
        if (error) throw error;
        setProfileData({ ...data, role: "employer" });
        if (data?.account_status) setAccountStatus(data.account_status);
      } else {
        const { data, error } = await supabase
          .from("jobseeker_profiles")
          .select("*")
          .eq("id", id)
          .single();
        if (error) throw error;
        setProfileData({ ...data, role: "jobseeker" });
        if (data?.account_status) setAccountStatus(data.account_status);
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
      Alert.alert("Error", "Failed to load user profile.");
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const handleBlockUser = async () => {
    Alert.alert(
      "Block User",
      "Are you sure you want to block this user? You will no longer see their content.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Block",
          style: "destructive",
          onPress: async () => {
            try {
              if (!currentUser) return;
              const { error } = await supabase.from("user_blocks").insert({
                blocker_id: currentUser.id,
                blocked_id: id,
              });
              if (error) throw error;
              Alert.alert("User Blocked", "You have successfully blocked this user.");
              router.back();
            } catch (err: any) {
              if (err.code === "23505") {
                Alert.alert("Already Blocked", "You have already blocked this user.");
              } else {
                Alert.alert("Error", "Failed to block user.");
              }
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50 dark:bg-[#080A08]">
        <ActivityIndicator size="large" color="#0E7490" />
      </View>
    );
  }

  if (!profileData) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50 dark:bg-[#080A08] px-8">
        <View className="w-20 h-20 rounded-full bg-gray-50 dark:bg-[#141414] items-center justify-center mb-5">
          <Ionicons name="person-outline" size={36} color="#9CA3AF" />
        </View>
        <Text className="text-xl font-quicksandBold text-gray-800 dark:text-gray-100 text-center">
          User not found
        </Text>
        <Text className="text-gray-400 dark:text-gray-500 font-quicksandMedium text-sm mt-2 text-center leading-5">
          This profile may have been removed.
        </Text>
        <TouchableOpacity
          onPress={() => router.back()}
          activeOpacity={0.85}
          className="mt-6 bg-cyan-700 px-6 py-3 rounded-2xl"
        >
          <Text className="text-white font-quicksandBold">Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const isEmployer = profileData.role === "employer";
  const displayName = isEmployer
    ? profileData.company_name || "Employer"
    : `${profileData.first_name || ""} ${profileData.last_name || ""}`.trim() || "User";

  const isOwnProfile = currentUser?.id === id;
  const isAdmin = currentRole === "admin" || currentProfile?.role === "admin";
  const showReportBlock = !isAdmin && !isOwnProfile;

  const statusMeta = ACCOUNT_STATUS_META[accountStatus] ?? DEFAULT_STATUS_META;
  const statusLabel = accountStatus.replace("_", " ");

  return (
    <View className="flex-1 bg-gray-50 dark:bg-[#080A08]">
      <Stack.Screen
        options={{
          title: isEmployer ? "Company Profile" : "User Profile",
          headerRight: () =>
            showReportBlock ? (
              <View style={{ flexDirection: "row", gap: 16, marginRight: 16 }}>
                <TouchableOpacity
                  onPress={() => setReportModalVisible(true)}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Ionicons name="flag-outline" size={22} color="#EF4444" />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleBlockUser}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Ionicons name="ban-outline" size={22} color="#6B7280" />
                </TouchableOpacity>
              </View>
            ) : null,
        }}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 16, paddingBottom: 48 }}
      >
        {/* ── Profile header card ──────────────────────────────────────── */}
        <View
          className="bg-white dark:bg-[#0E0E0E] rounded-2xl p-6 mb-3 items-center border border-gray-100 dark:border-[#222]"
          style={{
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.04,
            shadowRadius: 4,
            elevation: 2,
          }}
        >
          <UserAvatar
            imageUrl={profileData.profile_image_url}
            name={displayName}
            size={88}
            style={{ marginBottom: 12 }}
          />

          <Text className="text-xl font-quicksandBold text-gray-900 dark:text-gray-100 text-center">
            {displayName}
          </Text>

          {/* Verified employer badge */}
          {isEmployer &&
            profileData.business_verification_status === "approved" &&
            profileData.premium_plan &&
            profileData.premium_plan !== "free" && (
              <View className="flex-row items-center gap-1.5 bg-cyan-50 dark:bg-cyan-900/20 border border-cyan-100 dark:border-cyan-800 px-3 py-1.5 rounded-full mt-2">
                <MaterialIcons name="verified" size={13} color="#0E7490" />
                <Text className="text-cyan-700 dark:text-cyan-400 font-quicksandBold text-xs">
                  Verified Employer
                </Text>
              </View>
            )}

          {/* Location */}
          {(profileData.city || profileData.country) && (
            <View className="flex-row items-center gap-1 mt-2.5">
              <Ionicons name="location-outline" size={13} color="#9CA3AF" />
              <Text className="text-gray-400 dark:text-gray-500 font-quicksandMedium text-xs">
                {[profileData.city, profileData.country].filter(Boolean).join(", ")}
              </Text>
            </View>
          )}

          {/* Account status — shown to admins or when not active */}
          {(isAdmin || accountStatus !== "active") && (
            <View className={`flex-row items-center gap-1.5 mt-3 px-3 py-1.5 rounded-full ${statusMeta.badgeBg}`}>
              <View
                style={{ width: 6, height: 6, borderRadius: 3 }}
                className={statusMeta.dotClass}
              />
              <Text className={`text-xs font-quicksandBold capitalize ${statusMeta.badgeText}`}>
                {statusLabel}
              </Text>
            </View>
          )}
        </View>

        {/* ── About / Details card ─────────────────────────────────────── */}
        <View
          className="bg-white dark:bg-[#0E0E0E] rounded-2xl p-5 mb-3 border border-gray-100 dark:border-[#222]"
          style={{
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.04,
            shadowRadius: 4,
            elevation: 2,
          }}
        >
          <Text className="text-sm font-quicksandBold text-gray-800 dark:text-gray-100 mb-4">
            {isEmployer ? "Company Info" : "About"}
          </Text>

          {isEmployer ? (
            <View style={{ gap: 12 }}>
              {profileData.company_website ? (
                <View className="flex-row items-center gap-3">
                  <View className="w-8 h-8 rounded-xl bg-cyan-50 dark:bg-cyan-900/20 items-center justify-center">
                    <Ionicons name="globe-outline" size={15} color="#0E7490" />
                  </View>
                  <Text className="text-gray-600 dark:text-gray-400 font-quicksandMedium text-sm flex-1">
                    {profileData.company_website}
                  </Text>
                </View>
              ) : null}
              {profileData.company_address ? (
                <View className="flex-row items-center gap-3">
                  <View className="w-8 h-8 rounded-xl bg-cyan-50 dark:bg-cyan-900/20 items-center justify-center">
                    <Ionicons name="business-outline" size={15} color="#0E7490" />
                  </View>
                  <Text className="text-gray-600 dark:text-gray-400 font-quicksandMedium text-sm flex-1">
                    {profileData.company_address}
                  </Text>
                </View>
              ) : null}
              {profileData.phone ? (
                <View className="flex-row items-center gap-3">
                  <View className="w-8 h-8 rounded-xl bg-cyan-50 dark:bg-cyan-900/20 items-center justify-center">
                    <Ionicons name="call-outline" size={15} color="#0E7490" />
                  </View>
                  <Text className="text-gray-600 dark:text-gray-400 font-quicksandMedium text-sm">
                    {profileData.phone}
                  </Text>
                </View>
              ) : null}
              {!profileData.company_website && !profileData.company_address && !profileData.phone && (
                <Text className="text-gray-400 dark:text-gray-500 font-quicksandMedium text-sm">
                  No additional info provided.
                </Text>
              )}
            </View>
          ) : (
            <View style={{ gap: 12 }}>
              {profileData.experience_level ? (
                <View className="flex-row items-center gap-3">
                  <View className="w-8 h-8 rounded-xl bg-cyan-50 dark:bg-cyan-900/20 items-center justify-center">
                    <Ionicons name="briefcase-outline" size={15} color="#0E7490" />
                  </View>
                  <Text className="text-gray-600 dark:text-gray-400 font-quicksandMedium text-sm">
                    {profileData.experience_level}
                  </Text>
                </View>
              ) : null}
              {profileData.education_level ? (
                <View className="flex-row items-center gap-3">
                  <View className="w-8 h-8 rounded-xl bg-cyan-50 dark:bg-cyan-900/20 items-center justify-center">
                    <Ionicons name="school-outline" size={15} color="#0E7490" />
                  </View>
                  <Text className="text-gray-600 dark:text-gray-400 font-quicksandMedium text-sm">
                    {profileData.education_level}
                  </Text>
                </View>
              ) : null}

              {profileData.skills && profileData.skills.length > 0 && (
                <View>
                  {/* Replaced all-caps "SKILLS" label with standard section label */}
                  <Text className="text-xs font-quicksandMedium text-gray-400 dark:text-gray-500 mb-2 mt-1">
                    Skills
                  </Text>
                  <View className="flex-row flex-wrap gap-2">
                    {profileData.skills.map((skill: string, index: number) => (
                      <View
                        key={index}
                        className="bg-gray-100 dark:bg-[#1a1a1a] border border-gray-200 dark:border-[#2a2a2a] px-3 py-1.5 rounded-full"
                      >
                        <Text className="text-gray-700 dark:text-gray-300 text-xs font-quicksandMedium">
                          {skill}
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}

              {!profileData.experience_level && !profileData.education_level && (
                <Text className="text-gray-400 dark:text-gray-500 font-quicksandMedium text-sm">
                  No additional info provided.
                </Text>
              )}
            </View>
          )}
        </View>

        {/* ── Admin moderation panel ───────────────────────────────────── */}
        {isAdmin && (
          <ModerationPanel
            targetUserId={id as string}
            targetRole={profileData.role}
            currentStatus={accountStatus}
            onStatusChange={setAccountStatus}
          />
        )}
      </ScrollView>

      <ReportModal
        visible={reportModalVisible}
        onClose={() => setReportModalVisible(false)}
        targetId={id as string}
        targetType="user"
      />
    </View>
  );
}