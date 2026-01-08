import { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import PostJobHeader from "@/components/employer/PostJobHeader";
import FormInput from "@/components/employer/FormInput";
import CategorySelector from "@/components/employer/CategorySelector";
import JobTypeSelector from "@/components/employer/JobTypeSelector";
import SkillsInput from "@/components/employer/SkillsInput";
import { toast } from "sonner-native";

export default function PostJob() {
  const router = useRouter();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    title: "",
    location: "",
    salaryMin: "",
    salaryMax: "",
    category: "",
    type: [] as string[],
    description: "",
    requirements: [] as string[],
    skills: [] as string[],
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

  // Validate form
  const validateForm = () => {
    if (!formData.title.trim()) return "Job title is required";
    if (!formData.location.trim()) return "Location is required";
    if (!formData.salaryMin.trim()) return "Minimum salary is required";
    if (!formData.salaryMax.trim()) return "Maximum salary is required";

    // Validate salary numbers
    const minSalary = parseFloat(formData.salaryMin.replace(/[^0-9.-]+/g, ""));
    const maxSalary = parseFloat(formData.salaryMax.replace(/[^0-9.-]+/g, ""));

    if (isNaN(minSalary) || isNaN(maxSalary)) {
      return "Please enter valid salary amounts";
    }

    if (minSalary >= maxSalary) {
      return "Maximum salary must be greater than minimum salary";
    }

    if (!formData.category) return "Please select a category";
    if (formData.type.length === 0)
      return "Please select at least one job type";
    if (!formData.description.trim()) return "Job description is required";
    if (formData.requirements.length === 0)
      return "Please add at least one requirement";

    return null;
  };

  // Handle form submission
  const handleSubmit = async () => {
    const error = validateForm();
    if (error) {
      Alert.alert("Validation Error", error);
      return;
    }

    if (!user) {
      Alert.alert("Error", "You must be logged in to post a job");
      return;
    }

    setIsSubmitting(true);

    try {
      // Parse salary values
      const minSalary = parseFloat(
        formData.salaryMin.replace(/[^0-9.-]+/g, "")
      );
      const maxSalary = parseFloat(
        formData.salaryMax.replace(/[^0-9.-]+/g, "")
      );

      // Prepare job data
      const jobData = {
        employer_id: user.id,
        title: formData.title.trim(),
        location: formData.location.trim(),
        salary_min: minSalary,
        salary_max: maxSalary,
        job_type: formData.type.join(", "), // Store as comma-separated string
        category: formData.category,
        description: formData.description.trim(),
        experience_level: formData.requirements[0] || "", // First requirement as experience
        skills_required: formData.skills, // Store as array
        status: "active",
      };

      // Insert job into database
      const { data, error: insertError } = await supabase
        .from("jobs")
        .insert(jobData)
        .select()
        .single();

      if (insertError) throw insertError;

      // Success!
      toast.success("Job posted successfully!", {
        duration: 2000,
      });

      // Navigate back to dashboard
      setTimeout(() => {
        router.replace("/(employer-tabs)/employers/Jobs");
      }, 500);
    } catch (error: any) {
      console.error("Error posting job:", error);

      let errorMessage = "Failed to post job. Please try again.";
      if (error.message) {
        errorMessage = error.message;
      }

      Alert.alert("Error", errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Save as draft
  const handleSaveDraft = async () => {
    if (!user) {
      Alert.alert("Error", "You must be logged in to save a draft");
      return;
    }

    try {
      const minSalary = formData.salaryMin
        ? parseFloat(formData.salaryMin.replace(/[^0-9.-]+/g, ""))
        : 0;
      const maxSalary = formData.salaryMax
        ? parseFloat(formData.salaryMax.replace(/[^0-9.-]+/g, ""))
        : 0;

      const draftData = {
        employer_id: user.id,
        title: formData.title.trim() || "Untitled Job",
        location: formData.location.trim() || "",
        salary_min: minSalary,
        salary_max: maxSalary,
        job_type: formData.type.join(", "),
        category: formData.category || "it",
        description: formData.description.trim() || "",
        experience_level: formData.requirements[0] || "",
        skills_required: formData.skills,
        status: "draft",
      };

      const { error } = await supabase.from("jobs").insert(draftData);

      if (error) throw error;

      toast.success("Draft saved successfully!", {
        duration: 2000,
      });
    } catch (error: any) {
      console.error("Error saving draft:", error);
      Alert.alert("Error", "Failed to save draft. Please try again.");
    }
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
                  <Ionicons
                    name="information-circle"
                    size={18}
                    color="#0E7490"
                  />
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
                label="Location"
                placeholder="e.g., Remote, New York, USA"
                value={formData.location}
                onChangeText={(text) => updateField("location", text)}
                icon="location-outline"
                required
              />

              <View className="mb-4">
                <View className="flex flex-row items-center mb-2 gap-1">
                  <Ionicons name="cash-outline" size={16} color="#0E7490" />
                  <Text className="text-sm font-quicksandBold text-gray-700">
                    Salary Range
                  </Text>
                  <Text className="text-red-500 font-quicksandBold">*</Text>
                </View>
                <View className="flex flex-row gap-2">
                  <View className="flex-1">
                    <FormInput
                      label=""
                      placeholder="Min (e.g., 120000)"
                      value={formData.salaryMin}
                      onChangeText={(text) => updateField("salaryMin", text)}
                      keyboardType="numeric"
                    />
                  </View>
                  <View className="flex-1">
                    <FormInput
                      label=""
                      placeholder="Max (e.g., 180000)"
                      value={formData.salaryMax}
                      onChangeText={(text) => updateField("salaryMax", text)}
                      keyboardType="numeric"
                    />
                  </View>
                </View>
              </View>
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
              disabled={isSubmitting}
            >
              <Text className="text-gray-700 font-quicksandBold text-base">
                Cancel
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleSubmit}
              className="flex-1 bg-cyan-700 py-3 rounded-xl items-center justify-center flex flex-row gap-2"
              disabled={isSubmitting}
              style={{ opacity: isSubmitting ? 0.7 : 1 }}
            >
              {isSubmitting ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <>
                  <Ionicons name="checkmark-circle" size={20} color="white" />
                  <Text className="text-white font-quicksandBold text-base">
                    Post Job
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
