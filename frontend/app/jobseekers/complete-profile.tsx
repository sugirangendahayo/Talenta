import { useProfileCompletion } from "@/hooks/useProfileCompletion";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  FlatList,
} from "react-native";

// Common countries list — extend as needed
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
  const [selectedCountry, setSelectedCountry] = useState<Country>(
    COUNTRIES[0] // Default: Rwanda
  );
  const [nationalNumber, setNationalNumber] = useState("");
  const [showPicker, setShowPicker] = useState(false);
  const [search, setSearch] = useState("");

  const filteredCountries = COUNTRIES.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.dialCode.includes(search)
  );

  const handleNumberChange = (text: string) => {
    // Strip non-numeric characters
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
        style={{
          flexDirection: "row",
          backgroundColor: "#F9FAFB",
          borderRadius: 16,
          overflow: "hidden",
        }}
      >
        {/* Country Picker Button */}
        <TouchableOpacity
          onPress={() => setShowPicker(true)}
          style={{
            flexDirection: "row",
            alignItems: "center",
            paddingHorizontal: 12,
            paddingVertical: 14,
            borderRightWidth: 1,
            borderRightColor: "#E5E7EB",
            gap: 6,
          }}
        >
          <Text style={{ fontSize: 20 }}>{selectedCountry.flag}</Text>
          <Text
            style={{
              fontFamily: "Quicksand-SemiBold",
              fontSize: 15,
              color: "#1F2937",
            }}
          >
            {selectedCountry.dialCode}
          </Text>
          <Ionicons name="chevron-down" size={14} color="#6B7280" />
        </TouchableOpacity>

        {/* Number Input */}
        <TextInput
          value={nationalNumber}
          onChangeText={handleNumberChange}
          placeholder="e.g. 78 000 0000"
          placeholderTextColor="#9CA3AF"
          keyboardType="phone-pad"
          style={{
            flex: 1,
            fontFamily: "Quicksand-Medium",
            fontSize: 15,
            color: "#1F2937",
            paddingHorizontal: 12,
            paddingVertical: 14,
          }}
        />
      </View>

      {/* Country Picker Modal */}
      <Modal
        visible={showPicker}
        animationType="slide"
        transparent
        onRequestClose={() => setShowPicker(false)}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.4)",
            justifyContent: "flex-end",
          }}
        >
          <View
            style={{
              backgroundColor: "white",
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              paddingTop: 16,
              maxHeight: "70%",
            }}
          >
            {/* Modal Header */}
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                paddingHorizontal: 20,
                marginBottom: 12,
              }}
            >
              <Text
                style={{
                  fontFamily: "Quicksand-Bold",
                  fontSize: 18,
                  color: "#1F2937",
                }}
              >
                Select Country
              </Text>
              <TouchableOpacity onPress={() => setShowPicker(false)}>
                <Ionicons name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            {/* Search */}
            <View
              style={{
                marginHorizontal: 20,
                marginBottom: 12,
                flexDirection: "row",
                alignItems: "center",
                backgroundColor: "#F3F4F6",
                borderRadius: 12,
                paddingHorizontal: 12,
              }}
            >
              <Ionicons name="search" size={18} color="#9CA3AF" />
              <TextInput
                value={search}
                onChangeText={setSearch}
                placeholder="Search country..."
                placeholderTextColor="#9CA3AF"
                style={{
                  flex: 1,
                  fontFamily: "Quicksand-Medium",
                  fontSize: 14,
                  color: "#1F2937",
                  paddingVertical: 10,
                  paddingHorizontal: 8,
                }}
              />
            </View>

            {/* Country List */}
            <FlatList
              data={filteredCountries}
              keyExtractor={(item) => item.code}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => handleCountrySelect(item)}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    paddingHorizontal: 20,
                    paddingVertical: 12,
                    backgroundColor:
                      selectedCountry.code === item.code
                        ? "#ECFEFF"
                        : "transparent",
                    gap: 12,
                  }}
                >
                  <Text style={{ fontSize: 24 }}>{item.flag}</Text>
                  <Text
                    style={{
                      flex: 1,
                      fontFamily: "Quicksand-SemiBold",
                      fontSize: 15,
                      color: "#1F2937",
                    }}
                  >
                    {item.name}
                  </Text>
                  <Text
                    style={{
                      fontFamily: "Quicksand-Medium",
                      fontSize: 14,
                      color: "#6B7280",
                    }}
                  >
                    {item.dialCode}
                  </Text>
                  {selectedCountry.code === item.code && (
                    <Ionicons name="checkmark" size={18} color="#0E7490" />
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

export default function CompleteProfileScreen() {
  const router = useRouter();
  const {
    loading,
    saving,
    formData,
    completionStatus,
    updateField,
    addSkill,
    removeSkill,
    saveProfile,
  } = useProfileCompletion();

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [newSkill, setNewSkill] = useState("");

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

  const handleSave = async () => {
    const success = await saveProfile();
    if (success && completionStatus.isComplete) {
      router.back();
    }
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      const formattedDate = selectedDate.toISOString().split("T")[0];
      updateField("date_of_birth", formattedDate);
    }
  };

  const handleAddSkill = () => {
    if (newSkill.trim()) {
      addSkill(newSkill);
      setNewSkill("");
    }
  };

  if (loading) {
    return (
      <View className="flex-1 bg-gray-50 items-center justify-center">
        <ActivityIndicator size="large" color="#0E7490" />
        <Text className="text-gray-600 font-quicksandMedium mt-4">
          Loading profile...
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-cyan-700 px-6 pt-16 pb-6">
        <View className="flex-row items-center justify-between">
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text className="text-2xl font-quicksandBold text-white">
            Complete Profile
          </Text>
          <View style={{ width: 24 }} />
        </View>

        {/* Progress Bar */}
        <View className="mt-6">
          <View className="flex-row justify-between items-center mb-2">
            <Text className="text-white font-quicksandMedium">
              Profile Completion
            </Text>
            <Text className="text-white font-quicksandBold">
              {completionStatus.completionPercentage}%
            </Text>
          </View>
          <View className="h-3 bg-cyan-900 rounded-full overflow-hidden">
            <View
              className="h-full bg-white rounded-full"
              style={{ width: `${completionStatus.completionPercentage}%` }}
            />
          </View>
          {completionStatus.missingFields.length > 0 && (
            <Text className="text-cyan-100 font-quicksandMedium text-sm mt-2">
              {completionStatus.missingFields.length} field(s) remaining
            </Text>
          )}
        </View>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Personal Information */}
        <View className="mx-6 mt-6 bg-white rounded-3xl p-6 shadow-sm border border-gray-200">
          <View className="flex-row items-center mb-4">
            <Ionicons name="person-outline" size={20} color="#0E7490" />
            <Text className="text-lg font-quicksandBold text-gray-800 ml-3">
              Personal Information
            </Text>
          </View>

          {/* First Name */}
          <View className="mb-4">
            <Text className="text-gray-700 font-quicksandSemibold mb-2">
              First Name *
            </Text>
            <TextInput
              value={formData.first_name}
              onChangeText={(text) => updateField("first_name", text)}
              placeholder="Enter your first name"
              placeholderTextColor="#9CA3AF"
              className="bg-gray-50 rounded-2xl px-4 py-3 font-quicksandMedium text-gray-800"
            />
          </View>

          {/* Last Name */}
          <View className="mb-4">
            <Text className="text-gray-700 font-quicksandSemibold mb-2">
              Last Name *
            </Text>
            <TextInput
              value={formData.last_name}
              onChangeText={(text) => updateField("last_name", text)}
              placeholder="Enter your last name"
              placeholderTextColor="#9CA3AF"
              className="bg-gray-50 rounded-2xl px-4 py-3 font-quicksandMedium text-gray-800"
            />
          </View>

          {/* Phone Number */}
          <View className="mb-4">
            <Text className="text-gray-700 font-quicksandSemibold mb-2">
              Phone Number *
            </Text>
            <PhoneInputField
              value={formData.phone}
              onChange={(fullNumber) => updateField("phone", fullNumber)}
            />
          </View>

          {/* Date of Birth */}
          <View className="mb-4">
            <Text className="text-gray-700 font-quicksandSemibold mb-2">
              Date of Birth *
            </Text>
            <TouchableOpacity
              onPress={() => setShowDatePicker(true)}
              className="bg-gray-50 rounded-2xl px-4 py-3 flex-row items-center justify-between"
            >
              <Text
                className={`font-quicksandMedium ${
                  formData.date_of_birth ? "text-gray-800" : "text-gray-400"
                }`}
              >
                {formData.date_of_birth || "Select date of birth"}
              </Text>
              <Ionicons name="calendar-outline" size={20} color="#6B7280" />
            </TouchableOpacity>
          </View>

          {showDatePicker && (
            <DateTimePicker
              value={
                formData.date_of_birth
                  ? new Date(formData.date_of_birth)
                  : new Date()
              }
              mode="date"
              display={Platform.OS === "ios" ? "spinner" : "default"}
              onChange={handleDateChange}
              maximumDate={new Date()}
            />
          )}

          {/* Gender */}
          <View className="mb-4">
            <Text className="text-gray-700 font-quicksandSemibold mb-2">
              Gender *
            </Text>
            <View className="flex-row flex-wrap gap-2">
              {genderOptions.map((option) => (
                <TouchableOpacity
                  key={option}
                  onPress={() => updateField("gender", option)}
                  className={`px-4 py-2 rounded-full ${
                    formData.gender === option
                      ? "bg-cyan-700"
                      : "bg-gray-100 border border-gray-300"
                  }`}
                >
                  <Text
                    className={`font-quicksandSemibold ${
                      formData.gender === option ? "text-white" : "text-gray-700"
                    }`}
                  >
                    {option}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* Location */}
        <View className="mx-6 mt-6 bg-white rounded-3xl p-6 shadow-sm border border-gray-200">
          <View className="flex-row items-center mb-4">
            <Ionicons name="location-outline" size={20} color="#0E7490" />
            <Text className="text-lg font-quicksandBold text-gray-800 ml-3">
              Location
            </Text>
          </View>

          <View className="mb-4">
            <Text className="text-gray-700 font-quicksandSemibold mb-2">
              Country *
            </Text>
            <TextInput
              value={formData.country}
              onChangeText={(text) => updateField("country", text)}
              placeholder="e.g., Rwanda"
              placeholderTextColor="#9CA3AF"
              className="bg-gray-50 rounded-2xl px-4 py-3 font-quicksandMedium text-gray-800"
            />
          </View>

          <View className="mb-4">
            <Text className="text-gray-700 font-quicksandSemibold mb-2">
              City *
            </Text>
            <TextInput
              value={formData.city}
              onChangeText={(text) => updateField("city", text)}
              placeholder="e.g., Kigali"
              placeholderTextColor="#9CA3AF"
              className="bg-gray-50 rounded-2xl px-4 py-3 font-quicksandMedium text-gray-800"
            />
          </View>
        </View>

        {/* Education & Experience */}
        <View className="mx-6 mt-6 bg-white rounded-3xl p-6 shadow-sm border border-gray-200">
          <View className="flex-row items-center mb-4">
            <Ionicons name="school-outline" size={20} color="#0E7490" />
            <Text className="text-lg font-quicksandBold text-gray-800 ml-3">
              Education & Experience
            </Text>
          </View>

          <View className="mb-4">
            <Text className="text-gray-700 font-quicksandSemibold mb-2">
              Education Level *
            </Text>
            <View className="flex-row flex-wrap gap-2">
              {educationLevels.map((level) => (
                <TouchableOpacity
                  key={level}
                  onPress={() => updateField("education_level", level)}
                  className={`px-4 py-2 rounded-full ${
                    formData.education_level === level
                      ? "bg-cyan-700"
                      : "bg-gray-100 border border-gray-300"
                  }`}
                >
                  <Text
                    className={`font-quicksandSemibold text-sm ${
                      formData.education_level === level
                        ? "text-white"
                        : "text-gray-700"
                    }`}
                  >
                    {level}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View className="mb-4">
            <Text className="text-gray-700 font-quicksandSemibold mb-2">
              Experience Level *
            </Text>
            <View className="flex-row flex-wrap gap-2">
              {experienceLevels.map((level) => (
                <TouchableOpacity
                  key={level}
                  onPress={() => updateField("experience_level", level)}
                  className={`px-4 py-2 rounded-full ${
                    formData.experience_level === level
                      ? "bg-cyan-700"
                      : "bg-gray-100 border border-gray-300"
                  }`}
                >
                  <Text
                    className={`font-quicksandSemibold ${
                      formData.experience_level === level
                        ? "text-white"
                        : "text-gray-700"
                    }`}
                  >
                    {level}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* Skills */}
        <View className="mx-6 mt-6 bg-white rounded-3xl p-6 shadow-sm border border-gray-200">
          <View className="flex-row items-center mb-4">
            <MaterialIcons name="stars" size={20} color="#0E7490" />
            <Text className="text-lg font-quicksandBold text-gray-800 ml-3">
              Skills *
            </Text>
          </View>

          <View className="flex-row gap-2 mb-4">
            <TextInput
              value={newSkill}
              onChangeText={setNewSkill}
              placeholder="Add a skill (e.g., JavaScript)"
              placeholderTextColor="#9CA3AF"
              className="flex-1 bg-gray-50 rounded-2xl px-4 py-3 font-quicksandMedium text-gray-800"
              onSubmitEditing={handleAddSkill}
            />
            <TouchableOpacity
              onPress={handleAddSkill}
              className="bg-cyan-700 px-4 rounded-2xl items-center justify-center"
            >
              <Ionicons name="add" size={24} color="white" />
            </TouchableOpacity>
          </View>

          {formData.skills.length > 0 ? (
            <View className="flex-row flex-wrap gap-2">
              {formData.skills.map((skill, index) => (
                <View
                  key={index}
                  className="bg-cyan-50 px-3 py-2 rounded-full border border-cyan-200 flex-row items-center gap-2"
                >
                  <Text className="text-cyan-700 font-quicksandSemibold text-sm">
                    {skill}
                  </Text>
                  <TouchableOpacity onPress={() => removeSkill(index)}>
                    <Ionicons name="close-circle" size={18} color="#0E7490" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          ) : (
            <Text className="text-gray-500 font-quicksandMedium text-center py-4">
              No skills added yet
            </Text>
          )}
        </View>

        {/* CV Upload Note */}
        <View className="mx-6 mt-6 bg-amber-50 rounded-2xl p-4 border border-amber-200">
          <View className="flex-row items-start gap-3">
            <Ionicons name="information-circle" size={20} color="#D97706" />
            <View className="flex-1">
              <Text className="text-amber-800 font-quicksandBold mb-1">
                CV/Resume Required
              </Text>
              <Text className="text-amber-700 font-quicksandMedium text-sm">
                You&apos;ll need to upload your CV before applying for jobs. You
                can do this from your Profile → Documents section.
              </Text>
            </View>
          </View>
        </View>

        {/* Save Button */}
        <View className="mx-6 my-8">
          <TouchableOpacity
            onPress={handleSave}
            disabled={saving}
            className="bg-cyan-700 rounded-2xl py-4 flex-row items-center justify-center"
          >
            {saving ? (
              <ActivityIndicator color="white" />
            ) : (
              <>
              {/* save profile */}
                <Text className="text-white font-quicksandBold text-lg mr-2">
                  Save Profile
                </Text>
                <Ionicons name="checkmark-circle" size={20} color="white" />
              </>
            )}
          </TouchableOpacity>

          {completionStatus.isComplete && (
            <View className="bg-green-50 rounded-2xl p-4 mt-4 border border-green-200">
              <View className="flex-row items-center gap-2">
                <Ionicons name="checkmark-circle" size={20} color="#059669" />
                <Text className="text-green-800 font-quicksandBold">
                  Profile 100% Complete! 🎉
                </Text>
              </View>
              <Text className="text-green-700 font-quicksandMedium text-sm mt-1">
                You&apos;re all set to apply for jobs!!
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}