import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useApi } from '@sudobility/building_blocks/firebase';
import { useRestaurantSearchManager } from '@sudobility/cravings_lib';
import type { Restaurant as BaseRestaurant } from '@sudobility/cravings_client';

type Restaurant = BaseRestaurant & { summary?: string };
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

const getMapsUrl = (address: string) =>
  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;

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
  }, [restaurants]);

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
            >
              <div
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: '50%',
                  background: '#f97316',
                  border: '3px solid #ffffff',
                  boxShadow: '0 2px 8px rgba(249,115,22,0.7)',
                }}
              />
            </AdvancedMarker>
          );
        })}
        {activeMarker &&
          coords[activeMarker] &&
          (() => {
            const r = restaurants.find(r => `${r.name}-${r.address}` === activeMarker);
            return r ? (
              <InfoWindow
                position={coords[activeMarker]}
                onCloseClick={() => setActiveMarker(null)}
              >
                <div className="text-sm">
                  <p className="font-semibold">{r.name}</p>
                  <p className="text-gray-500 mt-0.5">{r.address}</p>
                  <a
                    href={getMapsUrl(r.address)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 inline-block text-blue-600 hover:underline text-xs font-medium"
                  >
                    Open in Google Maps
                  </a>
                </div>
              </InfoWindow>
            ) : null;
          })()}
      </Map>
      {geocodeStatus && <p className="text-xs text-theme-text-tertiary mt-1">{geocodeStatus}</p>}
    </>
  );
}

const POPULAR_DISHES = [
  { emoji: '🍕', label: 'Pizza' },
  { emoji: '🍔', label: 'Burgers' },
  { emoji: '🍣', label: 'Sushi' },
  { emoji: '🌮', label: 'Tacos' },
  { emoji: '🍜', label: 'Ramen' },
  { emoji: '🍛', label: 'Curry' },
  { emoji: '🥗', label: 'Salad' },
  { emoji: '🥙', label: 'Shawarma' },
];

export default function SearchPage() {
  const { t } = useTranslation('common');
  const { networkClient, baseUrl } = useApi();

  const [location, setLocation] = useState('');
  const [dish, setDish] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [sortBy, setSortBy] = useState<'distance' | 'name'>('distance');

  const { restaurants, isLoading, error } = useRestaurantSearchManager({
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
        <h1 className="text-3xl font-black text-theme-text-primary mb-8 tracking-tight">
          {t('search.title')}
        </h1>

        {/* Search Form */}
        <form
          onSubmit={handleSubmit}
          className="mb-8 p-5 rounded-xl bg-theme-bg-secondary border border-orange-500/30"
          aria-label={t('search.title')}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="search-location"
                className="block text-xs font-bold text-orange-500 uppercase tracking-widest mb-1.5"
              >
                {t('search.location')}
              </label>
              <input
                id="search-location"
                type="text"
                value={location}
                onChange={handleInputChange(setLocation)}
                placeholder={t('search.locationPlaceholder')}
                className="w-full px-4 py-3 rounded-lg border border-theme-border bg-theme-bg-primary text-theme-text-primary focus:outline-none focus:border-orange-500/60 focus:ring-1 focus:ring-orange-500/20 transition-colors"
                aria-required="true"
              />
            </div>
            <div>
              <label
                htmlFor="search-dish"
                className="block text-xs font-bold text-orange-500 uppercase tracking-widest mb-1.5"
              >
                {t('search.dish')}
              </label>
              <input
                id="search-dish"
                type="text"
                value={dish}
                onChange={handleInputChange(setDish)}
                placeholder={t('search.dishPlaceholder')}
                className="w-full px-4 py-3 rounded-lg border border-theme-border bg-theme-bg-primary text-theme-text-primary focus:outline-none focus:border-orange-500/60 focus:ring-1 focus:ring-orange-500/20 transition-colors"
                aria-required="true"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={isSearchDisabled || isLoading}
            className="mt-5 w-full py-3 bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white font-bold rounded-lg text-sm uppercase tracking-wider transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            aria-busy={isLoading}
          >
            {isLoading ? t('common.loading') : t('search.button')}
          </button>
        </form>

        {/* Popular dish chips */}
        {!submitted && (
          <div className="mb-8">
            <p className="text-xs font-bold text-theme-text-tertiary uppercase tracking-widest mb-3">
              Popular
            </p>
            <div className="flex flex-wrap gap-2">
              {POPULAR_DISHES.map(({ emoji, label }) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => setDish(label)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm border transition-colors ${
                    dish === label
                      ? 'bg-orange-500/20 text-orange-400 border-orange-500/40 font-semibold'
                      : 'border-theme-border text-theme-text-secondary hover:border-orange-500/40 hover:text-orange-400 bg-theme-bg-secondary'
                  }`}
                >
                  <span>{emoji}</span>
                  <span>{label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div
            role="alert"
            className="mb-4 p-3 bg-red-900/30 border border-red-800/40 text-red-400 rounded-lg text-sm flex items-center justify-between"
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
              className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto"
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
            <div className="flex flex-wrap gap-2 mb-5">
              <button
                onClick={() => setViewMode('list')}
                className={`px-4 py-2 rounded-lg text-sm font-bold uppercase tracking-wide transition-colors ${
                  viewMode === 'list'
                    ? 'bg-orange-500 text-white'
                    : 'border border-theme-border text-theme-text-secondary hover:bg-theme-bg-secondary'
                }`}
              >
                List
              </button>
              <button
                onClick={() => setViewMode('map')}
                className={`px-4 py-2 rounded-lg text-sm font-bold uppercase tracking-wide transition-colors ${
                  viewMode === 'map'
                    ? 'bg-orange-500 text-white'
                    : 'border border-theme-border text-theme-text-secondary hover:bg-theme-bg-secondary'
                }`}
              >
                Map
              </button>
              {viewMode === 'list' && (
                <>
                  <button
                    onClick={() => setSortBy('distance')}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-full border transition-colors ${sortBy === 'distance' ? 'bg-orange-500/20 text-orange-400 border-orange-500/40' : 'border-theme-border text-theme-text-tertiary'}`}
                  >
                    Sort by Distance
                  </button>
                  <button
                    onClick={() => setSortBy('name')}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-full border transition-colors ${sortBy === 'name' ? 'bg-orange-500/20 text-orange-400 border-orange-500/40' : 'border-theme-border text-theme-text-tertiary'}`}
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
                    className="p-4 rounded-xl bg-theme-bg-secondary border border-theme-border border-l-4 border-l-orange-500"
                    role="listitem"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-theme-text-primary">{restaurant.name}</p>
                        <p className="text-sm text-theme-text-secondary mt-1">
                          {restaurant.address}
                        </p>
                        {restaurant.summary && (
                          <p className="text-sm text-theme-text-tertiary mt-2 leading-relaxed">
                            {restaurant.summary}
                          </p>
                        )}
                      </div>
                      <span className="ml-4 bg-orange-500/15 text-orange-400 px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap shrink-0">
                        {restaurant.distance}
                      </span>
                    </div>
                    <div className="mt-3 flex justify-end">
                      <a
                        href={getMapsUrl(restaurant.address)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 text-xs font-semibold border border-theme-border text-theme-text-tertiary rounded-lg hover:bg-theme-bg-tertiary hover:text-orange-400 hover:border-orange-500/40 transition-colors"
                      >
                        Open in Google Maps
                      </a>
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
