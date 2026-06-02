/* eslint-disable import/no-named-as-default-member */

import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Localization from 'expo-localization';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Import translations
import en from './locales/en';
import fr from './locales/fr';
import rw from './locales/rw';

/** Global fallback key (device-level, used before any user logs in) */
const GLOBAL_LANGUAGE_KEY = '@app_language';

/** Returns the per-user AsyncStorage key */
const userLanguageKey = (userId: string) => `@app_language_${userId}`;

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
 * Load the device-level fallback language (used on app start before login)
 */
const getInitialLanguage = async () => {
  try {
    const saved = await AsyncStorage.getItem(GLOBAL_LANGUAGE_KEY);
    return saved || getDeviceLanguage();
  } catch {
    return getDeviceLanguage();
  }
};

/**
 * Load a specific user's saved language preference.
 * Falls back to the global/device language if none is stored.
 */
export const loadLanguageForUser = async (userId: string): Promise<string> => {
  try {
    const saved = await AsyncStorage.getItem(userLanguageKey(userId));
    if (saved) return saved;
    // No user-specific preference — use the global/device default
    const globalSaved = await AsyncStorage.getItem(GLOBAL_LANGUAGE_KEY);
    return globalSaved || getDeviceLanguage();
  } catch {
    return getDeviceLanguage();
  }
};

/**
 * Save a language for a specific user (scoped to userId).
 * Also updates i18n immediately.
 */
export const saveLanguageForUser = async (userId: string, language: string) => {
  await AsyncStorage.setItem(userLanguageKey(userId), language);
  i18n.changeLanguage(language);
};

/**
 * Save language globally (device-level, no user scope).
 * Use this only when no user is logged in.
 * @deprecated Prefer saveLanguageForUser when a user is authenticated.
 */
export const saveLanguage = async (language: string) => {
  await AsyncStorage.setItem(GLOBAL_LANGUAGE_KEY, language);
  i18n.changeLanguage(language);
};

/**
 * Apply a user's saved language to i18n (call after login).
 */
export const applyUserLanguage = async (userId: string) => {
  const lang = await loadLanguageForUser(userId);
  i18n.changeLanguage(lang);
};

/**
 * Reset to the device/global language (call after logout).
 */
export const resetToDeviceLanguage = async () => {
  const lang = await getInitialLanguage();
  i18n.changeLanguage(lang);
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

// Initialize immediately
initI18n();

export default i18n;
