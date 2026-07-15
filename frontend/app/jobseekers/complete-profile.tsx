// app/jobseekers/CompleteProfileScreen.tsx
import { useProfileCompletion } from "@/hooks/useProfileCompletion";
import { ProfileFormSkeleton } from "@/components/skeletons/ProfileFormSkeleton";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Animated,
  FlatList,
  Modal,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "@/contexts/AuthContext";
import KeyboardWrapper from "@/components/common/KeyboardWrapper";
import { useProfileImage } from "@/hooks/useProfileImage";
import UserAvatar from "@/components/common/UserAvatar";
import UsernameInput from "@/components/common/UsernameInput";
import type { UsernameStatus } from "@/components/common/UsernameInput";

// ─── Constants ────────────────────────────────────────────────────────────────

/** Minimum age to create a jobseeker account */
const MIN_AGE_YEARS = 16;

/** Maximum selectable date = today − 16 years */
function getMaxDOB(): Date {
  const d = new Date();
  d.setFullYear(d.getFullYear() - MIN_AGE_YEARS);
  return d;
}

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

// ─── Shake animation helper ────────────────────────────────────────────────────
function useShake() {
  const anim = useRef(new Animated.Value(0)).current;
  const shake = useCallback(() => {
    Animated.sequence([
      Animated.timing(anim, { toValue: 8, duration: 60, useNativeDriver: true }),
      Animated.timing(anim, { toValue: -8, duration: 60, useNativeDriver: true }),
      Animated.timing(anim, { toValue: 6, duration: 50, useNativeDriver: true }),
      Animated.timing(anim, { toValue: -6, duration: 50, useNativeDriver: true }),
      Animated.timing(anim, { toValue: 0, duration: 40, useNativeDriver: true }),
    ]).start();
  }, [anim]);
  return { anim, shake };
}

