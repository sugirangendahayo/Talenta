import * as WebBrowser from "expo-web-browser";
import { Alert } from "react-native";

/** Opens a public Talenta page in the device browser. */
export async function openWebPage(url: string): Promise<boolean> {
  try {
    const parsedUrl = new URL(url);

    if (parsedUrl.protocol !== "https:" && parsedUrl.protocol !== "http:") {
      throw new Error("Only HTTP(S) URLs can be opened.");
    }

    await WebBrowser.openBrowserAsync(url);
    return true;
  } catch (error) {
    console.warn("Unable to open web page:", error);
    Alert.alert(
      "Unable to open page",
      "Please check your internet connection and try again.",
    );
    return false;
  }
}
