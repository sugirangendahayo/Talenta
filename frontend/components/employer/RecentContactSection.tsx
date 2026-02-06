import { Ionicons } from "@expo/vector-icons";
import { Text, TouchableOpacity, View, Linking, Alert, Platform } from "react-native";
import { useRouter } from "expo-router";
import type { RecentContact } from "@/hooks/useDashboard";

interface ContactCardProps {
  contact: RecentContact;
}

const ContactCard = ({ contact }: ContactCardProps) => {
  const router = useRouter();

  const handleCall = () => {
    if (!contact.phone) {
      Alert.alert("No Phone Number", "This candidate hasn't provided a phone number.");
      return;
    }
    const phoneNumber = contact.phone.replace(/[^0-9+]/g, "");
    Linking.openURL(`tel:${phoneNumber}`);
  };

  const handleWhatsApp = () => {
    if (!contact.phone) {
      Alert.alert("No Phone Number", "This candidate hasn't provided a phone number.");
      return;
    }
    const phoneNumber = contact.phone.replace(/[^0-9+]/g, "");
    const message = `Hi ${contact.candidate_name}, I'm reaching out regarding your application for ${contact.job_title}.`;
    
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
          "WhatsApp Not Installed",
          "Please install WhatsApp to use this feature, or use the call option instead."
        );
      }
    });
  };

  const handleEmail = () => {
    const subject = `Regarding: ${contact.job_title}`;
    const body = `Hi ${contact.candidate_name},\n\nI'm reaching out regarding your application for ${contact.job_title}.\n\nBest regards`;
    Linking.openURL(`mailto:${contact.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);
  };

  const getStatusBadge = () => {
    switch (contact.status) {
      case "hired":
        return { text: "Hired", bgColor: "bg-green-100", textColor: "text-green-700" };
      case "shortlisted":
        return { text: "Shortlisted", bgColor: "bg-blue-100", textColor: "text-blue-700" };
      default:
        return { text: contact.status, bgColor: "bg-gray-100", textColor: "text-gray-700" };
    }
  };

  const statusBadge = getStatusBadge();

  const formatLastContact = () => {
    const date = new Date(contact.last_contact);
    const now = new Date();
    const diffTime = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return `${Math.floor(diffDays / 30)} months ago`;
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
            <Text className={`${statusBadge.textColor} text-xs font-quicksandBold`}>
              {statusBadge.text}
            </Text>
          </View>
        </View>
        <Text className="text-xs font-quicksandMedium text-gray-400">
          Last contact: {formatLastContact()}
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
              <Text className="text-xs font-quicksandBold text-white">Call</Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="flex-1 bg-green-600 px-3 py-2 rounded-lg flex flex-row items-center justify-center gap-1"
              onPress={handleWhatsApp}
            >
              <Ionicons name="logo-whatsapp" size={16} color="#fff" />
              <Text className="text-xs font-quicksandBold text-white">WhatsApp</Text>
            </TouchableOpacity>
          </>
        )}

        <TouchableOpacity
          className={`${contact.phone ? "flex-1" : "flex-1"} bg-purple-600 px-3 py-2 rounded-lg flex flex-row items-center justify-center gap-1`}
          onPress={handleEmail}
        >
          <Ionicons name="mail" size={16} color="#fff" />
          <Text className="text-xs font-quicksandBold text-white">Email</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

interface RecentContactsSectionProps {
  contacts: RecentContact[];
}

export default function RecentContactsSection({ contacts }: RecentContactsSectionProps) {
  const router = useRouter();

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
                Contact Candidates
              </Text>
              <Text className="text-xs font-quicksandMedium text-gray-500">
                {contacts.length} candidate{contacts.length > 1 ? "s" : ""} to reach
              </Text>
            </View>
          </View>
          <TouchableOpacity
            className="flex flex-row items-center gap-1"
            onPress={() => router.push("/(employer-tabs)/employers/Applicants")}
          >
            <Text className="text-sm font-quicksandBold text-cyan-700">
              View All
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