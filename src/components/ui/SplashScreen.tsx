import { useEffect } from 'react';
import { AppLogo } from './AppLogo';

interface Props {
  onDone: () => void;
}

export function SplashScreen({ onDone }: Props) {
  useEffect(() => {
    const t = setTimeout(onDone, 1800);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <div
      role="status"
      aria-label="Chargement de Lyon PMR"
      aria-live="polite"
      style={{
        position: 'absolute', inset: 0,
        background: '#FFFFFF',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        zIndex: 999,
        animation: 'fadeIn 0.3s ease',
      }}
    >
      {/* Logo pulsé */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        marginBottom: 28,
        animation: 'pulse 1.2s ease-in-out infinite',
      }}>
        <AppLogo size={120} variant="light" />
      </div>

      {/* Titre : "Lyon" noir + "PMR" bleu — fidèle au logo */}
      <div style={{ fontSize: 36, fontWeight: 800, letterSpacing: -0.5, lineHeight: 1 }}>
        <span style={{ color: '#1A1A1A' }}>Lyon </span>
        <span style={{ color: '#0066FF' }}>PMR</span>
      </div>
      <div style={{ fontSize: 16, color: '#6B7280', marginTop: 10 }}>
        Stationnement accessible
      </div>

      <div style={{
        position: 'absolute', bottom: 'max(32px, env(safe-area-inset-bottom, 32px))',
        fontSize: 13, color: '#9CA3AF', textAlign: 'center', padding: '0 24px',
      }}>
        Métropole de Lyon · Licence Ouverte Etalab
      </div>
    </div>
  );
}
