import { Text, TouchableOpacity, View, ActivityIndicator } from "react-native";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import * as WebBrowser from "expo-web-browser";
import * as Linking from "expo-linking";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { toast } from "sonner-native";
import { useTranslation } from "react-i18next";
import GoogleIcon from "@/components/common/GoogleIcon";

WebBrowser.maybeCompleteAuthSession();

interface GoogleAuthButtonProps {
  type: "signin" | "signup";
}

export default function GoogleAuthButton({ type }: GoogleAuthButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { t } = useTranslation("auth");

  const performOAuth = async () => {
    setIsLoading(true);
    try {
      const redirectUrl = Linking.createURL('/auth/callback'); 
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
          queryParams: {
            prompt: 'select_account', // Always show the Google account picker
          },
        },
      });

      if (error) throw error;

      if (data?.url) {
        const result = await WebBrowser.openAuthSessionAsync(data.url, redirectUrl);
        
        if (result.type === 'success') {
          // If successful, the deep link wakes the app, and Supabase's
          // onAuthStateChange automatically parses the URL and logs the user in.
        } else if (result.type === 'cancel') {
           // User cancelled
        }
      }
    } catch (error: any) {
      console.error("Google OAuth error:", error);
      toast.error(error.message || t("messages.oauthError", "Failed to sign in with Google"), {
        duration: 3000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <TouchableOpacity
      onPress={performOAuth}
      disabled={isLoading}
      className="flex-row items-center justify-center py-4 rounded-2xl bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 mt-4"
    >
      {isLoading ? (
        <ActivityIndicator color="#0E7490" />
      ) : (
        <>
          <GoogleIcon />
          <Text className="text-black dark:text-white font-quicksandBold text-base ml-2">
            {type === "signin" 
              ? t("googleAuth.signin", "Continue with Google") 
              : t("googleAuth.signup", "Sign up with Google")}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
}
