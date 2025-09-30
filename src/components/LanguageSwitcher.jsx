import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu.jsx';
import { Button } from '@/components/ui/button';
import { Globe } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/SupabaseAuthContext';

const languages = [
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'sw', name: 'Kiswahili', flag: '🇰🇪' },
];

const LanguageSwitcher = ({ isTransparentBg, isDashboard }) => {
  const { i18n } = useTranslation();
  const { user, updateUser } = useAuth();

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    if (user) {
      updateUser({ preferred_language: lng });
    }
  };

  const currentLanguage = languages.find(l => l.code === i18n.language) || languages[0];

  const buttonClasses = cn(
    'px-2',
    isDashboard 
      ? 'text-gray-700 dark:text-gray-200 hover:bg-gray-200/80 dark:hover:bg-gray-700/80'
      : isTransparentBg
        ? "text-white hover:bg-white/10 hover:text-white"
        : "text-gray-700 dark:text-gray-200 hover:bg-gray-200/80 dark:hover:bg-gray-700/80"
  );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className={buttonClasses}>
          <Globe className="w-5 h-5" />
          <span className="ml-2 font-medium uppercase text-sm">{currentLanguage.code}</span>
          <span className="sr-only">Change language</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {languages.map((lang) => (
          <DropdownMenuItem key={lang.code} onClick={() => changeLanguage(lang.code)}>
            <span className="mr-2 text-lg">{lang.flag}</span>
            <span>{lang.name}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default LanguageSwitcher;