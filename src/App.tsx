import '@fontsource/inter/400.css';
import '@fontsource/inter/600.css';
import '@fontsource/inter/800.css';
import './styles/index.css';

import { useState, useEffect, useCallback, lazy, Suspense } from 'react';
// @ts-expect-error — type fourni par vite-plugin-pwa au runtime
import { useRegisterSW } from 'virtual:pwa-register/react';

import type { ParkingSpot, ActiveTab, FontSize, Favorite } from './types';
import { fetchParkingSpots, MOCK_SPOTS } from './api/grandlyon';
import { cacheSpots, getCachedSpots } from './lib/offlineCache';
import { storage } from './lib/storage';
import { useGeolocation } from './hooks/useGeolocation';
import { useNearestSpots } from './hooks/useNearestSpots';
import { useFavorites } from './hooks/useFavorites';
import { useOnlineStatus } from './hooks/useOnlineStatus';

import { TabBar } from './components/ui/TabBar';
import { SplashScreen } from './components/ui/SplashScreen';
// Lazy-load MapScreen (inclut MapLibre GL JS) pour réduire le bundle initial
const MapScreen = lazy(() => import('./components/screens/MapScreen').then((m) => ({ default: m.MapScreen })));
import { ListScreen } from './components/screens/ListScreen';
import { FavoritesScreen } from './components/screens/FavoritesScreen';
import { SettingsScreen } from './components/screens/SettingsScreen';
import { OfflineBanner } from './components/pwa/OfflineBanner';
import { UpdateToast } from './components/pwa/UpdateToast';

export default function App() {
  const [splash, setSplash]         = useState(true);
  const [tab, setTab]               = useState<ActiveTab>('map');
  const [allSpots, setAllSpots]     = useState<ParkingSpot[]>(MOCK_SPOTS);
  const [loading, setLoading]       = useState(true);
  const [offlineSavedAt, setOfflineSavedAt] = useState<number | null>(null);
  const [dataUpdatedAt, setDataUpdatedAt]   = useState<number | null>(null);
  const [dark, setDark]             = useState(() => storage.getDarkMode());
  const [fontSize, setFontSize]     = useState<FontSize>(() => storage.getFontSize());
  const [radiusM, setRadiusM]       = useState(2000);
  const [locateTrigger, setLocateTrigger] = useState(0);

  const isOnline = useOnlineStatus();
  const { coords: userCoords, retry: retryGeoloc } = useGeolocation();
  const nearbySpots = useNearestSpots(allSpots, userCoords, radiusM);
  const { favorites, addFavorite, removeFavorite, isFavorite } = useFavorites();

  // Service Worker — update flow
  const { needRefresh, updateServiceWorker } = useRegisterSW({
    onRegistered: () => console.info('[Lyon PMR] SW enregistré'),
    onRegisterError: (e: unknown) => console.warn('[Lyon PMR] SW erreur', e),
  });

  // Chargement initial : IndexedDB → réseau si données périmées (> 24h) ou absentes
  useEffect(() => {
    (async () => {
      const { spots: cached, savedAt, isStale } = await getCachedSpots();

      // Affichage immédiat depuis le cache
      if (cached.length > 0) {
        setAllSpots(cached);
        setOfflineSavedAt(savedAt);
        setDataUpdatedAt(savedAt);
        setLoading(false);
      }

      // Fetch réseau seulement si en ligne ET cache absent ou périmé
      if (isOnline && (isStale || cached.length === 0)) {
        const fresh = await fetchParkingSpots();
        const now = Date.now();
        setAllSpots(fresh);
        await cacheSpots(fresh);
        setOfflineSavedAt(null);
        setDataUpdatedAt(now);
      }
      setLoading(false);
    })();
    storage.bumpVisitCount();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Persist préférences
  const handleSetDark = useCallback((v: boolean) => {
    setDark(v);
    storage.setDarkMode(v);
    document.documentElement.classList.toggle('dark', v);
  }, []);

  const handleSetFontSize = useCallback((v: FontSize) => {
    setFontSize(v);
    storage.setFontSize(v);
  }, []);

  // Toggle favori depuis n'importe quel écran
  const handleToggleFavorite = useCallback((spot: ParkingSpot) => {
    if (isFavorite(spot.id)) {
      const fav = (favorites as Favorite[]).find((f) => f.spotId === spot.id);
      if (fav) removeFavorite(fav.id);
    } else {
      addFavorite(spot.id, spot.address, '📍');
    }
  }, [favorites, isFavorite, addFavorite, removeFavorite]);

  const handleFlyTo = useCallback((/* coords: Coordinates */) => {
    // transmis au MapScreen pour centrer la carte
  }, []);

  const handleLocate = useCallback(() => {
    retryGeoloc();
    setLocateTrigger((n) => n + 1);
  }, [retryGeoloc]);

  return (
    <div
      style={{
        width: '100%', height: '100%',
        display: 'flex', flexDirection: 'column',
        position: 'relative',
        fontFamily: 'Inter, system-ui, sans-serif',
        colorScheme: dark ? 'dark' : 'light',
        background: dark ? '#0F0F12' : '#F5F5F7',
      }}
    >
      {/* Splash */}
      {splash && <SplashScreen onDone={() => setSplash(false)} />}

      {/* Bannière hors-ligne */}
      {!isOnline && <OfflineBanner savedAt={offlineSavedAt} dark={dark} />}

      {/* Toast mise à jour SW */}
      {needRefresh[0] && (
        <UpdateToast onUpdate={() => updateServiceWorker(true)} dark={dark} />
      )}

      {/* Écran actif */}
      <div style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
        {tab === 'map' && (
          <Suspense fallback={<div style={{ flex: 1, background: dark ? '#0F0F12' : '#F5F5F7' }} aria-busy="true" aria-label="Chargement de la carte" />}>
          <MapScreen
            spots={nearbySpots}
            userCoords={userCoords}
            favorites={favorites}
            dark={dark}
            fontSize={fontSize}
            radiusM={radiusM}
            locateTrigger={locateTrigger}
            onSetRadius={setRadiusM}
            onFlyTo={handleFlyTo}
            onToggleFavorite={handleToggleFavorite}
            onLocate={handleLocate}
          />
          </Suspense>
        )}
        {tab === 'list' && (
          <ListScreen
            spots={nearbySpots}
            favorites={favorites}
            dark={dark}
            fontSize={fontSize}
            loading={loading}
            onToggleFavorite={handleToggleFavorite}
          />
        )}
        {tab === 'favorites' && (
          <FavoritesScreen
            spots={nearbySpots}
            favorites={favorites}
            dark={dark}
            fontSize={fontSize}
            onRemoveFavorite={removeFavorite}
            onToggleFavorite={handleToggleFavorite}
          />
        )}
        {tab === 'settings' && (
          <SettingsScreen
            dark={dark}
            fontSize={fontSize}
            dataUpdatedAt={dataUpdatedAt}
            onSetDark={handleSetDark}
            onSetFontSize={handleSetFontSize}
          />
        )}
      </div>

      {/* Tab bar */}
      <TabBar active={tab} onChange={setTab} dark={dark} fontSize={fontSize} />
    </div>
  );
}
