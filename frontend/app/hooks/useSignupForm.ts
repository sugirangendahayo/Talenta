import { useState } from "react";
import { Alert } from "react-native";
import {
  commonFieldsStep1,
  commonFieldsStep2,
  jobSeekerStep1,
  jobSeekerStep2,
  employerStep1,
  employerStep2,
} from "../../constants/signupFields";
import {
  countries,
  educationLevels,
  experienceLevels,
  genders,
  skillsList,
} from "../../constants/dropdownData";

export default function useSignupForm() {
  const [step, setStep] = useState(1);
  const [role, setRole] = useState<"jobseeker" | "employer">("jobseeker");
  const [formData, setFormData] = useState({
    // Common fields
    fullName: "",
    email: "",
    phone: "",
    password: "",
    country: "",
    city: "",

    // Job Seeker specific
    dateOfBirth: new Date(),
    gender: "",
    idDocument: null,
    cvDocument: null,
    educationLevel: "",
    skills: [] as string[],
    experienceLevel: "",

    // Employer specific
    companyName: "",
    businessLicense: null,
    companyWebsite: "",
    companyAddress: "",
    verificationDocument: null,
  });

  const getCurrentStepFields = () => {
    if (step === 1) {
      return [
        ...commonFieldsStep1,
        ...(role === "jobseeker" ? jobSeekerStep1 : employerStep1),
      ];
    } else {
      return [
        ...commonFieldsStep2,
        ...(role === "jobseeker" ? jobSeekerStep2 : employerStep2),
      ];
    }
  };

  const handleInputChange = (key: string, value: any) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const toggleSkill = (skill: string) => {
    setFormData((prev) => ({
      ...prev,
      skills: prev.skills.includes(skill)
        ? prev.skills.filter((s) => s !== skill)
        : [...prev.skills, skill],
    }));
  };

  const handleFileUpload = (field: string) => {
    Alert.alert("File Upload", `Would upload file for ${field}`);
    // Implement actual file upload logic here
  };

  const handleNext = () => {
    // Basic validation
    const currentFields = getCurrentStepFields();
    const requiredFields = currentFields.filter(
      (field) => !field.placeholder?.includes("optional")
    );

    for (const field of requiredFields) {
      if (!formData[field.key as keyof typeof formData]) {
        Alert.alert("Missing Field", `Please fill in ${field.label}`);
        return;
      }
    }

    if (step === 1) {
      setStep(2);
    } else {
      handleSignup();
    }
  };

  const handleBack = () => {
    if (step === 2) {
      setStep(1);
    }
  };

  const handleSignup = () => {
    Alert.alert("Success", "Account created successfully!");
    console.log("Signup Data:", { role, ...formData });
  };

  const getDropdownData = (key: string) => {
    switch (key) {
      case "country":
        return countries;
      case "gender":
        return genders;
      case "educationLevel":
        return educationLevels;
      case "experienceLevel":
        return experienceLevels;
      default:
        return [];
    }
  };

  return {
    step,
    role,
    setRole,
    formData,
    getCurrentStepFields,
    handleInputChange,
    toggleSkill,
    handleFileUpload,
    handleNext,
    handleBack,
    getDropdownData,
    skillsList,
  };
}
