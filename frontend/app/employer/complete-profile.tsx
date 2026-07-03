import UserAvatar from "@/components/common/UserAvatar";
import { ProfileFormSkeleton } from "@/components/skeletons/ProfileFormSkeleton";
import { useAuth } from "@/contexts/AuthContext";
import { useEmployerProfileCompletion } from "@/hooks/useEmployerProfileCompletion";
import { useProfileImage } from "@/hooks/useProfileImage";
import { EmployerProfile } from "@/lib/supabase";
import { FontAwesome, Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  FlatList,
  Modal,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// Reuse COUNTRIES list
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
      <View
        className="flex-row rounded-2xl overflow-hidden border border-gray-200 dark:border-[#2a2a2a]"
        style={{ backgroundColor: "#F8FAFC" }}
      >
        <TouchableOpacity
          onPress={() => setShowPicker(true)}
          className="flex-row items-center px-3 py-3.5 gap-1.5 border-r border-gray-200 dark:border-[#2a2a2a]"
          activeOpacity={0.7}
        >
          <Text style={{ fontSize: 18 }}>{selectedCountry.flag}</Text>
          <Text className="font-quicksandSemibold text-sm text-gray-800 dark:text-gray-200">
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
            className="bg-white dark:bg-[#080A08] pt-4"
            style={{
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              maxHeight: "70%",
            }}
          >
            <View className="flex-row items-center justify-between px-5 mb-3">
              <Text className="font-quicksandBold text-lg text-gray-900 dark:text-gray-100">
                Select Country
              </Text>
              <TouchableOpacity
                onPress={() => setShowPicker(false)}
                className="w-8 h-8 rounded-full bg-gray-100 dark:bg-[#141414] items-center justify-center"
                activeOpacity={0.7}
              >
                <Ionicons name="close" size={16} color="#374151" />
              </TouchableOpacity>
            </View>

            <View
              className="mx-5 mb-3 flex-row items-center rounded-xl border border-gray-200 dark:border-[#2a2a2a] px-3"
              style={{ backgroundColor: "#F8FAFC" }}
            >
              <Ionicons name="search" size={15} color="#9CA3AF" />
              <TextInput
                value={search}
                onChangeText={setSearch}
                placeholder="Search country..."
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
                        ? "#ECFEFF"
                        : "transparent",
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={{ fontSize: 22 }}>{item.flag}</Text>
                  <Text className="flex-1 font-quicksandSemibold text-sm text-gray-800 dark:text-gray-200">
                    {item.name}
                  </Text>
                  <Text className="font-quicksandMedium text-xs text-gray-400">
                    {item.dialCode}
                  </Text>
                  {selectedCountry.code === item.code && (
                    <Ionicons name="checkmark" size={16} color="#0E7490" />
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

function FieldLabel({
  label,
  required,
}: {
  label: string;
  required?: boolean;
}) {
  return (
    <Text className="text-gray-600 dark:text-gray-400 font-quicksandSemibold text-sm mb-2">
      {label}
      {required && <Text className="text-cyan-600 dark:text-cyan-400"> *</Text>}
    </Text>
  );
}

function SectionCard({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <View
      className="mx-6 mt-4 bg-white dark:bg-[#080A08] rounded-3xl p-5 border border-gray-100 dark:border-[#222]"
      style={{
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
      }}
    >
      <View className="flex-row items-center mb-5 gap-2.5">
        {icon}
        <Text className="text-base font-quicksandBold text-gray-800 dark:text-gray-200">
          {title}
        </Text>
      </View>
      {children}
    </View>
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
      className="rounded-2xl px-4 py-3 font-quicksandMedium text-sm text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-[#2a2a2a]"
      style={{ backgroundColor: "#F8FAFC" }}
    />
  );
}

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

  // ─── Skeleton loading state ───────────────────────────────────────────────
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
    <SafeAreaView className="flex-1 bg-white dark:bg-[#080A08]" edges={["top"]}>
      {/* Header */}
      <View className="flex-row items-center px-5 py-4 border-b border-gray-100 dark:border-[#222]">
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-9 h-9 rounded-full bg-gray-100 dark:bg-[#141414] items-center justify-center mr-3"
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={18} color="#374151" />
        </TouchableOpacity>
        <Text className="text-xl font-quicksandBold text-gray-900 dark:text-gray-100 flex-1">
          Complete Company Profile
        </Text>
        <View className="bg-gray-100 dark:bg-[#141414] rounded-full px-3 py-1 border border-gray-200 dark:border-[#2a2a2a]">
          <Text className="font-quicksandBold text-xs text-gray-700 dark:text-gray-300">
            {pct}%
          </Text>
        </View>
      </View>

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {/* Progress card */}
        <View
          className="mx-6 mt-5 rounded-2xl border border-gray-100 dark:border-[#222] px-4 py-4"
          style={{ backgroundColor: "#F8FAFC" }}
        >
          <View className="flex-row items-center justify-between mb-2.5">
            <Text className="font-quicksandSemibold text-sm text-gray-600 dark:text-gray-400">
              Profile Completion
            </Text>
            <Text className="font-quicksandBold text-sm text-cyan-700">
              {pct}%
            </Text>
          </View>
          <View className="h-2 bg-gray-200 dark:bg-[#1e1e1e] rounded-full overflow-hidden">
            <View
              className="h-full bg-cyan-700 dark:bg-cyan-800 rounded-full"
              style={{ width: `${pct}%` }}
            />
          </View>
          {completionStatus.missingFields.length > 0 && (
            <Text className="text-gray-400 font-quicksandMedium text-xs mt-2">
              Missing fields: {completionStatus.missingFields.join(", ")}
            </Text>
          )}
        </View>

        {/* ── Profile Photo ── */}
        <View className="items-center pt-6 pb-2">
          <View className="relative">
            <UserAvatar
              imageUrl={localImageUrl ?? employerProfile?.profile_image_url}
              name={formData.company_name || "C"}
              size={96}
            />
            <TouchableOpacity
              onPress={pickAndUpload}
              disabled={uploadingPhoto}
              className="absolute bottom-0 right-0 w-8 h-8 bg-cyan-700 rounded-full items-center justify-center border-2 border-white"
              activeOpacity={0.85}
            >
              {uploadingPhoto ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Ionicons name="camera" size={15} color="white" />
              )}
            </TouchableOpacity>
          </View>
          <Text className="mt-2 font-quicksandMedium text-xs text-gray-400">
            Tap camera to update photo
          </Text>
        </View>

        {/* ── Company Information ── */}
        <SectionCard
          icon={<FontAwesome name="handshake-o" size={18} color="#0E7490" />}
          title="Company Information"
        >
          <View className="mb-4">
            <FieldLabel label="Company Name" required />
            <InputField
              value={formData.company_name}
              onChangeText={(t) => updateField("company_name", t)}
              placeholder="e.g. Acme Corporation"
            />
          </View>

          <View className="mb-4">
            <FieldLabel label="Email" required />
            <InputField
              value={formData.email}
              onChangeText={(t) => updateField("email", t)}
              placeholder="e.g. contact@acmecorp.com"
              keyboardType="email-address"
            />
          </View>

          <View className="mb-4">
            <FieldLabel label="Phone Number" required />
            <PhoneInputField
              value={formData.phone}
              onChange={(n) => updateField("phone", n)}
            />
          </View>

          <View>
            <FieldLabel label="Company Website" required />
            <InputField
              value={formData.company_website}
              onChangeText={(t) => updateField("company_website", t)}
              placeholder="e.g. https://www.acmecorp.com"
              keyboardType="url"
            />
          </View>
        </SectionCard>

        {/* ── Location ── */}
        <SectionCard
          icon={<Ionicons name="location-outline" size={18} color="#0E7490" />}
          title="Location"
        >
          <View className="mb-4">
            <FieldLabel label="Country" required />
            <InputField
              value={formData.country}
              onChangeText={(t) => updateField("country", t)}
              placeholder="e.g. Rwanda"
            />
          </View>
          <View className="mb-4">
            <FieldLabel label="City" required />
            <InputField
              value={formData.city}
              onChangeText={(t) => updateField("city", t)}
              placeholder="e.g. Kigali"
            />
          </View>
          <View>
            <FieldLabel label="Company Address" required />
            <InputField
              value={formData.company_address}
              onChangeText={(t) => updateField("company_address", t)}
              placeholder="e.g. 123 Business Road, Suite 400"
            />
          </View>
        </SectionCard>

        {/* Verification Note */}
        <View
          className="mx-6 mt-4 rounded-2xl border border-gray-100 dark:border-[#222] p-4 flex-row items-start gap-3"
          style={{ backgroundColor: "#F8FAFC" }}
        >
          <Ionicons name="shield-checkmark-outline" size={18} color="#0E7490" />
          <View className="flex-1">
            <Text className="font-quicksandBold text-sm text-gray-700 dark:text-gray-300 mb-0.5">
              Verification Required
            </Text>
            <Text className="font-quicksandMedium text-xs text-gray-400 leading-relaxed">
              To post jobs and interact with jobseekers, you'll need to submit
              your business registration later for verification.
            </Text>
          </View>
        </View>

        {/* Completion badge */}
        {completionStatus.isComplete && (
          <View
            className="mx-6 mt-4 rounded-2xl border border-cyan-100 p-4 flex-row items-center gap-2"
            style={{ backgroundColor: "#ECFEFF" }}
          >
            <Ionicons name="checkmark-circle" size={18} color="#0E7490" />
            <View className="flex-1">
              <Text className="font-quicksandBold text-sm text-cyan-800 dark:text-cyan-300">
                Profile Complete!
              </Text>
              <Text className="font-quicksandMedium text-xs text-cyan-600 dark:text-cyan-400 mt-0.5">
                Your company profile is 100% complete.
              </Text>
            </View>
          </View>
        )}

        {/* Save button */}
        <View className="mx-6 mt-6">
          <TouchableOpacity
            onPress={handleSave}
            disabled={saving}
            className="bg-cyan-700 dark:bg-cyan-800 rounded-2xl py-4 flex-row items-center justify-center gap-2"
            activeOpacity={0.85}
          >
            {saving ? (
              <ActivityIndicator color="white" />
            ) : (
              <>
                <Text className="text-white font-quicksandBold text-sm">
                  Save Profile
                </Text>
                <Ionicons
                  name="checkmark-circle-outline"
                  size={18}
                  color="white"
                />
              </>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
