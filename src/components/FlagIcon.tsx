import { Language } from '@/i18n/translations';

const flags: Record<Language, JSX.Element> = {
  fr: (
    <svg viewBox="0 0 640 480" className="w-5 h-3.5 rounded-sm shadow-sm">
      <rect width="213.3" height="480" fill="#002654" />
      <rect x="213.3" width="213.4" height="480" fill="#fff" />
      <rect x="426.7" width="213.3" height="480" fill="#CE1126" />
    </svg>
  ),
  nl: (
    <svg viewBox="0 0 640 480" className="w-5 h-3.5 rounded-sm shadow-sm">
      <rect width="640" height="160" fill="#AE1C28" />
      <rect y="160" width="640" height="160" fill="#fff" />
      <rect y="320" width="640" height="160" fill="#21468B" />
    </svg>
  ),
  en: (
    <svg viewBox="0 0 640 480" className="w-5 h-3.5 rounded-sm shadow-sm">
      <rect width="640" height="480" fill="#012169" />
      <path d="M75 0l244 181L562 0h78v62L400 241l240 178v61h-80L320 301 81 480H0v-60l239-178L0 64V0h75z" fill="#fff" />
      <path d="M424 281l216 159v40L369 281h55zm-184 20l6 35L54 480H0l240-179zM640 0v3L391 191l2-44L590 0h50zM0 0l239 176h-60L0 42V0z" fill="#C8102E" />
      <path d="M241 0v480h160V0H241zM0 160v160h640V160H0z" fill="#fff" />
      <path d="M0 193v96h640v-96H0zM273 0v480h96V0h-96z" fill="#C8102E" />
    </svg>
  ),
};

export function FlagIcon({ lang }: { lang: Language }) {
  return flags[lang];
}
