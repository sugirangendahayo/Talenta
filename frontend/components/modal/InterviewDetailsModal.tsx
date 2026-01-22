// components/InterviewDetailsModal.tsx
// Install: expo install @react-native-community/datetimepicker
import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Platform,
  ActivityIndicator,
  KeyboardAvoidingView,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Ionicons } from "@expo/vector-icons";

type InterviewType = "physical" | "online";

interface InterviewDetailsModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (details: InterviewDetails) => Promise<void>;
  applicantName: string;
  jobTitle: string;
}

export interface InterviewDetails {
  interviewType: InterviewType;
  interviewDate: string; // ISO date string
  interviewTime: string; // HH:MM format
  location?: string;
  meetingLink?: string;
  additionalNotes?: string;
}

export default function InterviewDetailsModal({
  visible,
  onClose,
  onSubmit,
  applicantName,
  jobTitle,
}: InterviewDetailsModalProps) {
  const [interviewType, setInterviewType] = useState<InterviewType>("physical");
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState(new Date());
  const [location, setLocation] = useState("");
  const [meetingLink, setMeetingLink] = useState("");
  const [additionalNotes, setAdditionalNotes] = useState("");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const resetForm = () => {
    setInterviewType("physical");
    setSelectedDate(new Date());
    setSelectedTime(new Date());
    setLocation("");
    setMeetingLink("");
    setAdditionalNotes("");
    setErrors({});
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (interviewType === "physical" && !location.trim()) {
      newErrors.location = "Location is required for physical interviews";
    }

    if (interviewType === "online" && !meetingLink.trim()) {
      newErrors.meetingLink = "Meeting link is required for online interviews";
    }

    // Check if date is in the past
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (selectedDate < today) {
      newErrors.date = "Interview date cannot be in the past";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const details: InterviewDetails = {
        interviewType,
        interviewDate: selectedDate.toISOString().split("T")[0], // YYYY-MM-DD
        interviewTime: selectedTime
          .toTimeString()
          .split(" ")[0]
          .substring(0, 5), // HH:MM
        ...(interviewType === "physical" && { location: location.trim() }),
        ...(interviewType === "online" && { meetingLink: meetingLink.trim() }),
        ...(additionalNotes.trim() && {
          additionalNotes: additionalNotes.trim(),
        }),
      };

      await onSubmit(details);
      resetForm();
      onClose();
    } catch (error) {
      console.error("Error submitting interview details:", error);
      setErrors({ submit: "Failed to schedule interview. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    resetForm();
    onClose();
  };

  const onDateChange = (event: any, date?: Date) => {
    setShowDatePicker(Platform.OS === "ios");
    if (date) {
      setSelectedDate(date);
      setErrors((prev) => ({ ...prev, date: "" }));
    }
  };

  const onTimeChange = (event: any, time?: Date) => {
    setShowTimePicker(Platform.OS === "ios");
    if (time) {
      setSelectedTime(time);
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={handleCancel}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <View className="flex-1 justify-end bg-black/50">
          <View className="bg-white rounded-t-3xl max-h-[90%]">
            {/* Header */}
            <View className="flex-row justify-between items-center p-6 border-b border-gray-200">
              <View className="flex-1">
                <Text className="text-2xl font-quicksandBold text-gray-900">
                  Schedule Interview
                </Text>
                <Text className="text-sm font-quicksandMedium text-gray-500 mt-1">
                  {applicantName} • {jobTitle}
                </Text>
              </View>
              <TouchableOpacity
                onPress={handleCancel}
                className="ml-4 p-2 rounded-full bg-gray-100"
              >
                <Ionicons name="close" size={24} color="#374151" />
              </TouchableOpacity>
            </View>

            <ScrollView
              className="px-6 py-4"
              showsVerticalScrollIndicator={false}
            >
              {/* Interview Type Selection */}
              <View className="mb-6">
                <Text className="text-base font-quicksandSemibold text-gray-900 mb-3">
                  Interview Type
                </Text>
                <View className="flex-row gap-3">
                  <TouchableOpacity
                    onPress={() => setInterviewType("physical")}
                    className={`flex-1 flex-row items-center justify-center p-4 rounded-xl border-2 ${
                      interviewType === "physical"
                        ? "border-cyan-700 bg-cyan-50"
                        : "border-gray-200 bg-white"
                    }`}
                  >
                    <Ionicons
                      name="location"
                      size={20}
                      color={
                        interviewType === "physical" ? "#0E7490" : "#9CA3AF"
                      }
                    />
                    <Text
                      className={`ml-2 font-quicksandSemibold ${
                        interviewType === "physical"
                          ? "text-cyan-700"
                          : "text-gray-600"
                      }`}
                    >
                      Physical
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => setInterviewType("online")}
                    className={`flex-1 flex-row items-center justify-center p-4 rounded-xl border-2 ${
                      interviewType === "online"
                        ? "border-cyan-700 bg-cyan-50"
                        : "border-gray-200 bg-white"
                    }`}
                  >
                    <Ionicons
                      name="videocam"
                      size={20}
                      color={interviewType === "online" ? "#0E7490" : "#9CA3AF"}
                    />
                    <Text
                      className={`ml-2 font-quicksandSemibold ${
                        interviewType === "online"
                          ? "text-cyan-700"
                          : "text-gray-600"
                      }`}
                    >
                      Online
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Date Picker */}
              <View className="mb-6">
                <Text className="text-base font-quicksandSemibold text-gray-900 mb-3">
                  Interview Date
                </Text>
                <TouchableOpacity
                  onPress={() => setShowDatePicker(true)}
                  className="flex-row items-center p-4 bg-gray-50 rounded-xl border border-gray-200"
                >
                  <Ionicons name="calendar-outline" size={20} color="#0E7490" />
                  <Text className="ml-3 flex-1 font-quicksandMedium text-gray-900">
                    {formatDate(selectedDate)}
                  </Text>
                  <Ionicons name="chevron-down" size={20} color="#9CA3AF" />
                </TouchableOpacity>
                {errors.date && (
                  <Text className="text-red-500 text-sm font-quicksandMedium mt-1">
                    {errors.date}
                  </Text>
                )}
              </View>

              {/* Time Picker */}
              <View className="mb-6">
                <Text className="text-base font-quicksandSemibold text-gray-900 mb-3">
                  Interview Time
                </Text>
                <TouchableOpacity
                  onPress={() => setShowTimePicker(true)}
                  className="flex-row items-center p-4 bg-gray-50 rounded-xl border border-gray-200"
                >
                  <Ionicons name="time-outline" size={20} color="#0E7490" />
                  <Text className="ml-3 flex-1 font-quicksandMedium text-gray-900">
                    {formatTime(selectedTime)}
                  </Text>
                  <Ionicons name="chevron-down" size={20} color="#9CA3AF" />
                </TouchableOpacity>
              </View>

              {/* Location (Physical) */}
              {interviewType === "physical" && (
                <View className="mb-6">
                  <Text className="text-base font-quicksandSemibold text-gray-900 mb-3">
                    Location <Text className="text-red-500">*</Text>
                  </Text>
                  <TextInput
                    value={location}
                    onChangeText={(text) => {
                      setLocation(text);
                      setErrors((prev) => ({ ...prev, location: "" }));
                    }}
                    placeholder="Enter interview location (e.g., Office Address, Room)"
                    placeholderTextColor="#9CA3AF"
                    className="p-4 bg-gray-50 rounded-xl border border-gray-200 font-quicksandMedium text-gray-900"
                    multiline
                    numberOfLines={3}
                    textAlignVertical="top"
                  />
                  {errors.location && (
                    <Text className="text-red-500 text-sm font-quicksandMedium mt-1">
                      {errors.location}
                    </Text>
                  )}
                </View>
              )}

              {/* Meeting Link (Online) */}
              {interviewType === "online" && (
                <View className="mb-6">
                  <Text className="text-base font-quicksandSemibold text-gray-900 mb-3">
                    Meeting Link <Text className="text-red-500">*</Text>
                  </Text>
                  <TextInput
                    value={meetingLink}
                    onChangeText={(text) => {
                      setMeetingLink(text);
                      setErrors((prev) => ({ ...prev, meetingLink: "" }));
                    }}
                    placeholder="Paste meeting link (Zoom, Google Meet, Teams, etc.)"
                    placeholderTextColor="#9CA3AF"
                    className="p-4 bg-gray-50 rounded-xl border border-gray-200 font-quicksandMedium text-gray-900"
                    keyboardType="url"
                    autoCapitalize="none"
                  />
                  {errors.meetingLink && (
                    <Text className="text-red-500 text-sm font-quicksandMedium mt-1">
                      {errors.meetingLink}
                    </Text>
                  )}
                </View>
              )}

              {/* Additional Notes */}
              <View className="mb-6">
                <Text className="text-base font-quicksandSemibold text-gray-900 mb-3">
                  Additional Notes (Optional)
                </Text>
                <TextInput
                  value={additionalNotes}
                  onChangeText={setAdditionalNotes}
                  placeholder="Any special instructions or information..."
                  placeholderTextColor="#9CA3AF"
                  className="p-4 bg-gray-50 rounded-xl border border-gray-200 font-quicksandMedium text-gray-900"
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                />
              </View>

              {/* Error Message */}
              {errors.submit && (
                <View className="mb-4 p-4 bg-red-50 rounded-xl border border-red-200">
                  <Text className="text-red-700 font-quicksandMedium text-center">
                    {errors.submit}
                  </Text>
                </View>
              )}

              {/* Action Buttons */}
              <View className="flex-row gap-3 mb-6">
                <TouchableOpacity
                  onPress={handleCancel}
                  disabled={isSubmitting}
                  className="flex-1 p-4 rounded-xl border-2 border-gray-300 bg-white"
                >
                  <Text className="text-center font-quicksandBold text-gray-700">
                    Cancel
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handleSubmit}
                  disabled={isSubmitting}
                  className="flex-1 p-4 rounded-xl bg-cyan-700"
                >
                  {isSubmitting ? (
                    <ActivityIndicator color="white" />
                  ) : (
                    <Text className="text-center font-quicksandBold text-white">
                      Schedule Interview
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            </ScrollView>

            {/* Date Picker Modal */}
            {showDatePicker && (
              <DateTimePicker
                value={selectedDate}
                mode="date"
                display={Platform.OS === "ios" ? "spinner" : "default"}
                onChange={onDateChange}
                minimumDate={new Date()}
              />
            )}

            {/* Time Picker Modal */}
            {showTimePicker && (
              <DateTimePicker
                value={selectedTime}
                mode="time"
                display={Platform.OS === "ios" ? "spinner" : "default"}
                onChange={onTimeChange}
              />
            )}
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
