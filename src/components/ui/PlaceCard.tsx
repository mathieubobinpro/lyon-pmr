import { ChevronRight } from 'lucide-react';
import type { ParkingSpot, FontSize } from '../../types';
import { formatDistance, formatWalkTime } from '../../lib/distance';
import { PMRSymbol } from './PMRSymbol';

interface Props {
  spot: ParkingSpot;
  onSelect: (spot: ParkingSpot) => void;
  dark?: boolean;
  fontSize?: FontSize;
}

const FS_SCALE: Record<FontSize, number> = { normal: 1, grand: 1.1, 'tres-grand': 1.25 };

export function PlaceCard({ spot, onSelect, dark = false, fontSize = 'normal' }: Props) {
  const sc = FS_SCALE[fontSize];
  const dist = spot.distance ?? 0;
  const distColor = dist < 300 ? '#00C853' : dist < 800 ? '#1A1A1A' : '#1A1A1A';

  return (
    <button
      onClick={() => onSelect(spot)}
      // a11y: label complet pour les lecteurs d'écran
      aria-label={`${spot.address}, à ${formatDistance(dist)}, ${formatWalkTime(dist)} à pied, ${spot.nbPlaces} place${spot.nbPlaces > 1 ? 's' : ''}`}
      style={{
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        gap: 14,
        padding: '16px 18px',
        borderRadius: 16,
        border: 'none',
        cursor: 'pointer',
        textAlign: 'left',
        background: dark ? '#2A2A2A' : '#FFFFFF',
        boxShadow: '0 2px 8px rgba(0,0,0,0.07)',
        marginBottom: 10,
        transition: 'transform 0.12s',
        WebkitTapHighlightColor: 'transparent',
        minHeight: 56,
      }}
      onTouchStart={(e) => { (e.currentTarget as HTMLElement).style.transform = 'scale(0.985)'; }}
      onTouchEnd={(e) =>   { (e.currentTarget as HTMLElement).style.transform = ''; }}
    >
      {/* Icône gauche */}
      <div style={{
        width: 52, height: 52, borderRadius: '50%', flexShrink: 0,
        background: '#EEF4FF',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <PMRSymbol size={26} color="#0066FF" />
      </div>

      {/* Contenu centre */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: Math.round(18 * sc),
          fontWeight: 600,
          color: dark ? '#F0F0F0' : '#1A1A1A',
          lineHeight: 1.3,
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}>
          {spot.address}
        </div>
        <div style={{ fontSize: Math.round(14 * sc), color: '#6B7280', marginTop: 3, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          <span>Voirie</span>
          <span>·</span>
          <span>{spot.nbPlaces} place{spot.nbPlaces > 1 ? 's' : ''}</span>
        </div>
      </div>

      {/* Distance droite */}
      <div style={{ flexShrink: 0, textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 2 }}>
        <div style={{ fontSize: Math.round(20 * sc), fontWeight: 800, color: distColor }}>
          {formatDistance(dist)}
        </div>
        <div style={{ fontSize: Math.round(13 * sc), color: '#6B7280' }}>{formatWalkTime(dist)}</div>
        <ChevronRight size={18} color="#6B7280" aria-hidden />
      </div>
    </button>
  );
}
