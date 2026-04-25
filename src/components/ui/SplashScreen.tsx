import { useEffect } from 'react';
import { PMRSymbol } from './PMRSymbol';

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
      {/* Logo pulsé */}
      <div style={{
        width: 100, height: 100, borderRadius: 30,
        background: 'rgba(255,255,255,0.15)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        marginBottom: 24,
        animation: 'pulse 1.2s ease-in-out infinite',
      }}>
        <PMRSymbol size={56} color="#FFFFFF" />
      </div>

      <div style={{ fontSize: 34, fontWeight: 800, color: '#FFFFFF', letterSpacing: -0.5 }}>
        Lyon PMR
      </div>
      <div style={{ fontSize: 17, color: 'rgba(255,255,255,0.72)', marginTop: 8 }}>
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
