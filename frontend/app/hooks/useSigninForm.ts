import { useRouter } from "expo-router";
import { useState } from "react";
// import { Alert } from "react-native";


export default function useSigninForm() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);

  const handleInputChange = (key: string, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleSignin = () => {

    // Basic validation
    // if (!formData.email || !formData.password) {
    //   Alert.alert("Missing Fields", "Please fill in all fields");
    //   return;
    // }

    // // Email validation
    // const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    // if (!emailRegex.test(formData.email)) {
    //   Alert.alert("Invalid Email", "Please enter a valid email address");
    //   return;
    // }

    // // Here you would typically send the data to your backend
    // Alert.alert("Success", "Signed in successfully!");
    // console.log("Signin Data:", formData);
    router.push("/(employer-tabs)/employers/Dashboard")

  };

  return {
    formData,
    showPassword,
    setShowPassword,
    handleInputChange,
    handleSignin,
  };
}
