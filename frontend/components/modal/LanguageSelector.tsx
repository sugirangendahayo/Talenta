import { saveLanguage, saveLanguageForUser } from "@/i18n/config";
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useTheme } from "@/contexts/ThemeContext";

interface Language {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
}

const LANGUAGES: Language[] = [
  { code: "en", name: "English", nativeName: "English", flag: "🇬🇧" },
  { code: "fr", name: "French", nativeName: "Français", flag: "🇫🇷" },
  { code: "rw", name: "Kinyarwanda", nativeName: "Ikinyarwanda", flag: "🇷🇼" },
];

interface LanguageSelectorProps {
  visible: boolean;
  onClose: () => void;
  /** When provided, language is saved per-user instead of globally */
  userId?: string;
}

export default function LanguageSelector({
  visible,
  onClose,
  userId,
}: LanguageSelectorProps) {
  const { t, i18n } = useTranslation("profile");
  const { isDark } = useTheme();
  const [selectedLanguage, setSelectedLanguage] = useState(i18n.language);

  const handleSelectLanguage = async (languageCode: string) => {
    setSelectedLanguage(languageCode);
    if (userId) {
      await saveLanguageForUser(userId, languageCode);
    } else {
      await saveLanguage(languageCode);
    }
    // Small delay to show selection before closing
    setTimeout(() => {
      onClose();
    }, 300);
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, isDark && { backgroundColor: "#141414" }]}>
          {/* Header */}
          <View style={[styles.header, isDark && { borderBottomColor: "#222" }]}>
            <Text style={[styles.title, isDark && { color: "#FFF" }]}>
              {t("sections.language.selectLanguage")}
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={isDark ? "#9CA3AF" : "#6B7280"} />
            </TouchableOpacity>
          </View>

          {/* Current Language Info */}
          <View style={[styles.currentLanguageContainer, isDark && { backgroundColor: "#083344" }]}>
            <Ionicons name="globe-outline" size={20} color={isDark ? "#22d3ee" : "#0E7490"} />
            <Text style={[styles.currentLanguageText, isDark && { color: "#22d3ee" }]}>
              {t("sections.language.currentLanguage")}:{" "}
              {LANGUAGES.find((l) => l.code === i18n.language)?.nativeName}
            </Text>
          </View>

          {/* Language List */}
          <ScrollView
            style={styles.languageList}
            showsVerticalScrollIndicator={false}
          >
            {LANGUAGES.map((language) => {
              const isSelected = selectedLanguage === language.code;

              return (
                <TouchableOpacity
                  key={language.code}
                  style={[
                    styles.languageItem,
                    isDark && { backgroundColor: "#1e1e1e" },
                    isSelected && styles.languageItemSelected,
                    isSelected && isDark && { backgroundColor: "#083344", borderColor: "#22d3ee" },
                  ]}
                  onPress={() => handleSelectLanguage(language.code)}
                  activeOpacity={0.7}
                >
                  <View style={styles.languageItemLeft}>
                    <Text style={styles.flag}>{language.flag}</Text>
                    <View style={styles.languageInfo}>
                      <Text
                        style={[
                          styles.languageName,
                          isDark && { color: "#FFF" },
                          isSelected && styles.languageNameSelected,
                          isSelected && isDark && { color: "#22d3ee" },
                        ]}
                      >
                        {language.nativeName}
                      </Text>
                      <Text style={styles.languageEnglishName}>
                        {language.name}
                      </Text>
                    </View>
                  </View>

                  {isSelected && (
                    <View style={styles.checkmarkContainer}>
                      <Ionicons
                        name="checkmark-circle"
                        size={24}
                        color={isDark ? "#22d3ee" : "#0E7490"}
                      />
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 40,
    maxHeight: "70%",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  title: {
    fontSize: 20,
    fontFamily: "Quicksand_700Bold",
    color: "#1F2937",
  },
  closeButton: {
    padding: 4,
  },
  currentLanguageContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0F9FF",
    marginHorizontal: 24,
    marginTop: 16,
    marginBottom: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  currentLanguageText: {
    fontSize: 14,
    fontFamily: "Quicksand_600SemiBold",
    color: "#0E7490",
  },
  languageList: {
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  languageItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 16,
    marginBottom: 8,
    backgroundColor: "#F9FAFB",
    borderWidth: 2,
    borderColor: "transparent",
  },
  languageItemSelected: {
    backgroundColor: "#F0F9FF",
    borderColor: "#0E7490",
  },
  languageItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  flag: {
    fontSize: 32,
    marginRight: 16,
  },
  languageInfo: {
    flex: 1,
  },
  languageName: {
    fontSize: 16,
    fontFamily: "Quicksand_700Bold",
    color: "#1F2937",
    marginBottom: 2,
  },
  languageNameSelected: {
    color: "#0E7490",
  },
  languageEnglishName: {
    fontSize: 13,
    fontFamily: "Quicksand_500Medium",
    color: "#6B7280",
  },
  checkmarkContainer: {
    marginLeft: 12,
  },
});
