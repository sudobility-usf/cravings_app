import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useApi } from '@sudobility/building_blocks/firebase';
import { useRestaurantSearchManager } from '@sudobility/cravings_lib';
import type { Restaurant } from '@sudobility/cravings_client';
import {
  APIProvider,
  Map,
  AdvancedMarker,
  InfoWindow,
  useMap,
  useMapsLibrary,
} from '@vis.gl/react-google-maps';
import ScreenContainer from '../components/layout/ScreenContainer';

const MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string;

interface LatLng {
  lat: number;
  lng: number;
}

const geocodeCache: Record<string, LatLng | null> = {};

async function geocodeAddress(address: string): Promise<LatLng | null> {
  if (address in geocodeCache) return geocodeCache[address];
  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address)}&format=json&limit=1`;
  const res = await fetch(url, { headers: { 'Accept-Language': 'en' } });
  const data = (await res.json()) as { lat: string; lon: string }[];
  const result = data[0] ? { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) } : null;
  geocodeCache[address] = result;
  return result;
}

function MapFitter({ coords }: { coords: LatLng[] }) {
  const map = useMap();
  const coreLib = useMapsLibrary('core');
  useEffect(() => {
    if (!map || !coreLib || coords.length === 0) return;
    const bounds = new coreLib.LatLngBounds();
    coords.forEach(c => bounds.extend(c));
    map.fitBounds(bounds, 60);
  }, [map, coreLib, coords]);
  return null;
}

function RestaurantMap({ restaurants }: { restaurants: Restaurant[] }) {
  const [coords, setCoords] = useState<Record<string, LatLng>>({});
  const [geocodeStatus, setGeocodeStatus] = useState<string>('');
  const [activeMarker, setActiveMarker] = useState<string | null>(null);

  useEffect(() => {
    if (restaurants.length === 0) return;
    const newCoords: Record<string, LatLng> = {};
    Promise.all(
      restaurants.map(async r => {
        const key = `${r.name}-${r.address}`;
        const coord = await geocodeAddress(r.address);
        if (coord) newCoords[key] = coord;
      })
    ).then(() => {
      setCoords(newCoords);
      setGeocodeStatus(`Pinned ${Object.keys(newCoords).length}/${restaurants.length} restaurants`);
    });
  }, [restaurants]);  // eslint-disable-line react-hooks/exhaustive-deps

  const coordValues = Object.values(coords);

  return (
    <>
      <Map
        style={{ width: '100%', height: '480px', borderRadius: '8px' }}
        defaultCenter={{ lat: 37.7749, lng: -122.4194 }}
        defaultZoom={13}
        mapId="cravings-map"
      >
        <MapFitter coords={coordValues} />
        {restaurants.map((restaurant: Restaurant) => {
          const key = `${restaurant.name}-${restaurant.address}`;
          const pos = coords[key];
          if (!pos) return null;
          return (
            <AdvancedMarker
              key={key}
              position={pos}
              onClick={() => setActiveMarker(activeMarker === key ? null : key)}
            />
          );
        })}
        {activeMarker && coords[activeMarker] && (() => {
          const r = restaurants.find(r => `${r.name}-${r.address}` === activeMarker);
          return r ? (
            <InfoWindow
              position={coords[activeMarker]}
              onCloseClick={() => setActiveMarker(null)}
            >
              <div className="text-sm">
                <p className="font-semibold">{r.name}</p>
                <p className="text-theme-text-secondary mt-0.5">{r.address}</p>
              </div>
            </InfoWindow>
          ) : null;
        })()}
      </Map>
      {geocodeStatus && <p className="text-xs text-theme-text-tertiary mt-1">{geocodeStatus}</p>}
    </>
  );
}

export default function SearchPage() {
  const { t } = useTranslation('common');
  const { networkClient, baseUrl } = useApi();

  const [location, setLocation] = useState('');
  const [dish, setDish] = useState('');
  const [committedLocation, setCommittedLocation] = useState('');
  const [committedDish, setCommittedDish] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [sortBy, setSortBy] = useState<'distance' | 'name'>('distance');

  const { restaurants, isLoading, error } = useRestaurantSearchManager({
    baseUrl,
    networkClient,
    location: committedLocation,
    dish: committedDish,
    enabled: submitted,
  });

  const isSearchDisabled = !location.trim() || !dish.trim();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSearchDisabled) return;
    setCommittedLocation(location.trim());
    setCommittedDish(dish.trim());
    setSubmitted(true);
  };

  const handleInputChange =
    (setter: (val: string) => void) => (e: React.ChangeEvent<HTMLInputElement>) => {
      setter(e.target.value);
    };

  const sortedRestaurants = [...restaurants].sort((a, b) => {
    if (sortBy === 'name') return a.name.localeCompare(b.name);
    return parseFloat(a.distance) - parseFloat(b.distance);
  });

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
            <button
              onClick={() => window.location.reload()}
              className="ml-4 underline hover:no-underline text-sm"
            >
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

        {/* Empty states */}
        {!isLoading && submitted && restaurants.length === 0 && !error && (
          <p className="text-center text-theme-text-tertiary py-8">{t('search.noResults')}</p>
        )}
        {!isLoading && !submitted && !error && (
          <p className="text-center text-theme-text-tertiary py-8">{t('search.empty')}</p>
        )}

        {/* Controls + Results */}
        {restaurants.length > 0 && (
          <>
            <div className="flex flex-wrap gap-2 mb-4">
              <button
                onClick={() => setViewMode('list')}
                className={`px-4 py-2 rounded-lg text-sm font-medium ${
                  viewMode === 'list'
                    ? 'bg-blue-600 text-white'
                    : 'border border-theme-border text-theme-text-secondary hover:bg-theme-bg-secondary'
                }`}
              >
                List
              </button>
              <button
                onClick={() => setViewMode('map')}
                className={`px-4 py-2 rounded-lg text-sm font-medium ${
                  viewMode === 'map'
                    ? 'bg-blue-600 text-white'
                    : 'border border-theme-border text-theme-text-secondary hover:bg-theme-bg-secondary'
                }`}
              >
                Map
              </button>
              {viewMode === 'list' && (
                <>
                  <button
                    onClick={() => setSortBy('distance')}
                    className={`px-3 py-1 text-sm rounded border ${sortBy === 'distance' ? 'bg-blue-600 text-white border-blue-600' : 'border-theme-border text-theme-text-secondary'}`}
                  >
                    Sort by Distance
                  </button>
                  <button
                    onClick={() => setSortBy('name')}
                    className={`px-3 py-1 text-sm rounded border ${sortBy === 'name' ? 'bg-blue-600 text-white border-blue-600' : 'border-theme-border text-theme-text-secondary'}`}
                  >
                    Sort by Name (A→Z)
                  </button>
                </>
              )}
            </div>

            {viewMode === 'list' && (
              <div className="space-y-2" role="list" aria-label="Restaurant results">
                {sortedRestaurants.map((restaurant: Restaurant, index: number) => (
                  <div
                    key={`${restaurant.name}-${restaurant.address}-${index}`}
                    className="p-4 rounded-lg border border-theme-border"
                    role="listitem"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold text-theme-text-primary">{restaurant.name}</p>
                        <p className="text-sm text-theme-text-secondary mt-1">
                          {restaurant.address}
                        </p>
                      </div>
                      <span className="ml-4 text-sm font-medium text-blue-600 whitespace-nowrap">
                        {restaurant.distance}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {viewMode === 'map' && (
              <APIProvider apiKey={MAPS_API_KEY}>
                <RestaurantMap restaurants={restaurants} />
              </APIProvider>
            )}
          </>
        )}
      </div>
    </ScreenContainer>
  );
}
