import { useTranslation as useI18nTranslation } from 'react-i18next';

// Custom hook that extends react-i18next with additional utilities
export const useTranslation = () => {
  const { t, i18n } = useI18nTranslation();

  // Helper function to format currency based on current language
  const formatCurrency = (amount: number) => {
    const currency = t('common.currency');
    return `${currency}${amount.toLocaleString(i18n.language === 'hi' ? 'en-IN' : i18n.language)}`;
  };

  // Helper function to format dates based on current language
  const formatDate = (date: Date | string) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString(i18n.language, {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Helper function to format time based on current language
  const formatTime = (time: string) => {
    return t(`times.${time}`, time);
  };

  // Check if current language is RTL
  const isRTL = i18n.language === 'ar';

  return {
    t,
    i18n,
    formatCurrency,
    formatDate,
    formatTime,
    isRTL,
    currentLanguage: i18n.language,
  };
};

export default useTranslation;