import '@fontsource/inter/400.css';
import '@fontsource/inter/600.css';
import '@fontsource/inter/800.css';
import './styles/index.css';

import { useState, useEffect, useCallback, lazy, Suspense } from 'react';
// @ts-expect-error — type fourni par vite-plugin-pwa au runtime
import { useRegisterSW } from 'virtual:pwa-register/react';

import type { ParkingSpot, ActiveTab, FontSize } from './types';
import { fetchParkingSpots } from './api/grandlyon';
import { cacheSpots, getCachedSpots } from './lib/offlineCache';
import { storage } from './lib/storage';
import { useGeolocation } from './hooks/useGeolocation';
import { useGeolocationPermission } from './hooks/useGeolocationPermission';
import { useNearestSpots } from './hooks/useNearestSpots';
import { useOnlineStatus } from './hooks/useOnlineStatus';

import { TabBar } from './components/ui/TabBar';
import { SplashScreen } from './components/ui/SplashScreen';
import { GeolocationPrompt } from './components/ui/GeolocationPrompt';
const MapScreen = lazy(() => import('./components/screens/MapScreen').then((m) => ({ default: m.MapScreen })));
import { ListScreen } from './components/screens/ListScreen';
import { SettingsScreen } from './components/screens/SettingsScreen';
import { OfflineBanner } from './components/pwa/OfflineBanner';
import { UpdateToast } from './components/pwa/UpdateToast';

export default function App() {
  const [splash, setSplash]         = useState(true);
  const [tab, setTab]               = useState<ActiveTab>('map');
  const [allSpots, setAllSpots]     = useState<ParkingSpot[]>([]);
  const [loading, setLoading]       = useState(true);
  const [offlineSavedAt, setOfflineSavedAt] = useState<number | null>(null);
  const [dataUpdatedAt, setDataUpdatedAt]   = useState<number | null>(null);
  const [dark, setDark]             = useState(() => storage.getDarkMode());
  const [fontSize, setFontSize]     = useState<FontSize>(() => storage.getFontSize());
  const [locateTrigger, setLocateTrigger] = useState(0);

  const isOnline = useOnlineStatus();
  const { state: geoState, coords: userCoords, retry: retryGeoloc } = useGeolocation();

  // Message d'erreur exposé pour le fallback sans API Permissions (vieux Safari)
  const geoErrorMsg = geoState.status === 'error' ? geoState.message : null;
  const { showPrompt: showGeoPrompt, show: showGeoPromptModal, dismiss: dismissGeoPrompt, isLocationDenied } = useGeolocationPermission(geoErrorMsg);

  const nearbySpots = useNearestSpots(allSpots, userCoords, 2000);

  const { needRefresh, updateServiceWorker } = useRegisterSW({
    onRegistered: () => console.info('[Lyon PMR] SW enregistré'),
    onRegisterError: (e: unknown) => console.warn('[Lyon PMR] SW erreur', e),
  });

  useEffect(() => {
    (async () => {
      if (navigator.onLine) {
        // Toujours charger le jeu complet depuis l'API Grand Lyon
        const fresh = await fetchParkingSpots();
        setAllSpots(fresh);
        await cacheSpots(fresh);
        setOfflineSavedAt(null);
        setDataUpdatedAt(Date.now());
      } else {
        // Hors-ligne : fallback sur le cache local
        const { spots: cached, savedAt } = await getCachedSpots();
        if (cached.length > 0) {
          setAllSpots(cached);
          setOfflineSavedAt(savedAt);
          setDataUpdatedAt(savedAt);
        }
      }
      setLoading(false);
    })();
    storage.bumpVisitCount();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSetDark = useCallback((v: boolean) => {
    setDark(v);
    storage.setDarkMode(v);
    document.documentElement.classList.toggle('dark', v);
  }, []);

  const handleSetFontSize = useCallback((v: FontSize) => {
    setFontSize(v);
    storage.setFontSize(v);
  }, []);

  const handleLocate = useCallback(() => {
    retryGeoloc();
    setLocateTrigger((n) => n + 1);
  }, [retryGeoloc]);

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', position: 'relative', fontFamily: 'Inter, system-ui, sans-serif', colorScheme: dark ? 'dark' : 'light', background: dark ? '#0F0F12' : '#F5F5F7' }}>
      {showGeoPrompt && <GeolocationPrompt dark={dark} onDismiss={dismissGeoPrompt} />}
      {splash && <SplashScreen onDone={() => setSplash(false)} />}
      {!isOnline && <OfflineBanner savedAt={offlineSavedAt} dark={dark} />}
      {needRefresh[0] && <UpdateToast onUpdate={() => updateServiceWorker(true)} dark={dark} />}

      <div style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
        {tab === 'map' && (
          <Suspense fallback={<div style={{ flex: 1, background: dark ? '#0F0F12' : '#F5F5F7' }} aria-busy="true" aria-label="Chargement de la carte" />}>
            <MapScreen
                mapSpots={allSpots}
                nearestSpot={nearbySpots[0] ?? null}
                userCoords={userCoords}
                dark={dark}
                fontSize={fontSize}
                loading={loading}
                locateTrigger={locateTrigger}
                locationDenied={isLocationDenied || geoState.status === 'error'}
                onLocate={handleLocate}
                onShowGeoPrompt={showGeoPromptModal}
              />
          </Suspense>
        )}
        {tab === 'list' && <ListScreen spots={nearbySpots} userCoords={userCoords} dark={dark} fontSize={fontSize} loading={loading} />}
        {tab === 'settings' && <SettingsScreen dark={dark} fontSize={fontSize} dataUpdatedAt={dataUpdatedAt} onSetDark={handleSetDark} onSetFontSize={handleSetFontSize} />}
      </div>

      <TabBar active={tab} onChange={setTab} dark={dark} fontSize={fontSize} />
    </div>
  );
}
