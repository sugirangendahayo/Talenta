import { View } from "react-native";
import PrimaryButton from "../shared/PrimaryButton";
import SecondaryButton from "../shared/SecondaryButton";
import { useTranslation } from "react-i18next";

interface SignupActionsProps {
  step: number;
  onBack: () => void;
  onNext: () => void;
}

export default function SignupActions({
  step,
  onBack,
  onNext,
}: SignupActionsProps) {
  const { t } = useTranslation("auth");

  return (
    <View className="flex flex-row space-x-3 my-8">
      {step === 2 && (
        <SecondaryButton
          title={t("signup.backButton")}
          onPress={onBack}
          className="flex-1"
        />
      )}
      <PrimaryButton
        title={
          step === 1
            ? t("signup.continueButton")
            : t("signup.createAccountButton")
        }
        onPress={onNext}
        className="flex-1"
      />
    </View>
  );
}
