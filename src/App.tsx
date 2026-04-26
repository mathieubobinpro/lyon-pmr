import '@fontsource/inter/400.css';
import '@fontsource/inter/600.css';
import '@fontsource/inter/800.css';
import './styles/index.css';

import { useState, useEffect, useCallback, lazy, Suspense } from 'react';
// @ts-expect-error — type fourni par vite-plugin-pwa au runtime
import { useRegisterSW } from 'virtual:pwa-register/react';

import type { ParkingSpot, ActiveTab, FontSize } from './types';
import { fetchParkingSpots, MOCK_SPOTS } from './api/grandlyon';
import { cacheSpots, getCachedSpots } from './lib/offlineCache';
import { storage } from './lib/storage';
import { useGeolocation } from './hooks/useGeolocation';
import { useNearestSpots } from './hooks/useNearestSpots';
import { useOnlineStatus } from './hooks/useOnlineStatus';

import { TabBar } from './components/ui/TabBar';
import { SplashScreen } from './components/ui/SplashScreen';
const MapScreen = lazy(() => import('./components/screens/MapScreen').then((m) => ({ default: m.MapScreen })));
import { ListScreen } from './components/screens/ListScreen';
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
  const [locateTrigger, setLocateTrigger] = useState(0);

  const isOnline = useOnlineStatus();
  const { coords: userCoords, retry: retryGeoloc } = useGeolocation();
  const nearbySpots = useNearestSpots(allSpots, userCoords, 2000);

  const { needRefresh, updateServiceWorker } = useRegisterSW({
    onRegistered: () => console.info('[Lyon PMR] SW enregistré'),
    onRegisterError: (e: unknown) => console.warn('[Lyon PMR] SW erreur', e),
  });

  useEffect(() => {
    (async () => {
      const { spots: cached, savedAt, isStale } = await getCachedSpots();
      if (cached.length > 0) {
        setAllSpots(cached);
        setOfflineSavedAt(savedAt);
        setDataUpdatedAt(savedAt);
        setLoading(false);
      }
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
      {splash && <SplashScreen onDone={() => setSplash(false)} />}
      {!isOnline && <OfflineBanner savedAt={offlineSavedAt} dark={dark} />}
      {needRefresh[0] && <UpdateToast onUpdate={() => updateServiceWorker(true)} dark={dark} />}

      <div style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
        {tab === 'map' && (
          <Suspense fallback={<div style={{ flex: 1, background: dark ? '#0F0F12' : '#F5F5F7' }} aria-busy="true" aria-label="Chargement de la carte" />}>
            <MapScreen spots={nearbySpots} userCoords={userCoords} dark={dark} fontSize={fontSize} locateTrigger={locateTrigger} onLocate={handleLocate} />
          </Suspense>
        )}
        {tab === 'list' && <ListScreen spots={nearbySpots} dark={dark} fontSize={fontSize} loading={loading} />}
        {tab === 'settings' && <SettingsScreen dark={dark} fontSize={fontSize} dataUpdatedAt={dataUpdatedAt} onSetDark={handleSetDark} onSetFontSize={handleSetFontSize} />}
      </div>

      <TabBar active={tab} onChange={setTab} dark={dark} fontSize={fontSize} />
    </div>
  );
}
