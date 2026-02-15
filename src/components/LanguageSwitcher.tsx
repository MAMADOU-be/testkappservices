import { useLanguage } from '@/i18n/LanguageContext';
import { Language, languageFlags, languageNames } from '@/i18n/translations';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Globe } from 'lucide-react';

const languages: Language[] = ['fr', 'nl', 'en'];

interface LanguageSwitcherProps {
  variant?: 'header' | 'footer';
}

export function LanguageSwitcher({ variant = 'header' }: LanguageSwitcherProps) {
  const { language, setLanguage } = useLanguage();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-sm font-medium transition-colors focus:outline-none ${
            variant === 'footer'
              ? 'text-background/70 hover:text-primary hover:bg-background/10'
              : 'text-muted-foreground hover:text-primary hover:bg-primary/5'
          }`}
          aria-label="Change language"
        >
          <Globe className="w-4 h-4" />
          <span>{languageFlags[language]} {language.toUpperCase()}</span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[140px]">
        {languages.map((lang) => (
          <DropdownMenuItem
            key={lang}
            onClick={() => setLanguage(lang)}
            className={`flex items-center gap-2 cursor-pointer ${
              language === lang ? 'bg-primary/10 text-primary font-medium' : ''
            }`}
          >
            <span className="text-base">{languageFlags[lang]}</span>
            <span>{languageNames[lang]}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
