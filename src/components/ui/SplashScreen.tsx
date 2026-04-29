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
        background: '#0066FF',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        zIndex: 999,
        animation: 'fadeIn 0.3s ease',
      }}
    >
      {/* Logo pulsé — variante "onBlue" : pin blanc sur fond bleu */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        marginBottom: 28,
        animation: 'pulse 1.2s ease-in-out infinite',
      }}>
        <AppLogo size={120} variant="onBlue" />
      </div>

      {/* Titre : "Lyon" blanc + "PMR" blanc (fond bleu) */}
      <div style={{ fontSize: 36, fontWeight: 800, letterSpacing: -0.5, color: '#FFFFFF' }}>
        Lyon PMR
      </div>
      <div style={{ fontSize: 16, color: 'rgba(255,255,255,0.72)', marginTop: 10 }}>
        Stationnement accessible
      </div>

      <div style={{
        position: 'absolute', bottom: 'max(32px, env(safe-area-inset-bottom, 32px))',
        fontSize: 13, color: 'rgba(255,255,255,0.5)', textAlign: 'center', padding: '0 24px',
      }}>
        Métropole de Lyon · Licence Ouverte Etalab
      </div>
    </div>
  );
}
