import { useProfileCompletion } from "@/hooks/useProfileCompletion";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useRouter } from "expo-router";
import { useRef, useState } from "react";
import {
  ActivityIndicator,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import PhoneInput from "react-native-phone-number-input";

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
  const phoneInput = useRef<PhoneInput>(null);

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

          {/* Phone Number with Country Picker */}
          <View className="mb-4">
            <Text className="text-gray-700 font-quicksandSemibold mb-2">
              Phone Number *
            </Text>
            <View className="bg-gray-50 rounded-2xl overflow-hidden">
              <PhoneInput
                ref={phoneInput}
                defaultValue={formData.phone}
                defaultCode="RW"
                layout="first"
                onChangeFormattedText={(text) => {
                  updateField("phone", text);
                }}
                containerStyle={{
                  backgroundColor: "#F9FAFB",
                  width: "100%",
                  borderRadius: 16,
                }}
                textContainerStyle={{
                  backgroundColor: "#F9FAFB",
                  paddingVertical: 0,
                }}
                textInputStyle={{
                  fontFamily: "Quicksand-Medium",
                  fontSize: 15,
                  color: "#1F2937",
                  paddingVertical: 12,
                }}
                codeTextStyle={{
                  fontFamily: "Quicksand-SemiBold",
                  fontSize: 15,
                  color: "#1F2937",
                }}
                flagButtonStyle={{
                  paddingHorizontal: 12,
                }}
                countryPickerButtonStyle={{
                  paddingHorizontal: 12,
                }}
              />
            </View>
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
                      formData.gender === option
                        ? "text-white"
                        : "text-gray-700"
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

          {/* Add Skill Input */}
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

          {/* Skills List */}
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
