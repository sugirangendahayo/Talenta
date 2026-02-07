/* eslint-disable import/no-named-as-default-member */

import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Localization from 'expo-localization';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Import translations
import en from './locales/en';
import fr from './locales/fr';
import rw from './locales/rw';

const LANGUAGE_KEY = '@app_language';

// Supported languages
const supportedLanguages = ['en', 'fr', 'rw'] as const;

/**
 * Get device language safely
 */
const getDeviceLanguage = () => {
  const locales = Localization.getLocales();
  const deviceLang = locales[0]?.languageCode || 'en';

  return supportedLanguages.includes(deviceLang as any)
    ? deviceLang
    : 'en';
};

/**
 * Load saved language OR fallback to device language
 */
const getInitialLanguage = async () => {
  try {
    const saved = await AsyncStorage.getItem(LANGUAGE_KEY);
    return saved || getDeviceLanguage();
  } catch {
    return getDeviceLanguage();
  }
};

/**
 * Initialize i18next
 */
const initI18n = async () => {
  const initialLanguage = await getInitialLanguage();

  await i18n
    .use(initReactI18next)
    .init({
      resources: {
        en: en.translation,
        fr: fr.translation,
        rw: rw.translation,
      },
      lng: initialLanguage,
      fallbackLng: 'en',
      interpolation: {
        escapeValue: false,
      },
      react: {
        useSuspense: false,
      },
    });
};

/**
 * Save user-selected language
 */
export const saveLanguage = async (language: string) => {
  await AsyncStorage.setItem(LANGUAGE_KEY, language);
  i18n.changeLanguage(language);
};

// Initialize immediately
initI18n();

export default i18n;
