import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';

export const TranslationDemo = () => {
  const { t, i18n } = useTranslation();

  return (
    <Card className="max-w-md mx-auto m-4">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          {t('navbar.language')} Demo
          <LanguageSwitcher size="sm" />
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p><strong>{t('navbar.home')}:</strong> {t('hero.title')}</p>
        </div>
        <div>
          <p><strong>{t('cars.bookNow')}:</strong> {t('cars.title')}</p>
        </div>
        <div>
          <p><strong>{t('common.currency')}:</strong> {t('common.currency')}1,50,000</p>
        </div>
        <div>
          <p><strong>Current Language:</strong> {i18n.language}</p>
        </div>
        <div>
          <p><strong>Direction:</strong> {i18n.language === 'ar' ? 'RTL' : 'LTR'}</p>
        </div>
      </CardContent>
    </Card>
  );
};