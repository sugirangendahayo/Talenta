// components/employer/ApplicantCard.tsx - Using shared types
import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import InterviewDetailsModal, {
  InterviewDetails,
} from "@/components/modal/InterviewDetailsModal";
import { useApplicationStatus } from "@/hooks/useApplicationStatus";
import { Applicant } from "@/types/job.types";

interface ApplicantCardProps {
  applicant: Applicant;
  onStatusUpdated: () => void;
}

export default function ApplicantCard({
  applicant,
  onStatusUpdated,
}: ApplicantCardProps) {
  const [showInterviewModal, setShowInterviewModal] = useState(false);
  const {
    isUpdating,
    shortlistWithInterview,
    rejectApplication,
    hireCandidate,
  } = useApplicationStatus();

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "shortlisted":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "hired":
        return "bg-green-100 text-green-800 border-green-200";
      case "rejected":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const handleShortlist = () => {
    setShowInterviewModal(true);
  };

  const handleInterviewSubmit = async (details: InterviewDetails) => {
    const result = await shortlistWithInterview(applicant.id, details);
    if (result.success) {
      Alert.alert(
        "Success!",
        "Candidate has been shortlisted and interview details have been sent via email.",
      );
      onStatusUpdated();
    } else {
      Alert.alert("Error", result.error || "Failed to shortlist candidate");
    }
  };

  const handleReject = () => {
    Alert.alert(
      "Reject Applicant",
      "Are you sure you want to reject this candidate? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Reject",
          style: "destructive",
          onPress: async () => {
            const result = await rejectApplication(applicant.id);
            if (result.success) {
              Alert.alert("Rejected", "Candidate has been notified.");
              onStatusUpdated();
            } else {
              Alert.alert(
                "Error",
                result.error || "Failed to reject candidate",
              );
            }
          },
        },
      ],
    );
  };

  const handleHire = () => {
    if (applicant.status !== "shortlisted") {
      Alert.alert(
        "Cannot Hire",
        "You must shortlist a candidate before hiring them.",
      );
      return;
    }

    Alert.alert(
      "Hire Candidate",
      `Are you sure you want to hire ${applicant.jobseeker_profiles.first_name} ${applicant.jobseeker_profiles.last_name}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Hire",
          onPress: async () => {
            const result = await hireCandidate(applicant.id);
            if (result.success) {
              Alert.alert(
                "Hired!",
                "Candidate has been notified of the good news!",
              );
              onStatusUpdated();
            } else {
              Alert.alert("Error", result.error || "Failed to hire candidate");
            }
          },
        },
      ],
    );
  };

  const handleViewCV = () => {
    if (applicant.jobseeker_profiles.cv_document_url) {
      // Open CV in browser or use a PDF viewer
      // You can use Linking.openURL or react-native-pdf
      Alert.alert(
        "View CV",
        "CV viewing functionality - integrate with your PDF viewer or Linking.openURL",
      );
    }
  };

  return (
    <>
      <View
        className="bg-white rounded-2xl p-4 mb-3 border border-gray-200"
        style={{
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.05,
          shadowRadius: 3,
        }}
      >
        {/* Header */}
        <View className="flex flex-row items-start justify-between mb-3">
          <View className="flex-1">
            <Text className="font-quicksandBold text-lg text-gray-900">
              {applicant.jobseeker_profiles.first_name}{" "}
              {applicant.jobseeker_profiles.last_name}
            </Text>
            <Text className="font-quicksandMedium text-sm text-gray-500">
              Applied {new Date(applicant.created_at).toLocaleDateString()}
            </Text>
          </View>
          <View
            className={`px-3 py-1 rounded-full border ${getStatusColor(
              applicant.status,
            )}`}
          >
            <Text className="font-quicksandBold text-xs capitalize">
              {applicant.status}
            </Text>
          </View>
        </View>

        {/* Info */}
        <View className="space-y-2 mb-3">
          {applicant.jobseeker_profiles.email && (
            <View className="flex flex-row items-center">
              <Ionicons name="mail-outline" size={16} color="#6B7280" />
              <Text className="ml-2 font-quicksandMedium text-sm text-gray-600">
                {applicant.jobseeker_profiles.email}
              </Text>
            </View>
          )}
          {applicant.jobseeker_profiles.phone && (
            <View className="flex flex-row items-center">
              <Ionicons name="call-outline" size={16} color="#6B7280" />
              <Text className="ml-2 font-quicksandMedium text-sm text-gray-600">
                {applicant.jobseeker_profiles.phone}
              </Text>
            </View>
          )}
          {applicant.jobseeker_profiles.experience_level && (
            <View className="flex flex-row items-center">
              <Ionicons name="briefcase-outline" size={16} color="#6B7280" />
              <Text className="ml-2 font-quicksandMedium text-sm text-gray-600">
                {applicant.jobseeker_profiles.experience_level}
              </Text>
            </View>
          )}
        </View>

        {/* Skills */}
        {applicant.jobseeker_profiles.skills &&
          applicant.jobseeker_profiles.skills.length > 0 && (
            <View className="flex flex-row flex-wrap gap-2 mb-3">
              {applicant.jobseeker_profiles.skills
                .slice(0, 4)
                .map((skill, idx) => (
                  <View
                    key={idx}
                    className="px-3 py-1 bg-cyan-50 rounded-full border border-cyan-200"
                  >
                    <Text className="font-quicksandMedium text-xs text-cyan-700">
                      {skill}
                    </Text>
                  </View>
                ))}
              {applicant.jobseeker_profiles.skills.length > 4 && (
                <View className="px-3 py-1 bg-gray-100 rounded-full">
                  <Text className="font-quicksandMedium text-xs text-gray-600">
                    +{applicant.jobseeker_profiles.skills.length - 4} more
                  </Text>
                </View>
              )}
            </View>
          )}

        {/* Cover Letter */}
        {applicant.cover_letter && (
          <View className="p-3 bg-gray-50 rounded-xl mb-3">
            <Text className="font-quicksandSemibold text-sm text-gray-700 mb-1">
              Cover Letter:
            </Text>
            <Text
              className="font-quicksandMedium text-sm text-gray-600"
              numberOfLines={3}
            >
              {applicant.cover_letter}
            </Text>
          </View>
        )}

        {/* Actions */}
        <View className="flex flex-row gap-2">
          {/* View CV */}
          {applicant.jobseeker_profiles.cv_document_url && (
            <TouchableOpacity
              onPress={handleViewCV}
              className="flex-1 py-2 px-3 bg-gray-100 rounded-lg flex flex-row items-center justify-center"
            >
              <Ionicons
                name="document-text-outline"
                size={18}
                color="#374151"
              />
              <Text className="ml-2 font-quicksandBold text-sm text-gray-700">
                View CV
              </Text>
            </TouchableOpacity>
          )}

          {/* Status-based actions */}
          {applicant.status === "pending" && (
            <>
              <TouchableOpacity
                onPress={handleShortlist}
                disabled={isUpdating}
                className="flex-1 py-2 px-3 bg-cyan-700 rounded-lg flex flex-row items-center justify-center"
              >
                {isUpdating ? (
                  <ActivityIndicator color="white" size="small" />
                ) : (
                  <>
                    <Ionicons
                      name="checkmark-circle-outline"
                      size={18}
                      color="white"
                    />
                    <Text className="ml-2 font-quicksandBold text-sm text-white">
                      Shortlist
                    </Text>
                  </>
                )}
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleReject}
                disabled={isUpdating}
                className="py-2 px-3 bg-red-100 rounded-lg"
              >
                <Ionicons
                  name="close-circle-outline"
                  size={18}
                  color="#DC2626"
                />
              </TouchableOpacity>
            </>
          )}

          {applicant.status === "shortlisted" && (
            <>
              <TouchableOpacity
                onPress={handleHire}
                disabled={isUpdating}
                className="flex-1 py-2 px-3 bg-green-600 rounded-lg flex flex-row items-center justify-center"
              >
                {isUpdating ? (
                  <ActivityIndicator color="white" size="small" />
                ) : (
                  <>
                    <Ionicons name="trophy-outline" size={18} color="white" />
                    <Text className="ml-2 font-quicksandBold text-sm text-white">
                      Hire
                    </Text>
                  </>
                )}
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleReject}
                disabled={isUpdating}
                className="py-2 px-3 bg-red-100 rounded-lg"
              >
                <Ionicons
                  name="close-circle-outline"
                  size={18}
                  color="#DC2626"
                />
              </TouchableOpacity>
            </>
          )}

          {(applicant.status === "hired" ||
            applicant.status === "rejected") && (
            <View className="flex-1 py-2 px-3 bg-gray-100 rounded-lg">
              <Text className="font-quicksandBold text-sm text-gray-600 text-center">
                {applicant.status === "hired" ? "Hired ✓" : "Rejected"}
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Interview Details Modal */}
      <InterviewDetailsModal
        visible={showInterviewModal}
        onClose={() => setShowInterviewModal(false)}
        onSubmit={handleInterviewSubmit}
        applicantName={`${applicant.jobseeker_profiles.first_name} ${applicant.jobseeker_profiles.last_name}`}
        jobTitle={applicant.jobs.title}
      />
    </>
  );
}