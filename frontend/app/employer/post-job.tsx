import { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import PostJobHeader from "@/components/employer/PostJobHeader";
import FormInput from "@/components/employer/FormInput";
import CategorySelector from "@/components/employer/CategorySelector";
import JobTypeSelector from "@/components/employer/JobTypeSelector";
import SkillsInput from "@/components/employer/SkillsInput";
import LogoUploader from "@/components/employer/LogoUploader";

export default function PostJob() {
  const router = useRouter();

  // Form State
  const [formData, setFormData] = useState({
    title: "",
    company: "",
    location: "",
    salary: "",
    category: "",
    type: [] as string[],
    description: "",
    requirements: [] as string[],
    skills: [] as string[],
    logo: "",
  });

  // Update form field
  const updateField = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Toggle job type selection
  const toggleJobType = (type: string) => {
    const types = formData.type.includes(type)
      ? formData.type.filter((t) => t !== type)
      : [...formData.type, type];
    updateField("type", types);
  };

  // Add skill/requirement
  const addToList = (field: "skills" | "requirements", item: string) => {
    updateField(field, [...formData[field], item]);
  };

  // Remove skill/requirement
  const removeFromList = (field: "skills" | "requirements", index: number) => {
    updateField(
      field,
      formData[field].filter((_, i) => i !== index)
    );
  };

  // Handle logo upload
  const handleLogoUpload = () => {
    // In real app, use image picker
    Alert.alert("Upload Logo", "Image picker would open here");
    // Demo: set a placeholder URL
    updateField("logo", "https://via.placeholder.com/150");
  };

  // Validate form
  const validateForm = () => {
    if (!formData.title.trim()) return "Job title is required";
    if (!formData.company.trim()) return "Company name is required";
    if (!formData.location.trim()) return "Location is required";
    if (!formData.salary.trim()) return "Salary range is required";
    if (!formData.category) return "Please select a category";
    if (formData.type.length === 0) return "Please select at least one job type";
    if (!formData.description.trim()) return "Job description is required";
    if (formData.requirements.length === 0)
      return "Please add at least one requirement";
    return null;
  };

  // Handle form submission
  const handleSubmit = () => {
    const error = validateForm();
    if (error) {
      Alert.alert("Validation Error", error);
      return;
    }

    // Submit form data
    Alert.alert("Success", "Job posted successfully!", [
      {
        text: "OK",
        onPress: () => router.back(),
      },
    ]);
  };

  // Save as draft
  const handleSaveDraft = () => {
    Alert.alert("Draft Saved", "Your job posting has been saved as draft");
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <PostJobHeader onSaveDraft={handleSaveDraft} />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 100 }}
          className="flex-1"
        >
          <View className="px-4 py-4">
            {/* Section: Basic Information */}
            <View className="mb-6">
              <View className="flex flex-row items-center gap-2 mb-4">
                <View className="w-8 h-8 bg-cyan-100 rounded-full items-center justify-center flex">
                  <Ionicons name="information-circle" size={18} color="#0E7490" />
                </View>
                <Text className="text-lg font-quicksandBold text-gray-800">
                  Basic Information
                </Text>
              </View>

              <FormInput
                label="Job Title"
                placeholder="e.g., Senior React Developer"
                value={formData.title}
                onChangeText={(text) => updateField("title", text)}
                icon="briefcase-outline"
                required
              />

              <FormInput
                label="Company Name"
                placeholder="e.g., TechCorp Inc."
                value={formData.company}
                onChangeText={(text) => updateField("company", text)}
                icon="business-outline"
                required
              />

              <FormInput
                label="Location"
                placeholder="e.g., Remote, New York, USA"
                value={formData.location}
                onChangeText={(text) => updateField("location", text)}
                icon="location-outline"
                required
              />

              <FormInput
                label="Salary Range"
                placeholder="e.g., $120,000 - $180,000"
                value={formData.salary}
                onChangeText={(text) => updateField("salary", text)}
                icon="cash-outline"
                required
              />

              <LogoUploader
                label="Company Logo"
                logoUrl={formData.logo}
                onUpload={handleLogoUpload}
                onRemove={() => updateField("logo", "")}
              />
            </View>

            {/* Section: Job Details */}
            <View className="mb-6">
              <View className="flex flex-row items-center gap-2 mb-4">
                <View className="w-8 h-8 bg-purple-100 rounded-full items-center justify-center flex">
                  <Ionicons name="document-text" size={18} color="#8B5CF6" />
                </View>
                <Text className="text-lg font-quicksandBold text-gray-800">
                  Job Details
                </Text>
              </View>

              <CategorySelector
                label="Category"
                selected={formData.category}
                onSelect={(cat) => updateField("category", cat)}
                required
              />

              <JobTypeSelector
                label="Job Type"
                selected={formData.type}
                onSelect={toggleJobType}
                required
              />

              <FormInput
                label="Job Description"
                placeholder="Describe the role, responsibilities, and what makes this opportunity great..."
                value={formData.description}
                onChangeText={(text) => updateField("description", text)}
                icon="document-text-outline"
                multiline
                required
              />
            </View>

            {/* Section: Requirements & Skills */}
            <View className="mb-6">
              <View className="flex flex-row items-center gap-2 mb-4">
                <View className="w-8 h-8 bg-green-100 rounded-full items-center justify-center flex">
                  <Ionicons name="checkmark-done" size={18} color="#10B981" />
                </View>
                <Text className="text-lg font-quicksandBold text-gray-800">
                  Requirements & Skills
                </Text>
              </View>

              <SkillsInput
                label="Requirements"
                placeholder="e.g., 3+ years experience"
                skills={formData.requirements}
                onAdd={(req) => addToList("requirements", req)}
                onRemove={(index) => removeFromList("requirements", index)}
                required
              />

              <SkillsInput
                label="Skills"
                placeholder="e.g., React, TypeScript"
                skills={formData.skills}
                onAdd={(skill) => addToList("skills", skill)}
                onRemove={(index) => removeFromList("skills", index)}
              />
            </View>
          </View>
        </ScrollView>

        {/* Fixed Bottom Action Buttons */}
        <View
          className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-3"
          style={{
            shadowColor: "#000",
            shadowOffset: { width: 0, height: -2 },
            shadowOpacity: 0.1,
            shadowRadius: 3,
          }}
        >
          <View className="flex flex-row gap-3">
            <TouchableOpacity
              onPress={() => router.back()}
              className="flex-1 bg-gray-100 py-3 rounded-xl items-center justify-center flex"
            >
              <Text className="text-gray-700 font-quicksandBold text-base">
                Cancel
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleSubmit}
              className="flex-1 bg-cyan-700 py-3 rounded-xl items-center justify-center flex flex-row gap-2"
            >
              <Ionicons name="checkmark-circle" size={20} color="white" />
              <Text className="text-white font-quicksandBold text-base">
                Post Job
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}