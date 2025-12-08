import { View } from "react-native";
import PrimaryButton from "../shared/PrimaryButton";
import SecondaryButton from "../shared/SecondaryButton";

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
  return (
    <View className="flex flex-row space-x-3 my-8">
      {step === 2 && (
        <SecondaryButton title="Back" onPress={onBack} className="flex-1" />
      )}
      <PrimaryButton
        title={step === 1 ? "Continue" : "Create Account"}
        onPress={onNext}
        className="flex-1"
      />
    </View>
  );
}
