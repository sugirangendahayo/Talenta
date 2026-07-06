import UserAvatar from "@/components/common/UserAvatar";
import { ProfileFormSkeleton } from "@/components/skeletons/ProfileFormSkeleton";
import { useAuth } from "@/contexts/AuthContext";
import { useEmployerProfileCompletion } from "@/hooks/useEmployerProfileCompletion";
import { useProfileImage } from "@/hooks/useProfileImage";
import { EmployerProfile } from "@/lib/supabase";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  FlatList,
  Modal,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import KeyboardWrapper from "@/components/common/KeyboardWrapper";

// ─── Countries ────────────────────────────────────────────────────────────────

const COUNTRIES = [
  { code: "RW", name: "Rwanda", dialCode: "+250", flag: "🇷🇼" },
  { code: "UG", name: "Uganda", dialCode: "+256", flag: "🇺🇬" },
  { code: "KE", name: "Kenya", dialCode: "+254", flag: "🇰🇪" },
  { code: "TZ", name: "Tanzania", dialCode: "+255", flag: "🇹🇿" },
  { code: "BI", name: "Burundi", dialCode: "+257", flag: "🇧🇮" },
  { code: "CD", name: "DR Congo", dialCode: "+243", flag: "🇨🇩" },
  { code: "NG", name: "Nigeria", dialCode: "+234", flag: "🇳🇬" },
  { code: "ZA", name: "South Africa", dialCode: "+27", flag: "🇿🇦" },
  { code: "ET", name: "Ethiopia", dialCode: "+251", flag: "🇪🇹" },
  { code: "GH", name: "Ghana", dialCode: "+233", flag: "🇬🇭" },
  { code: "US", name: "United States", dialCode: "+1", flag: "🇺🇸" },
  { code: "GB", name: "United Kingdom", dialCode: "+44", flag: "🇬🇧" },
  { code: "FR", name: "France", dialCode: "+33", flag: "🇫🇷" },
  { code: "DE", name: "Germany", dialCode: "+49", flag: "🇩🇪" },
  { code: "IN", name: "India", dialCode: "+91", flag: "🇮🇳" },
  { code: "CN", name: "China", dialCode: "+86", flag: "🇨🇳" },
  { code: "BR", name: "Brazil", dialCode: "+55", flag: "🇧🇷" },
  { code: "CA", name: "Canada", dialCode: "+1", flag: "🇨🇦" },
  { code: "AU", name: "Australia", dialCode: "+61", flag: "🇦🇺" },
  { code: "AE", name: "UAE", dialCode: "+971", flag: "🇦🇪" },
];

type Country = (typeof COUNTRIES)[number];

// ─── Phone input ──────────────────────────────────────────────────────────────

