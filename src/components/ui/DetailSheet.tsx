import { useState } from 'react';
import { X, ExternalLink, Navigation } from 'lucide-react';
import type { ParkingSpot, FontSize } from '../../types';
import { formatDistance, formatWalkTime } from '../../lib/distance';
import { buildNavUrl, NAV_APPS } from '../../lib/routing';
import { Badge } from './Badge';
import { BottomSheet } from './BottomSheet';

interface Props {
  spot: ParkingSpot;
  dark?: boolean;
  fontSize?: FontSize;
  onClose: () => void;
}

const FS_SCALE: Record<FontSize, number> = { normal: 1, grand: 1.1, 'tres-grand': 1.25 };

export function DetailSheet({ spot, dark = false, fontSize = 'normal', onClose }: Props) {
  const [navOpen, setNavOpen] = useState(false);
  const sc = FS_SCALE[fontSize];
  const dist = spot.distance ?? 0;
  const distColor = dist < 300 ? '#00C853' : '#0066FF';

  return (
    <BottomSheet title={`Détail — ${spot.address}`} dark={dark} maxHeight="88vh" onClose={onClose}>
      <div style={{ padding: '16px 20px 0' }}>

        {/* En-tête : temps + bouton fermer */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 4 }}>
          <div>
            <div style={{ fontSize: Math.round(52 * Math.min(sc, 1.1)), fontWeight: 800, color: distColor, lineHeight: 1 }}>
              {formatWalkTime(dist)}
            </div>
            <div style={{ fontSize: Math.round(16 * sc), color: '#6B7280', marginTop: 4 }}>
              {formatDistance(dist)} · À pied
            </div>
          </div>
          {/* a11y: cible 40px min, label explicite */}
          <button
            onClick={onClose}
            aria-label="Fermer le détail"
            style={{
              width: 44, height: 44, borderRadius: '50%', border: 'none', cursor: 'pointer',
              background: dark ? '#333' : '#F0F0F0',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <X size={20} color={dark ? '#CCC' : '#1A1A1A'} aria-hidden />
          </button>
        </div>

        {/* Adresse */}
        <div style={{ fontSize: Math.round(20 * sc), fontWeight: 600, color: dark ? '#F0F0F0' : '#1A1A1A', marginBottom: 14, lineHeight: 1.3 }}>
          {spot.address}{spot.city ? `, ${spot.city}` : ''}
        </div>

        {/* Badges */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
          <Badge label={`${spot.nbPlaces} place${spot.nbPlaces > 1 ? 's' : ''}`} variant="primary" dark={dark} />
          <Badge label={spot.configuration === 'unknown' ? 'Voirie' : spot.configuration} variant="primary" dark={dark} />
          <Badge label="✓ Accessible" variant="success" dark={dark} />
        </div>

        {/* CTA principal — 72px, cible principale */}
        <button
          onClick={() => setNavOpen(true)}
          aria-label="J'y vais — choisir une application de navigation"
          style={{
            width: '100%', height: 72, borderRadius: 20, border: 'none', cursor: 'pointer',
            background: '#0066FF', color: '#FFFFFF',
            fontSize: Math.round(18 * sc), fontWeight: 700,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
            boxShadow: '0 4px 16px rgba(0,102,255,0.35)',
            marginBottom: 12,
            WebkitTapHighlightColor: 'transparent',
          }}
          onTouchStart={(e) => { (e.currentTarget as HTMLElement).style.opacity = '0.9'; }}
          onTouchEnd={(e) =>   { (e.currentTarget as HTMLElement).style.opacity = '1'; }}
        >
          <Navigation size={22} aria-hidden />
          <span>J'y vais !</span>
        </button>

        {/* Fermer */}
        <div style={{ marginBottom: 16 }}>
          <button
            onClick={onClose}
            aria-label="Fermer le détail"
            style={{
              width: '100%', height: 56, borderRadius: 14,
              border: `1.5px solid ${dark ? '#333' : '#E5E7EB'}`,
              background: dark ? '#2A2A2A' : '#FFFFFF', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              color: dark ? '#CCC' : '#6B7280', fontSize: 16, fontWeight: 600,
            }}
          >
            <X size={18} color="#6B7280" aria-hidden />
            Fermer
          </button>
        </div>
      </div>

      {/* Sélecteur de navigation */}
      {navOpen && (
        <div style={{ padding: '0 20px 20px' }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#6B7280', marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.5 }}>
            Ouvrir dans…
          </div>
          {NAV_APPS.map((app) => (
            <a
              key={app.id}
              href={buildNavUrl(spot.coordinates, app.id)}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Naviguer vers ${spot.address} via ${app.label}`}
              style={{
                display: 'flex', alignItems: 'center', gap: 12, padding: '14px 0',
                borderBottom: `1px solid ${dark ? '#333' : '#E5E7EB'}`,
                color: dark ? '#F0F0F0' : '#1A1A1A', textDecoration: 'none',
                fontSize: 17, fontWeight: 500, minHeight: 56,
              }}
            >
              <span style={{ fontSize: 24 }} aria-hidden>{app.emoji}</span>
              <span style={{ flex: 1 }}>{app.label}</span>
              <ExternalLink size={16} color="#6B7280" aria-hidden />
            </a>
          ))}
          <button
            onClick={() => setNavOpen(false)}
            style={{
              marginTop: 14, width: '100%', height: 56, borderRadius: 14,
              border: `1.5px solid ${dark ? '#333' : '#E5E7EB'}`,
              background: 'transparent', color: dark ? '#CCC' : '#6B7280',
              fontSize: 16, fontWeight: 600, cursor: 'pointer',
            }}
            aria-label="Annuler la navigation"
          >
            Annuler
          </button>
        </div>
      )}
    </BottomSheet>
  );
}
