import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useApi } from '@sudobility/building_blocks/firebase';
import { useRestaurantSearchManager } from '@sudobility/cravings_lib';
import type { Restaurant } from '@sudobility/cravings_client';
import ScreenContainer from '../components/layout/ScreenContainer';

/**
 * Page allowing users to search for restaurants by location and dish.
 * No authentication required — the search endpoint is public.
 */
export default function SearchPage() {
  const { t } = useTranslation('common');
  const { networkClient, baseUrl } = useApi();

  const [location, setLocation] = useState('');
  const [dish, setDish] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const { restaurants, isLoading, error, search } = useRestaurantSearchManager({
    baseUrl,
    networkClient,
    location: submitted ? location.trim() : '',
    dish: submitted ? dish.trim() : '',
    enabled: submitted,
  });

  const isSearchDisabled = !location.trim() || !dish.trim();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSearchDisabled) return;
    setSubmitted(true);
    search();
  };

  const handleInputChange =
    (setter: (val: string) => void) => (e: React.ChangeEvent<HTMLInputElement>) => {
      setter(e.target.value);
      setSubmitted(false);
    };

  return (
    <ScreenContainer>
      <div className="container-app px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold text-theme-text-primary mb-6">{t('search.title')}</h1>

        {/* Search Form */}
        <form
          onSubmit={handleSubmit}
          className="mb-6 p-4 rounded-lg border border-theme-border"
          aria-label={t('search.title')}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="search-location"
                className="block text-sm font-medium text-theme-text-secondary mb-1"
              >
                {t('search.location')}
              </label>
              <input
                id="search-location"
                type="text"
                value={location}
                onChange={handleInputChange(setLocation)}
                placeholder={t('search.locationPlaceholder')}
                className="w-full px-3 py-2 rounded-md border border-theme-border bg-theme-bg-primary text-theme-text-primary"
                aria-required="true"
              />
            </div>
            <div>
              <label
                htmlFor="search-dish"
                className="block text-sm font-medium text-theme-text-secondary mb-1"
              >
                {t('search.dish')}
              </label>
              <input
                id="search-dish"
                type="text"
                value={dish}
                onChange={handleInputChange(setDish)}
                placeholder={t('search.dishPlaceholder')}
                className="w-full px-3 py-2 rounded-md border border-theme-border bg-theme-bg-primary text-theme-text-primary"
                aria-required="true"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={isSearchDisabled || isLoading}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            aria-busy={isLoading}
          >
            {isLoading ? t('common.loading') : t('search.button')}
          </button>
        </form>

        {/* Error */}
        {error && (
          <div
            role="alert"
            className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 rounded-lg text-sm flex items-center justify-between"
          >
            <span>{error}</span>
            <button onClick={() => search()} className="ml-4 underline hover:no-underline text-sm">
              {t('search.retry')}
            </button>
          </div>
        )}

        {/* Loading */}
        {isLoading && (
          <div className="text-center py-8">
            <div
              role="status"
              aria-label={t('common.loading')}
              className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"
            />
          </div>
        )}

        {/* Results */}
        {!isLoading && submitted && restaurants.length === 0 && !error && (
          <p className="text-center text-theme-text-tertiary py-8">{t('search.noResults')}</p>
        )}

        {!isLoading && !submitted && !error && (
          <p className="text-center text-theme-text-tertiary py-8">{t('search.empty')}</p>
        )}

        {restaurants.length > 0 && (
          <div className="space-y-2" role="list" aria-label="Restaurant results">
            {restaurants.map((restaurant: Restaurant, index: number) => (
              <div
                key={`${restaurant.name}-${restaurant.address}-${index}`}
                className="p-4 rounded-lg border border-theme-border"
                role="listitem"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold text-theme-text-primary">{restaurant.name}</p>
                    <p className="text-sm text-theme-text-secondary mt-1">{restaurant.address}</p>
                  </div>
                  <span className="ml-4 text-sm font-medium text-blue-600 whitespace-nowrap">
                    {restaurant.distance}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </ScreenContainer>
  );
}