// ─── Phone input ───────────────────────────────────────────────────────────────
function PhoneInputField({
  value,
  onChange,
  hasError,
}: {
  value: string;
  onChange: (fullNumber: string) => void;
  hasError?: boolean;
}) {
  // Parse existing value into country + national number on first mount / value change
  const parseInitial = useCallback(
    (raw: string): { country: Country; national: string } => {
      if (!raw) return { country: COUNTRIES[0], national: "" };
      const matched = COUNTRIES.find((c) => raw.startsWith(c.dialCode));
      if (matched) {
        return { country: matched, national: raw.slice(matched.dialCode.length) };
      }
      return { country: COUNTRIES[0], national: raw };
    },
    []
  );

  const [selectedCountry, setSelectedCountry] = useState<Country>(() => parseInitial(value).country);
  const [nationalNumber, setNationalNumber] = useState<string>(() => parseInitial(value).national);
  const [showPicker, setShowPicker] = useState(false);
  const [search, setSearch] = useState("");

  // Sync when value changes externally (e.g. initial load from DB)
  const prevValueRef = useRef(value);
  useEffect(() => {
    if (value !== prevValueRef.current) {
      prevValueRef.current = value;
      const parsed = parseInitial(value);
      setSelectedCountry(parsed.country);
      setNationalNumber(parsed.national);
    }
  }, [value, parseInitial]);

  const filteredCountries = COUNTRIES.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.dialCode.includes(search)
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
        className={`flex-row rounded-2xl overflow-hidden border ${
          hasError
            ? "border-red-500"
            : "border-gray-200 dark:border-[#2a2a2a]"
        }`}
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
                      selectedCountry.code === item.code ? "#ECFEFF" : "transparent",
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

// ─── Primitives ────────────────────────────────────────────────────────────────

function FieldLabel({ label, required }: { label: string; required?: boolean }) {
  return (
    <Text className="text-gray-600 dark:text-gray-400 font-quicksandSemibold text-sm mb-2">
      {label}
      {required && <Text className="text-red-500"> *</Text>}
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
        <Text className="text-base font-quicksandBold text-gray-800 dark:text-gray-200">{title}</Text>
      </View>
      {children}
    </View>
  );
}

function ChipGroup({
  options,
  selected,
  onSelect,
  hasError,
}: {
  options: string[];
  selected: string;
  onSelect: (v: string) => void;
  hasError?: boolean;
}) {
  return (
    <View
      className={`flex-row flex-wrap gap-2 rounded-xl p-1 ${
        hasError ? "border border-red-500" : ""
      }`}
    >
      {options.map((option) => (
        <TouchableOpacity
          key={option}
          onPress={() => onSelect(option)}
          className={`px-4 py-2 rounded-full border ${
            selected === option
              ? "bg-cyan-700 dark:bg-cyan-800 border-cyan-700"
              : "bg-gray-50 dark:bg-[#080A08] border-gray-200 dark:border-[#2a2a2a]"
          }`}
          activeOpacity={0.7}
        >
          <Text
            className={`font-quicksandSemibold text-sm ${
              selected === option ? "text-white" : "text-gray-600 dark:text-gray-400"
            }`}
          >
            {option}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

function InputField({
  value,
  onChangeText,
  placeholder,
  hasError,
}: {
  value: string;
  onChangeText: (t: string) => void;
  placeholder: string;
  hasError?: boolean;
}) {
  return (
    <TextInput
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor="#9CA3AF"
      className={`rounded-2xl px-4 py-3 font-quicksandMedium text-sm text-gray-800 dark:text-gray-200 border ${
        hasError ? "border-red-500" : "border-gray-200 dark:border-[#2a2a2a]"
      }`}
      style={{ backgroundColor: "#F8FAFC" }}
    />
  );
}

function ErrorText({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <Text className="text-red-500 font-quicksandMedium text-xs mt-1">{message}</Text>
  );
}

// ─── Required fields definition ───────────────────────────────────────────────
const FORM_REQUIRED = [
  "full_name",
  "username",
  "phone",
  "date_of_birth",
  "gender",
  "country",
  "city",
  "education_level",
  "experience_level",
  "skills",
] as const;

// ────────────────────────────────────────────────────────────────────────────
export default function CompleteProfileScreen() {
  const router = useRouter();
  const { t } = useTranslation("profile");
  const { user, refreshProfile: refreshAuthProfile } = useAuth();
  const {
    loading,
    saving,
    formData,
    profileImageUrl,
    completionStatus,
    updateField,
    addSkill,
    removeSkill,
    saveProfile,
    setExternalImageUrl,
  } = useProfileCompletion();

  const [localImageUrl, setLocalImageUrl] = useState<string | null>(null);
  const [usernameStatus, setUsernameStatus] = useState<UsernameStatus>("idle");

  // Sync localImageUrl from hook when it changes (initial DB load)
  useEffect(() => {
    if (profileImageUrl && !localImageUrl) {
      setLocalImageUrl(profileImageUrl);
    }
  }, [profileImageUrl]);

  const { pickAndUpload, uploading: uploadingPhoto } = useProfileImage(
    user?.id ?? "",
    "jobseeker_profiles",
    async (url) => {
      setLocalImageUrl(url);
      setExternalImageUrl(url); // push into hook for completion tracking
      await refreshAuthProfile(); // sync auth context
    }
  );

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [newSkill, setNewSkill] = useState("");

  // ─── Validation state ─────────────────────────────────────────────────────
  const [errors, setErrors] = useState<Partial<Record<string, string>>>({});
  const { anim: shakeAnim, shake } = useShake();

  const genderOptions = ["Male", "Female", "Other", "Prefer not to say"];
  const educationLevels = [
    "High School",
    "Associate Degree",
    "Bachelor's Degree",
    "Master's Degree",
    "PhD",
    "Other",
  ];
  const experienceLevels = ["Entry Level", "Intermediate", "Senior", "Expert"];

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.full_name.trim()) newErrors.full_name = "Full name is required";
    if (!formData.username.trim()) newErrors.username = "Username is required";
    if (usernameStatus === "taken" || usernameStatus === "invalid") newErrors.username = "Please choose an available username";
    if (!formData.phone || formData.phone.length < 8) newErrors.phone = "Valid phone number is required";
    if (!formData.date_of_birth) newErrors.date_of_birth = "Date of birth is required";
    if (!formData.gender) newErrors.gender = "Please select your gender";
    if (!formData.country.trim()) newErrors.country = "Country is required";
    if (!formData.city.trim()) newErrors.city = "City is required";
    if (!formData.education_level) newErrors.education_level = "Please select your education level";
    if (!formData.experience_level) newErrors.experience_level = "Please select your experience level";
    if (!formData.skills || formData.skills.length === 0) newErrors.skills = "Add at least one skill";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) {
      shake();
      return;
    }
    const success = await saveProfile();
    if (success) {
      await refreshAuthProfile();
      if (completionStatus.isComplete) router.back();
    }
  };

  const handleDateChange = (_: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      updateField("date_of_birth", selectedDate.toISOString().split("T")[0]);
      setErrors((prev) => ({ ...prev, date_of_birth: undefined }));
    }
  };

  const handleAddSkill = () => {
    if (newSkill.trim()) {
      addSkill(newSkill);
      setNewSkill("");
      setErrors((prev) => ({ ...prev, skills: undefined }));
    }
  };

  // ─── Skeleton loading state ───────────────────────────────────────────────
  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-white dark:bg-[#080A08]" edges={["top"]}>
        <ProfileFormSkeleton />
      </SafeAreaView>
    );
  }

  const pct = completionStatus.completionPercentage;
  const maxDOB = getMaxDOB();

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
          {t("completeProfile.title")}
        </Text>
        <View className="bg-gray-100 dark:bg-[#141414] rounded-full px-3 py-1 border border-gray-200 dark:border-[#2a2a2a]">
          <Text className="font-quicksandBold text-xs text-gray-700 dark:text-gray-300">{pct}%</Text>
        </View>
      </View>

      <KeyboardWrapper contentStyle={{ paddingBottom: 40 }}>
        {/* Progress card */}
        <View
          className="mx-6 mt-5 rounded-2xl border border-gray-100 dark:border-[#222] px-4 py-4"
          style={{ backgroundColor: "#F8FAFC" }}
        >
          <View className="flex-row items-center justify-between mb-2.5">
            <Text className="font-quicksandSemibold text-sm text-gray-600 dark:text-gray-400">
              {t("completeProfile.progress.label")}
            </Text>
            <Text className="font-quicksandBold text-sm text-cyan-700">{pct}%</Text>
          </View>
          <View className="h-2 bg-gray-200 dark:bg-[#1e1e1e] rounded-full overflow-hidden">
            <View
              className="h-full bg-cyan-700 dark:bg-cyan-800 rounded-full"
              style={{ width: `${pct}%` }}
            />
          </View>
          {completionStatus.missingFields.length > 0 && (
            <Text className="text-gray-400 font-quicksandMedium text-xs mt-2">
              {t("completeProfile.progress.remaining", { count: completionStatus.missingFields.length })}
            </Text>
          )}
        </View>

        {/* ── Profile Photo ── */}
        <View className="items-center pt-6 pb-2">
          <View className="relative">
            <UserAvatar
              imageUrl={localImageUrl ?? profileImageUrl}
              name={formData.full_name || "JS"}
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

        {/* ── Personal Information ── */}
        <Animated.View style={{ transform: [{ translateX: shakeAnim }] }}>
          <SectionCard
            icon={<Ionicons name="person-outline" size={18} color="#0E7490" />}
            title={t("completeProfile.sections.personal.title")}
          >
            <View className="mb-4">
              <FieldLabel label="Full Name" required />
              <InputField
                value={formData.full_name}
                onChangeText={(v) => { updateField("full_name", v); setErrors((p) => ({ ...p, full_name: undefined })); }}
                placeholder="Your full name (e.g. Salomon Elisha)"
                hasError={!!errors.full_name}
              />
              <ErrorText message={errors.full_name} />
            </View>

            <View className="mb-4">
              <FieldLabel label="Username" required />
              <UsernameInput
                value={formData.username}
                onChangeText={(v) => { updateField("username", v); setErrors((p) => ({ ...p, username: undefined })); }}
                onStatusChange={setUsernameStatus}
                fullName={formData.full_name}
                table="jobseeker_profiles"
                column="username"
                excludeId={user?.id}
                placeholder="username"
                hasError={!!errors.username}
              />
              <ErrorText message={errors.username} />
            </View>

            <View className="mb-4">
              <FieldLabel label={t("completeProfile.sections.personal.phone")} required />
              <PhoneInputField
                value={formData.phone}
                onChange={(n) => { updateField("phone", n); setErrors((p) => ({ ...p, phone: undefined })); }}
                hasError={!!errors.phone}
              />
              <ErrorText message={errors.phone} />
            </View>

            <View className="mb-4">
              <FieldLabel label={t("completeProfile.sections.personal.dob")} required />
              <TouchableOpacity
                onPress={() => setShowDatePicker(true)}
                className={`flex-row items-center justify-between rounded-2xl px-4 py-3 border ${
                  errors.date_of_birth ? "border-red-500" : "border-gray-200 dark:border-[#2a2a2a]"
                }`}
                style={{ backgroundColor: "#F8FAFC" }}
                activeOpacity={0.7}
              >
                <Text
                  className={`font-quicksandMedium text-sm ${
                    formData.date_of_birth ? "text-gray-800 dark:text-gray-200" : "text-gray-400"
                  }`}
                >
                  {formData.date_of_birth || t("completeProfile.placeholders.dob")}
                </Text>
                <Ionicons name="calendar-outline" size={17} color="#9CA3AF" />
              </TouchableOpacity>
              <ErrorText message={errors.date_of_birth} />
              {!errors.date_of_birth && (
                <Text className="text-gray-400 font-quicksandMedium text-xs mt-1">
                  Minimum age: {MIN_AGE_YEARS} years old
                </Text>
              )}
            </View>

            {showDatePicker && (
              <DateTimePicker
                value={
                  formData.date_of_birth ? new Date(formData.date_of_birth) : maxDOB
                }
                mode="date"
                display={Platform.OS === "ios" ? "spinner" : "default"}
                onChange={handleDateChange}
                maximumDate={maxDOB}
              />
            )}

            <View>
              <FieldLabel label={t("completeProfile.sections.personal.gender")} required />
              <ChipGroup
                options={genderOptions}
                selected={formData.gender}
                onSelect={(v) => { updateField("gender", v); setErrors((p) => ({ ...p, gender: undefined })); }}
                hasError={!!errors.gender}
              />
              <ErrorText message={errors.gender} />
            </View>
          </SectionCard>

          {/* ── Location ── */}
          <SectionCard
            icon={<Ionicons name="location-outline" size={18} color="#0E7490" />}
            title={t("completeProfile.sections.location.title")}
          >
            <View className="mb-4">
              <FieldLabel label={t("completeProfile.sections.location.country")} required />
              <InputField
                value={formData.country}
                onChangeText={(v) => { updateField("country", v); setErrors((p) => ({ ...p, country: undefined })); }}
                placeholder={t("completeProfile.placeholders.country")}
                hasError={!!errors.country}
              />
              <ErrorText message={errors.country} />
            </View>
            <View>
              <FieldLabel label={t("completeProfile.sections.location.city")} required />
              <InputField
                value={formData.city}
                onChangeText={(v) => { updateField("city", v); setErrors((p) => ({ ...p, city: undefined })); }}
                placeholder={t("completeProfile.placeholders.city")}
                hasError={!!errors.city}
              />
              <ErrorText message={errors.city} />
            </View>
          </SectionCard>

          {/* ── Education & Experience ── */}
          <SectionCard
            icon={<Ionicons name="school-outline" size={18} color="#0E7490" />}
            title={t("completeProfile.sections.education.title")}
          >
            <View className="mb-5">
              <FieldLabel label={t("completeProfile.sections.education.level")} required />
              <ChipGroup
                options={educationLevels}
                selected={formData.education_level}
                onSelect={(v) => { updateField("education_level", v); setErrors((p) => ({ ...p, education_level: undefined })); }}
                hasError={!!errors.education_level}
              />
              <ErrorText message={errors.education_level} />
            </View>
            <View>
              <FieldLabel label={t("completeProfile.sections.education.experience")} required />
              <ChipGroup
                options={experienceLevels}
                selected={formData.experience_level}
                onSelect={(v) => { updateField("experience_level", v); setErrors((p) => ({ ...p, experience_level: undefined })); }}
                hasError={!!errors.experience_level}
              />
              <ErrorText message={errors.experience_level} />
            </View>
          </SectionCard>

          {/* ── Skills ── */}
          <SectionCard
            icon={<MaterialIcons name="stars" size={18} color="#0E7490" />}
            title={t("completeProfile.sections.skills.title")}
          >
            <View className={`flex-row gap-2 mb-4 ${errors.skills ? "border border-red-500 rounded-2xl p-1" : ""}`}>
              <TextInput
                value={newSkill}
                onChangeText={setNewSkill}
                placeholder={t("completeProfile.sections.skills.addPlaceholder")}
                placeholderTextColor="#9CA3AF"
                className="flex-1 rounded-2xl px-4 py-3 font-quicksandMedium text-sm text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-[#2a2a2a]"
                style={{ backgroundColor: "#F8FAFC" }}
                onSubmitEditing={handleAddSkill}
                returnKeyType="done"
              />
              <TouchableOpacity
                onPress={handleAddSkill}
                className="w-12 bg-cyan-700 dark:bg-cyan-800 rounded-2xl items-center justify-center"
                activeOpacity={0.85}
              >
                <Ionicons name="add" size={22} color="white" />
              </TouchableOpacity>
            </View>
            <ErrorText message={errors.skills} />

            {formData.skills.length > 0 ? (
              <View className="flex-row flex-wrap gap-2">
                {formData.skills.map((skill, index) => (
                  <View
                    key={index}
                    className="flex-row items-center gap-1.5 px-3 py-1.5 rounded-full border border-gray-200 dark:border-[#2a2a2a]"
                    style={{ backgroundColor: "#F8FAFC" }}
                  >
                    <Text className="text-gray-700 dark:text-gray-300 font-quicksandSemibold text-xs">
                      {skill}
                    </Text>
                    <TouchableOpacity onPress={() => removeSkill(index)} activeOpacity={0.7}>
                      <Ionicons name="close-circle" size={15} color="#9CA3AF" />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            ) : (
              <View className="items-center py-5">
                <Ionicons name="sparkles-outline" size={24} color="#D1D5DB" />
                <Text className="text-gray-400 font-quicksandMedium text-sm mt-2">
                  {t("completeProfile.sections.skills.noSkills")}
                </Text>
              </View>
            )}
          </SectionCard>
        </Animated.View>

        {/* CV note */}
        <View
          className="mx-6 mt-4 rounded-2xl border border-gray-100 dark:border-[#222] p-4 flex-row items-start gap-3"
          style={{ backgroundColor: "#F8FAFC" }}
        >
          <Ionicons name="information-circle-outline" size={18} color="#0E7490" />
          <View className="flex-1">
            <Text className="font-quicksandBold text-sm text-gray-700 dark:text-gray-300 mb-0.5">
              {t("completeProfile.cvNote.title")}
            </Text>
            <Text className="font-quicksandMedium text-xs text-gray-400 leading-relaxed">
              {t("completeProfile.cvNote.description")}
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
                {t("completeProfile.completionBadge.title")}
              </Text>
              <Text className="font-quicksandMedium text-xs text-cyan-600 dark:text-cyan-400 mt-0.5">
                {t("completeProfile.completionBadge.description")}
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
                <Text className="text-white font-quicksandBold text-sm">{t("completeProfile.buttons.save")}</Text>
                <Ionicons name="checkmark-circle-outline" size={18} color="white" />
              </>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardWrapper>
    </SafeAreaView>
  );
}