function PhoneInputField({
  value,
  onChange,
}: {
  value: string;
  onChange: (fullNumber: string) => void;
}) {
  const [selectedCountry, setSelectedCountry] = useState<Country>(COUNTRIES[0]);
  const [nationalNumber, setNationalNumber] = useState("");
  const [showPicker, setShowPicker] = useState(false);
  const [search, setSearch] = useState("");

  const filteredCountries = COUNTRIES.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.dialCode.includes(search),
  );

  const handleNumberChange = (text: string) => {
    const cleaned = text.replace(/[^0-9]/g, "");
    setNationalNumber(cleaned);
    onChange(`${selectedCountry.dialCode}${cleaned}`);
  };

  const handleCountrySelect = (country: Country) => {
    setSelectedCountry(country);
    setShowPicker(false);
    setSearch("");
    onChange(`${country.dialCode}${nationalNumber}`);
  };

  return (
    <>
      <View className="flex-row rounded-2xl overflow-hidden border border-gray-200 dark:border-[#2a2a2a] bg-gray-50 dark:bg-[#141414]">
        <TouchableOpacity
          onPress={() => setShowPicker(true)}
          className="flex-row items-center px-3 py-3.5 gap-1.5 border-r border-gray-200 dark:border-[#2a2a2a]"
          activeOpacity={0.7}
        >
          <Text style={{ fontSize: 18 }}>{selectedCountry.flag}</Text>
          <Text className="font-quicksandBold text-sm text-gray-800 dark:text-gray-200">
            {selectedCountry.dialCode}
          </Text>
          <Ionicons name="chevron-down" size={13} color="#6B7280" />
        </TouchableOpacity>

        <TextInput
          value={nationalNumber}
          onChangeText={handleNumberChange}
          placeholder="e.g. 78 000 0000"
          placeholderTextColor="#9CA3AF"
          keyboardType="phone-pad"
          className="flex-1 font-quicksandMedium text-sm text-gray-800 dark:text-gray-200 px-3 py-3.5"
        />
      </View>

      <Modal
        visible={showPicker}
        animationType="slide"
        transparent
        onRequestClose={() => setShowPicker(false)}
      >
        <View
          className="flex-1 justify-end"
          style={{ backgroundColor: "rgba(0,0,0,0.4)" }}
        >
          <View
            className="bg-white dark:bg-[#0e0e0e]"
            style={{
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              maxHeight: "70%",
            }}
          >
            <View className="flex-row items-center justify-between px-5 pt-5 pb-3">
              <Text className="font-quicksandBold text-lg text-gray-800 dark:text-gray-100">
                Select Country
              </Text>
              <TouchableOpacity
                onPress={() => setShowPicker(false)}
                className="w-8 h-8 rounded-full bg-gray-100 dark:bg-[#1a1a1a] items-center justify-center"
                activeOpacity={0.7}
              >
                <Ionicons name="close" size={16} color="#374151" />
              </TouchableOpacity>
            </View>

            <View className="mx-5 mb-3 flex-row items-center rounded-xl border border-gray-200 dark:border-[#2a2a2a] bg-gray-50 dark:bg-[#141414] px-3">
              <Ionicons name="search" size={15} color="#9CA3AF" />
              <TextInput
                value={search}
                onChangeText={setSearch}
                placeholder="Search country…"
                placeholderTextColor="#9CA3AF"
                className="flex-1 font-quicksandMedium text-sm text-gray-800 dark:text-gray-200 py-2.5 px-2"
              />
            </View>

            <FlatList
              data={filteredCountries}
              keyExtractor={(item) => item.code}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => handleCountrySelect(item)}
                  className="flex-row items-center px-5 py-3 gap-3"
                  style={{
                    backgroundColor:
                      selectedCountry.code === item.code
                        ? "rgba(14,116,144,0.06)"
                        : "transparent",
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={{ fontSize: 20 }}>{item.flag}</Text>
                  <Text className="flex-1 font-quicksandBold text-sm text-gray-800 dark:text-gray-200">
                    {item.name}
                  </Text>
                  <Text className="font-quicksandMedium text-xs text-gray-400">
                    {item.dialCode}
                  </Text>
                  {selectedCountry.code === item.code && (
                    <Ionicons name="checkmark" size={15} color="#0E7490" />
                  )}
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>
    </>
  );
}

// ─── Primitives ───────────────────────────────────────────────────────────────

function FieldLabel({
  label,
  required,
}: {
  label: string;
  required?: boolean;
}) {
  return (
    <Text className="text-gray-600 dark:text-gray-400 font-quicksandBold text-xs uppercase tracking-wide mb-2">
      {label}
      {required && <Text className="text-cyan-600 dark:text-cyan-400"> *</Text>}
    </Text>
  );
}

function InputField({
  value,
  onChangeText,
  placeholder,
  keyboardType = "default",
}: {
  value: string;
  onChangeText: (t: string) => void;
  placeholder: string;
  keyboardType?: any;
}) {
  return (
    <TextInput
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor="#9CA3AF"
      keyboardType={keyboardType}
      className="rounded-2xl px-4 py-3.5 font-quicksandMedium text-sm text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-[#2a2a2a] bg-gray-50 dark:bg-[#141414]"
    />
  );
}

