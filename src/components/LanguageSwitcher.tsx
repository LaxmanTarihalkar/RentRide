import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Globe } from 'lucide-react';
import { languages, getLanguageName, getLanguageFlag } from '@/i18n';

interface LanguageSwitcherProps {
  variant?: 'default' | 'ghost' | 'outline';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  showText?: boolean;
}

export const LanguageSwitcher = ({ 
  variant = 'ghost', 
  size = 'default',
  showText = true 
}: LanguageSwitcherProps) => {
  const { i18n, t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  const changeLanguage = (languageCode: string) => {
    i18n.changeLanguage(languageCode);
    setIsOpen(false);
    
    // Update document direction for RTL languages
    if (languageCode === 'ar') {
      document.documentElement.dir = 'rtl';
      document.documentElement.lang = 'ar';
    } else {
      document.documentElement.dir = 'ltr';
      document.documentElement.lang = languageCode;
    }
  };

  const currentLanguage = languages.find(lang => lang.code === i18n.language) || languages[0];

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button 
          variant={variant} 
          size={size} 
          className="gap-2 border-2 border-accent/60 bg-background/95 hover:bg-accent/25 backdrop-blur-md rounded-xl transition-all duration-200 hover:border-accent/80 shadow-xl hover:shadow-accent/30 font-semibold ring-2 ring-accent/20 hover:ring-accent/40 hover:scale-105 transform"
        >
          <Globe className="h-4 w-4" />
          {showText && (
            <>
              <span className="text-base">{currentLanguage.flag}</span>
              <span className="hidden sm:inline font-medium">{getLanguageName(i18n.language)}</span>
            </>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52 border-2 border-accent/30 bg-background/95 backdrop-blur-md rounded-xl shadow-xl ring-1 ring-accent/10">
        {languages.map((language) => (
          <DropdownMenuItem
            key={language.code}
            onClick={() => changeLanguage(language.code)}
            className={`flex items-center gap-3 cursor-pointer rounded-lg mx-1 my-0.5 px-3 py-2.5 transition-all duration-200 ${
              i18n.language === language.code 
                ? 'bg-accent text-accent-foreground shadow-sm' 
                : 'hover:bg-accent/50'
            }`}
          >
            <span className="text-lg">{language.flag}</span>
            <span className="flex-1 font-medium">{language.name}</span>
            {i18n.language === language.code && (
              <span className="text-sm text-accent-foreground font-bold">✓</span>
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default LanguageSwitcher;