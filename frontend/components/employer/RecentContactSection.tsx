import type { RecentContact } from "@/hooks/useDashboard";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import {
  Alert,
  Linking,
  Platform,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface ContactCardProps {
  contact: RecentContact;
}

const ContactCard = ({ contact }: ContactCardProps) => {
  const router = useRouter();
  const { t } = useTranslation(["dashboard", "common"]);

  const handleCall = () => {
    if (!contact.phone) {
      Alert.alert(t("alerts.noPhone.title"), t("alerts.noPhone.message"));
      return;
    }
    const phoneNumber = contact.phone.replace(/[^0-9+]/g, "");
    Linking.openURL(`tel:${phoneNumber}`);
  };

  const handleWhatsApp = () => {
    if (!contact.phone) {
      Alert.alert(t("alerts.noPhone.title"), t("alerts.noPhone.message"));
      return;
    }
    const phoneNumber = contact.phone.replace(/[^0-9+]/g, "");
    const message = t("alerts.whatsapp.message", {
      candidateName: contact.candidate_name,
      jobTitle: contact.job_title,
    });

    // WhatsApp URL schemes
    const whatsappURL = Platform.select({
      ios: `whatsapp://send?phone=${phoneNumber}&text=${encodeURIComponent(message)}`,
      android: `whatsapp://send?phone=${phoneNumber}&text=${encodeURIComponent(message)}`,
      default: `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`,
    });

    Linking.canOpenURL(whatsappURL!).then((supported) => {
      if (supported) {
        Linking.openURL(whatsappURL!);
      } else {
        Alert.alert(
          t("alerts.whatsapp.notInstalled.title"),
          t("alerts.whatsapp.notInstalled.message"),
        );
      }
    });
  };

  const handleEmail = () => {
    const subject = t("alerts.email.subject", { jobTitle: contact.job_title });
    const body = t("alerts.email.body", {
      candidateName: contact.candidate_name,
      jobTitle: contact.job_title,
    });
    Linking.openURL(
      `mailto:${contact.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`,
    );
  };

  const getStatusBadge = () => {
    switch (contact.status) {
      case "hired":
        return {
          text: t("status.hired"),
          bgColor: "bg-green-100",
          textColor: "text-green-700",
        };
      case "shortlisted":
        return {
          text: t("status.shortlisted"),
          bgColor: "bg-blue-100",
          textColor: "text-blue-700",
        };
      default:
        return {
          text: contact.status,
          bgColor: "bg-gray-100",
          textColor: "text-gray-700",
        };
    }
  };

  const statusBadge = getStatusBadge();

  const formatLastContact = () => {
    const date = new Date(contact.last_contact);
    const now = new Date();
    const diffTime = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return t("time.today");
    if (diffDays === 1) return t("time.yesterday");
    if (diffDays < 7) return t("time.daysAgo", { days: diffDays });
    if (diffDays < 30)
      return t("time.weeksAgo", { weeks: Math.floor(diffDays / 7) });
    return t("time.monthsAgo", { months: Math.floor(diffDays / 30) });
  };

  return (
    <View className="bg-gray-50 rounded-xl p-3 border border-gray-200 mb-3">
      {/* Candidate Info */}
      <TouchableOpacity
        className="mb-3"
        onPress={() =>
          router.push({
            pathname: "/(employer-tabs)/employers/Applicants",
            params: { applicationId: contact.id },
          })
        }
      >
        <View className="flex flex-row items-start justify-between mb-1">
          <View className="flex-1">
            <Text className="text-base font-quicksandBold text-gray-800">
              {contact.candidate_name}
            </Text>
            <Text className="text-xs font-quicksandMedium text-gray-500 mt-0.5">
              {contact.job_title}
            </Text>
          </View>
          <View className={`${statusBadge.bgColor} px-2 py-1 rounded-full`}>
            <Text
              className={`${statusBadge.textColor} text-xs font-quicksandBold`}
            >
              {statusBadge.text}
            </Text>
          </View>
        </View>
        <Text className="text-xs font-quicksandMedium text-gray-400">
          {t("lastContact")}: {formatLastContact()}
        </Text>
      </TouchableOpacity>

      {/* Contact Actions */}
      <View className="flex flex-row items-center gap-2 pt-3 border-t border-gray-200">
        {contact.phone && (
          <>
            <TouchableOpacity
              className="flex-1 bg-cyan-700 px-3 py-2 rounded-lg flex flex-row items-center justify-center gap-1"
              onPress={handleCall}
            >
              <Ionicons name="call" size={16} color="#fff" />
              <Text className="text-xs font-quicksandBold text-white">
                {t("buttons.call", {ns: "common"})}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="flex-1 bg-green-600 px-3 py-2 rounded-lg flex flex-row items-center justify-center gap-1"
              onPress={handleWhatsApp}
            >
              <Ionicons name="logo-whatsapp" size={16} color="#fff" />
              <Text className="text-xs font-quicksandBold text-white">
                {t("buttons.whatsapp", {ns: "common"})}
              </Text>
            </TouchableOpacity>
          </>
        )}

        <TouchableOpacity
          className={`${contact.phone ? "flex-1" : "flex-1"} bg-purple-600 px-3 py-2 rounded-lg flex flex-row items-center justify-center gap-1`}
          onPress={handleEmail}
        >
          <Ionicons name="mail" size={16} color="#fff" />
          <Text className="text-xs font-quicksandBold text-white">
            {t("buttons.email", {ns: "common"})}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

interface RecentContactsSectionProps {
  contacts: RecentContact[];
}

export default function RecentContactsSection({
  contacts,
}: RecentContactsSectionProps) {
  const router = useRouter();
  const { t } = useTranslation(["dashboard", "common"]);

  if (contacts.length === 0) return null;

  return (
    <View className="mx-4 my-2 mb-4">
      <View className="bg-white rounded-2xl p-4 border border-gray-200">
        {/* Header */}
        <View className="flex flex-row items-center justify-between mb-3">
          <View className="flex flex-row items-center gap-2">
            <View className="w-8 h-8 bg-purple-100 rounded-full items-center justify-center">
              <Ionicons name="people" size={18} color="#8B5CF6" />
            </View>
            <View>
              <Text className="text-base font-quicksandBold text-gray-800">
                {t("sections.recentContacts.title")}
              </Text>
              <Text className="text-xs font-quicksandMedium text-gray-500">
                {contacts.length} {t("sections.recentContacts.candidate")}
                {contacts.length > 1
                  ? t("sections.recentContacts.plural")
                  : ""}{" "}
                {t("sections.recentContacts.toReach")}
              </Text>
            </View>
          </View>
          <TouchableOpacity
            className="flex flex-row items-center gap-1"
            onPress={() => router.push("/(employer-tabs)/employers/Applicants")}
          >
            <Text className="text-sm font-quicksandBold text-cyan-700">
              {t("buttons.viewAll", { ns: "common" })}
            </Text>
            <Ionicons name="arrow-forward" size={14} color="#0E7490" />
          </TouchableOpacity>
        </View>

        {/* Contacts List */}
        <View>
          {contacts.map((contact) => (
            <ContactCard key={contact.id} contact={contact} />
          ))}
        </View>
      </View>
    </View>
  );
}
