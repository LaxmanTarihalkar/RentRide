import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { Navbar } from '@/components/Navbar';

const LanguageTest = () => {
  const { t, i18n } = useTranslation();

  return (
    <div className="min-h-screen bg-background">
      <Navbar forceBackground={true} />
      
      <div className="container mx-auto px-4 pt-24 pb-12">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold">{t('navbar.language')} Test</h1>
            <p className="text-muted-foreground">Current Language: {i18n.language}</p>
            <LanguageSwitcher />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            
            {/* Navigation Translations */}
            <Card>
              <CardHeader>
                <CardTitle>Navigation</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p><strong>{t('navbar.home')}:</strong> {t('navbar.home')}</p>
                <p><strong>{t('navbar.cars')}:</strong> {t('navbar.cars')}</p>
                <p><strong>{t('navbar.profile')}:</strong> {t('navbar.profile')}</p>
                <p><strong>{t('navbar.myBookings')}:</strong> {t('navbar.myBookings')}</p>
              </CardContent>
            </Card>

            {/* Hero Translations */}
            <Card>
              <CardHeader>
                <CardTitle>Hero Section</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p><strong>Title:</strong> {t('hero.title')}</p>
                <p><strong>Subtitle:</strong> {t('hero.subtitle')}</p>
                <p><strong>Button:</strong> {t('hero.bookNow')}</p>
              </CardContent>
            </Card>

            {/* Cars Translations */}
            <Card>
              <CardHeader>
                <CardTitle>Cars Page</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p><strong>Title:</strong> {t('cars.title')}</p>
                <p><strong>Book Now:</strong> {t('cars.bookNow')}</p>
                <p><strong>Per Day:</strong> {t('cars.perDay')}</p>
                <p><strong>Search:</strong> {t('cars.searchPlaceholder')}</p>
              </CardContent>
            </Card>

            {/* Booking Translations */}
            <Card>
              <CardHeader>
                <CardTitle>Booking</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p><strong>Title:</strong> {t('booking.title', { carName: 'Tesla Model S' })}</p>
                <p><strong>Subtitle:</strong> {t('booking.subtitle')}</p>
                <p><strong>Confirm:</strong> {t('booking.confirmBooking')}</p>
              </CardContent>
            </Card>

            {/* Payment Translations */}
            <Card>
              <CardHeader>
                <CardTitle>Payment</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p><strong>Title:</strong> {t('payment.title')}</p>
                <p><strong>Pay:</strong> {t('payment.pay')}</p>
                <p><strong>Subtitle:</strong> {t('payment.subtitle', { carName: 'BMW M4' })}</p>
              </CardContent>
            </Card>

            {/* Success Translations */}
            <Card>
              <CardHeader>
                <CardTitle>Success</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p><strong>Title:</strong> {t('bookingSuccess.title')}</p>
                <p><strong>Subtitle:</strong> {t('bookingSuccess.subtitle', { carName: 'Mercedes S-Class' })}</p>
              </CardContent>
            </Card>

            {/* Common Translations */}
            <Card>
              <CardHeader>
                <CardTitle>Common</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p><strong>Loading:</strong> {t('common.loading')}</p>
                <p><strong>Success:</strong> {t('common.success')}</p>
                <p><strong>Cancel:</strong> {t('common.cancel')}</p>
                <p><strong>Confirm:</strong> {t('common.confirm')}</p>
                <p><strong>Currency:</strong> {t('common.currency')}1,50,000</p>
              </CardContent>
            </Card>

            {/* Time Translations */}
            <Card>
              <CardHeader>
                <CardTitle>Time Formats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p><strong>08:00:</strong> {t('times.08:00')}</p>
                <p><strong>12:00:</strong> {t('times.12:00')}</p>
                <p><strong>18:00:</strong> {t('times.18:00')}</p>
              </CardContent>
            </Card>

            {/* Language Info */}
            <Card>
              <CardHeader>
                <CardTitle>Language Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p><strong>Current:</strong> {i18n.language}</p>
                <p><strong>Fallback:</strong> en</p>
                <p><strong>Direction:</strong> {i18n.language === 'ar' ? 'RTL' : 'LTR'}</p>
                <p><strong>Loaded:</strong> {i18n.isInitialized ? 'Yes' : 'No'}</p>
              </CardContent>
            </Card>

          </div>
        </div>
      </div>
    </div>
  );
};

export default LanguageTest;