// A clean section divider — label only, no icon, no card shadow
function SectionLabel({ label }: { label: string }) {
  return (
    <Text className="text-xs font-quicksandBold text-gray-400 dark:text-gray-500 uppercase tracking-wide px-6 mb-3 mt-8">
      {label}
    </Text>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function EmployerCompleteProfileScreen() {
  const router = useRouter();
  const { t } = useTranslation("profile");
  const { user, profile, refreshProfile } = useAuth();
  const {
    loading,
    saving,
    formData,
    completionStatus,
    updateField,
    saveProfile,
  } = useEmployerProfileCompletion();

  const employerProfile = profile as EmployerProfile | null;
  const [localImageUrl, setLocalImageUrl] = useState<string | null>(
    employerProfile?.profile_image_url ?? null,
  );

  const { pickAndUpload, uploading: uploadingPhoto } = useProfileImage(
    user?.id ?? "",
    "employer_profiles",
    async (url) => {
      setLocalImageUrl(url);
      await refreshProfile();
    },
  );

  const handleSave = async () => {
    const success = await saveProfile();
    if (success) {
      await refreshProfile();
      if (completionStatus.isComplete) router.back();
    }
  };

  if (loading) {
    return (
      <SafeAreaView
        className="flex-1 bg-white dark:bg-[#080A08]"
        edges={["top"]}
      >
        <ProfileFormSkeleton />
      </SafeAreaView>
    );
  }

  const pct = completionStatus.completionPercentage;

  return (
    <SafeAreaView
      className="flex-1 bg-gray-50 dark:bg-[#080A08]"
      edges={["top"]}
    >
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <View className="flex-row items-center px-4 py-4 border-b border-gray-100 dark:border-[#1f1f1f] bg-white dark:bg-[#080A08]">
        <TouchableOpacity
          onPress={() => router.back()}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          className="w-9 h-9 rounded-full bg-gray-100 dark:bg-[#1a1a1a] items-center justify-center mr-3"
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={18} color="#374151" />
        </TouchableOpacity>
        <Text className="text-xl font-quicksandBold text-gray-800 dark:text-gray-100 flex-1">
          Complete Profile
        </Text>
        {/* Percentage pill */}
        <View className="bg-gray-100 dark:bg-[#1a1a1a] rounded-full px-3 py-1">
          <Text className="font-quicksandBold text-xs text-gray-600 dark:text-gray-400">
            {pct}%
          </Text>
        </View>
      </View>

      {/* ── Keyboard-aware scroll ───────────────────────────────────────── */}
      <KeyboardWrapper contentStyle={{ paddingBottom: 48 }}>
          {/* ── Progress bar ─────────────────────────────────────────────── */}
          <View className="mx-6 mt-5 mb-2">
            <View className="flex-row items-center justify-between mb-2">
              <Text className="font-quicksandBold text-xs text-gray-400 dark:text-gray-500 uppercase tracking-wide">
                Completion
              </Text>
              <Text className="font-quicksandBold text-xs text-cyan-700 dark:text-cyan-400">
                {pct}%
              </Text>
            </View>
            <View className="h-1.5 bg-gray-200 dark:bg-[#1e1e1e] rounded-full overflow-hidden">
              <View
                className="h-full bg-cyan-700 rounded-full"
                style={{ width: `${pct}%` }}
              />
            </View>
            {completionStatus.missingFields.length > 0 && (
              <Text className="text-gray-400 font-quicksandMedium text-xs mt-2">
                Missing: {completionStatus.missingFields.join(", ")}
              </Text>
            )}
          </View>

          {/* ── Avatar ───────────────────────────────────────────────────── */}
          <View className="items-center pt-6 pb-2">
            <View className="relative">
              <UserAvatar
                imageUrl={localImageUrl ?? employerProfile?.profile_image_url}
                name={formData.company_name || "C"}
                size={88}
              />
              <TouchableOpacity
                onPress={pickAndUpload}
                disabled={uploadingPhoto}
                className="absolute bottom-0 right-0 w-8 h-8 bg-cyan-700 rounded-full items-center justify-center border-2 border-white dark:border-[#080A08]"
                activeOpacity={0.85}
              >
                {uploadingPhoto ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <Ionicons name="camera" size={14} color="white" />
                )}
              </TouchableOpacity>
            </View>
            <Text className="mt-2.5 font-quicksandMedium text-xs text-gray-400">
              Tap to update photo
            </Text>
          </View>

          {/* ── Company Information ──────────────────────────────────────── */}
          <SectionLabel label="Company Information" />
          <View className="mx-6 bg-white dark:bg-[#0e0e0e] rounded-2xl border border-gray-100 dark:border-[#1f1f1f] overflow-hidden">
            {/* Company Name */}
            <View className="px-4 pt-4 pb-3 border-b border-gray-100 dark:border-[#1f1f1f]">
              <FieldLabel label="Company Name" required />
              <InputField
                value={formData.company_name}
                onChangeText={(t) => updateField("company_name", t)}
                placeholder="e.g. Acme Corporation"
              />
            </View>

            {/* Email */}
            <View className="px-4 py-3 border-b border-gray-100 dark:border-[#1f1f1f]">
              <FieldLabel label="Email" required />
              <InputField
                value={formData.email}
                onChangeText={(t) => updateField("email", t)}
                placeholder="e.g. contact@acmecorp.com"
                keyboardType="email-address"
              />
            </View>

            {/* Phone */}
            <View className="px-4 py-3 border-b border-gray-100 dark:border-[#1f1f1f]">
              <FieldLabel label="Phone Number" required />
              <PhoneInputField
                value={formData.phone}
                onChange={(n) => updateField("phone", n)}
              />
            </View>

            {/* Website */}
            <View className="px-4 py-3">
              <FieldLabel label="Company Website" required />
              <InputField
                value={formData.company_website}
                onChangeText={(t) => updateField("company_website", t)}
                placeholder="e.g. https://www.acmecorp.com"
                keyboardType="url"
              />
            </View>
          </View>

          {/* ── Location ─────────────────────────────────────────────────── */}
          <SectionLabel label="Location" />
          <View className="mx-6 bg-white dark:bg-[#0e0e0e] rounded-2xl border border-gray-100 dark:border-[#1f1f1f] overflow-hidden">
            <View className="px-4 pt-4 pb-3 border-b border-gray-100 dark:border-[#1f1f1f]">
              <FieldLabel label="Country" required />
              <InputField
                value={formData.country}
                onChangeText={(t) => updateField("country", t)}
                placeholder="e.g. Rwanda"
              />
            </View>
            <View className="px-4 py-3 border-b border-gray-100 dark:border-[#1f1f1f]">
              <FieldLabel label="City" required />
              <InputField
                value={formData.city}
                onChangeText={(t) => updateField("city", t)}
                placeholder="e.g. Kigali"
              />
            </View>
            <View className="px-4 py-3">
              <FieldLabel label="Address" required />
              <InputField
                value={formData.company_address}
                onChangeText={(t) => updateField("company_address", t)}
                placeholder="e.g. 123 Business Road, Suite 400"
              />
            </View>
          </View>

          {/* ── Info note ────────────────────────────────────────────────── */}
          <View className="mx-6 mt-6 bg-white dark:bg-[#0e0e0e] border border-gray-100 dark:border-[#1f1f1f] rounded-2xl p-4 flex-row items-start gap-3">
            <Ionicons
              name="shield-checkmark-outline"
              size={17}
              color="#0E7490"
              style={{ marginTop: 1 }}
            />
            <View className="flex-1">
              <Text className="font-quicksandBold text-sm text-gray-700 dark:text-gray-300 mb-0.5">
                Verification Required
              </Text>
              <Text className="font-quicksandMedium text-xs text-gray-400 leading-5">
                To post jobs and interact with jobseekers, submit your business
                registration for verification after saving.
              </Text>
            </View>
          </View>

          {/* ── Completion notice — neutral, no cyan background ──────────── */}
          {completionStatus.isComplete && (
            <View className="mx-6 mt-4 bg-white dark:bg-[#0e0e0e] border border-gray-100 dark:border-[#1f1f1f] rounded-2xl p-4 flex-row items-center gap-3">
              <Ionicons
                name="checkmark-circle-outline"
                size={17}
                color="#0E7490"
              />
              <View className="flex-1">
                <Text className="font-quicksandBold text-sm text-gray-800 dark:text-gray-200">
                  Profile complete
                </Text>
                <Text className="font-quicksandMedium text-xs text-gray-400 mt-0.5">
                  All required fields are filled in.
                </Text>
              </View>
            </View>
          )}

          {/* ── Save ─────────────────────────────────────────────────────── */}
          <View className="mx-6 mt-6">
            <TouchableOpacity
              onPress={handleSave}
              disabled={saving}
              className={`rounded-2xl py-4 items-center justify-center ${
                saving ? "bg-cyan-700/70" : "bg-cyan-700"
              }`}
              activeOpacity={0.85}
            >
              {saving ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-white font-quicksandBold text-sm">
                  Save Profile
                </Text>
              )}
            </TouchableOpacity>
          </View>
      </KeyboardWrapper>
    </SafeAreaView>
  );
}
