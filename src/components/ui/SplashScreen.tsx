import { useEffect } from 'react';

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
      {/* P dans un cercle blanc */}
      <div style={{
        width: 80, height: 80, borderRadius: '50%',
        border: '3px solid #FFFFFF',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        marginBottom: 20,
      }}>
        <span style={{
          fontSize: 40, fontWeight: 900, color: '#FFFFFF',
          lineHeight: 1, fontFamily: 'system-ui, -apple-system, sans-serif',
        }}>P</span>
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
