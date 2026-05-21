import { useTranslation } from 'react-i18next';
import ScreenContainer from '../components/layout/ScreenContainer';
import LocalizedLink from '../components/layout/LocalizedLink';

export default function HomePage() {
  const { t } = useTranslation('common');

  return (
    <ScreenContainer>
      {/* Hero */}
      <div className="border-b border-theme-border bg-theme-bg-secondary">
        <div className="container-app px-4 sm:px-6 lg:px-8 py-24 text-center">
          <p className="text-orange-500 text-sm font-bold uppercase tracking-widest mb-4">
            🍽️ Cravings
          </p>
          <h1 className="text-5xl font-black text-theme-text-primary mb-5 tracking-tight leading-tight">
            {t('home.title')}
          </h1>
          <p className="text-lg text-theme-text-secondary mb-10 max-w-xl mx-auto leading-relaxed">
            {t('home.description')}
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <LocalizedLink
              to="/search"
              className="px-8 py-3 bg-orange-500 text-white font-bold rounded-lg hover:bg-orange-600 transition-colors text-sm uppercase tracking-wider shadow-lg shadow-orange-500/25"
            >
              {t('home.viewDocs')}
            </LocalizedLink>
            <LocalizedLink
              to="/histories"
              className="px-8 py-3 border border-theme-border rounded-lg text-theme-text-primary font-medium hover:bg-theme-hover-bg transition-colors text-sm"
            >
              {t('home.viewHistories')}
            </LocalizedLink>
          </div>
        </div>
      </div>

      {/* Feature cards */}
      <div className="container-app px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <div className="p-6 rounded-xl border border-theme-border bg-theme-bg-secondary border-t-2 border-t-orange-500">
            <div className="text-2xl mb-3">🍜</div>
            <h3 className="text-base font-bold text-theme-text-primary mb-2">
              {t('home.feature1Title')}
            </h3>
            <p className="text-sm text-theme-text-secondary leading-relaxed">{t('home.feature1Desc')}</p>
          </div>
          <div className="p-6 rounded-xl border border-theme-border bg-theme-bg-secondary border-t-2 border-t-orange-500">
            <div className="text-2xl mb-3">🗺️</div>
            <h3 className="text-base font-bold text-theme-text-primary mb-2">
              {t('home.feature2Title')}
            </h3>
            <p className="text-sm text-theme-text-secondary leading-relaxed">{t('home.feature2Desc')}</p>
          </div>
          <div className="p-6 rounded-xl border border-theme-border bg-theme-bg-secondary border-t-2 border-t-orange-500">
            <div className="text-2xl mb-3">🕐</div>
            <h3 className="text-base font-bold text-theme-text-primary mb-2">
              {t('home.feature3Title')}
            </h3>
            <p className="text-sm text-theme-text-secondary leading-relaxed">{t('home.feature3Desc')}</p>
          </div>
        </div>
      </div>
    </ScreenContainer>
  );
}
