import { fr } from './fr';
import { nl } from './nl';
import { en } from './en';

export type Language = 'fr' | 'nl' | 'en';
export type TranslationKeys = typeof fr;

export const translations: Record<Language, TranslationKeys> = { fr, nl, en };

export const languageLabels: Record<Language, string> = {
  fr: 'FR',
  nl: 'NL',
  en: 'EN',
};

export const languageFlags: Record<Language, string> = {
  fr: '🇫🇷',
  nl: '🇳🇱',
  en: '🇬🇧',
};

export const languageNames: Record<Language, string> = {
  fr: 'Français',
  nl: 'Nederlands',
  en: 'English',
};
