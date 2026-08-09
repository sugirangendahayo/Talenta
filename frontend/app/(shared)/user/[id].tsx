// app/(shared)/user/[id].tsx
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Linking,
} from "react-native";
import { useLocalSearchParams, useRouter, Stack } from "expo-router";
import { supabase } from "@/lib/supabase";
import { MaterialIcons, Ionicons } from "@expo/vector-icons";
import { ReportModal } from "@/components/moderation/ReportModal";
import { ModerationPanel } from "@/components/admin/ModerationPanel";
import { useAuth } from "@/contexts/AuthContext";
import UserAvatar from "@/components/common/UserAvatar";
import { useTheme } from "@/contexts/ThemeContext";

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

type CompanyInfoRowProps = {
  icon: React.ComponentProps<typeof Ionicons>["name"];
  value: string;
  accessibilityLabel: string;
  accessibilityHint: string;
  iconColor: string;
  onPress: () => void;
};

function CompanyInfoRow({
  icon,
  value,
  accessibilityLabel,
  accessibilityHint,
  iconColor,
  onPress,
}: CompanyInfoRowProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      accessibilityRole="link"
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint}
      className="flex-row items-center py-1"
    >
      <Ionicons name={icon} size={17} color={iconColor} />
      <Text
        numberOfLines={1}
        ellipsizeMode="tail"
        className="flex-1 ml-3 text-gray-700 dark:text-gray-300 font-quicksandMedium text-sm"
      >
        {value}
      </Text>
      <Ionicons name="chevron-forward-outline" size={16} color={iconColor} />
    </TouchableOpacity>
  );
}

function getTextValue(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmedValue = value.trim();
  return trimmedValue || null;
}

function getWebsiteUrl(website: string): string | null {
  if (/^https?:\/\//i.test(website)) return website;
  if (/^[a-z][a-z\d+.-]*:/i.test(website)) return null;
  return `https://${website}`;
}

function getPhoneUrl(phone: string): string | null {
  const dialableNumber = phone.replace(/[^\d+*#]/g, "");
  return dialableNumber ? `tel:${dialableNumber}` : null;
}

function getEmailUrl(email: string): string | null {
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return null;
  return `mailto:${encodeURIComponent(email)}`;
}

async function openExternalUrl(url: string | null) {
  if (!url) return;

  try {
    if (await Linking.canOpenURL(url)) {
      await Linking.openURL(url);
    }
  } catch (error) {
    console.warn("Could not open company contact link:", error);
  }
}

export default function UserProfileScreen() {
  const { id, role } = useLocalSearchParams<{ id: string; role?: string }>();
  const router = useRouter();
  const { isDark } = useTheme();
  const { user: currentUser, role: currentRole } = useAuth();

  const [profileData, setProfileData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [reportModalVisible, setReportModalVisible] = useState(false);
  const [accountStatus, setAccountStatus] = useState<
    "active" | "suspended" | "banned" | "under_review"
  >("active");

  useEffect(() => {
    fetchProfile();
    // fetchProfile intentionally stays local to this screen; rerun when the
    // viewer's role changes so admins retain their moderation view.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, role, currentRole]);

  const fetchProfile = async () => {
    if (!id) return;
    setLoading(true);
    try {
      // Other users' profile rows are protected by RLS. This RPC returns only
      // the public fields shown on this screen and also works before sign-in.
      if (currentRole !== "admin") {
        const { data, error } = await supabase.rpc("get_public_user_profile", {
          p_user_id: id,
        });
        if (error) throw error;

        setProfileData(data ?? null);
        setAccountStatus("active");
        return;
      }

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
    : profileData.full_name || "User";
  const handle = isEmployer
    ? profileData.company_username
    : profileData.username;

  const isOwnProfile = currentUser?.id === id;
  const isAdmin = currentRole === "admin";
  const showReportBlock = !!currentUser && !isAdmin && !isOwnProfile;

  const statusMeta = ACCOUNT_STATUS_META[accountStatus] ?? DEFAULT_STATUS_META;
  const statusLabel = accountStatus.replace("_", " ");
  const companyInfoIconColor = isDark ? "#9CA3AF" : "#6B7280";
  const companyWebsite = getTextValue(profileData.company_website);
  const companyAddress = getTextValue(profileData.company_address);
  const companyPhone = getTextValue(profileData.phone);
  const companyEmail = getTextValue(profileData.email);

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

          {/* @username / @company_username */}
          {handle ? (
            <Text className="text-cyan-600 dark:text-cyan-400 font-quicksandSemibold text-sm mt-0.5 text-center">
              @{handle}
            </Text>
          ) : null}

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

          {/* Verified jobseeker badge (premium/professional plan) */}
          {!isEmployer && profileData.premium_plan === "professional" && (
            <View className="flex-row items-center gap-1.5 bg-cyan-50 dark:bg-cyan-900/20 border border-cyan-100 dark:border-cyan-800 px-3 py-1.5 rounded-full mt-2">
              <MaterialIcons name="verified" size={13} color="#0E7490" />
              <Text className="text-cyan-700 dark:text-cyan-400 font-quicksandBold text-xs">
                Verified
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
              {companyWebsite ? (
                <CompanyInfoRow
                  icon="globe-outline"
                  value={companyWebsite}
                  iconColor={companyInfoIconColor}
                  accessibilityLabel={`Open company website: ${companyWebsite}`}
                  accessibilityHint="Opens the company website in your browser"
                  onPress={() => void openExternalUrl(getWebsiteUrl(companyWebsite))}
                />
              ) : null}
              {companyAddress ? (
                <CompanyInfoRow
                  icon="location-outline"
                  value={companyAddress}
                  iconColor={companyInfoIconColor}
                  accessibilityLabel={`Open company address in maps: ${companyAddress}`}
                  accessibilityHint="Searches for the company address in maps"
                  onPress={() =>
                    void openExternalUrl(
                      `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(companyAddress)}`
                    )
                  }
                />
              ) : null}
              {companyPhone ? (
                <CompanyInfoRow
                  icon="call-outline"
                  value={companyPhone}
                  iconColor={companyInfoIconColor}
                  accessibilityLabel={`Call company: ${companyPhone}`}
                  accessibilityHint="Opens your phone app"
                  onPress={() => void openExternalUrl(getPhoneUrl(companyPhone))}
                />
              ) : null}
              {companyEmail ? (
                <CompanyInfoRow
                  icon="mail-outline"
                  value={companyEmail}
                  iconColor={companyInfoIconColor}
                  accessibilityLabel={`Email company: ${companyEmail}`}
                  accessibilityHint="Opens your mail app"
                  onPress={() => void openExternalUrl(getEmailUrl(companyEmail))}
                />
              ) : null}
              {!companyWebsite && !companyAddress && !companyPhone && !companyEmail && (
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
