import { useState } from 'react';
import type { ParkingSpot, Favorite, FontSize } from '../../types';
import { PlaceCard } from '../ui/PlaceCard';
import { DetailSheet } from '../ui/DetailSheet';

interface Props {
  spots: ParkingSpot[];
  favorites: Favorite[];
  dark?: boolean;
  fontSize?: FontSize;
  loading?: boolean;
  onToggleFavorite: (spot: ParkingSpot) => void;
}

// Skeleton card — même hauteur qu'une PlaceCard (~86px) pour éviter le CLS
function SkeletonCard({ dark }: { dark: boolean }) {
  const bg = dark ? '#2A2A2A' : '#FFFFFF';
  const pulse = dark ? '#333' : '#E5E7EB';
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 14,
      padding: '16px 18px', borderRadius: 16,
      background: bg, boxShadow: '0 2px 8px rgba(0,0,0,0.07)',
      marginBottom: 10, minHeight: 86,
    }}>
      {/* Cercle avatar */}
      <div style={{ width: 52, height: 52, borderRadius: '50%', background: pulse, flexShrink: 0 }} />
      {/* Lignes de texte */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{ height: 16, borderRadius: 6, background: pulse, width: '70%' }} />
        <div style={{ height: 12, borderRadius: 6, background: pulse, width: '45%' }} />
      </div>
      {/* Distance placeholder */}
      <div style={{ width: 44, height: 20, borderRadius: 6, background: pulse, flexShrink: 0 }} />
    </div>
  );
}

export function ListScreen({ spots, favorites, dark = false, fontSize = 'normal', loading = false, onToggleFavorite }: Props) {
  const [selected, setSelected] = useState<ParkingSpot | null>(null);
  const isFavorite = (spot: ParkingSpot) => favorites.some((f) => f.spotId === spot.id);

  if (selected) {
    return (
      <div style={{ position: 'relative', height: '100%', background: dark ? '#141414' : '#F5F5F7' }}>
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
          <div style={{ flex: 1 }} />
          <DetailSheet
            spot={selected}
            isFavorite={isFavorite(selected)}
            dark={dark}
            fontSize={fontSize}
            onClose={() => setSelected(null)}
            onToggleFavorite={onToggleFavorite}
          />
        </div>
      </div>
    );
  }

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: dark ? '#141414' : '#F5F5F7' }}>
      {/* En-tête */}
      <div style={{
        padding: '20px 20px 14px',
        paddingTop: 'max(20px, env(safe-area-inset-top, 20px))',
        background: dark ? '#1E1E1E' : '#FFFFFF',
        borderBottom: `1px solid ${dark ? '#333' : '#E5E7EB'}`,
        flexShrink: 0,
      }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: dark ? '#F0F0F0' : '#1A1A1A', marginBottom: 2 }}>
          Places à proximité
        </h1>
        <p style={{ fontSize: 14, color: '#6B7280' }} aria-live="polite">
          {loading
            ? 'Chargement des places…'
            : `${spots.length} place${spots.length !== 1 ? 's' : ''} PMR trouvée${spots.length !== 1 ? 's' : ''} · Triées par distance`}
        </p>
      </div>

      {/* Liste */}
      <div
        role="list"
        aria-label="Places PMR à proximité"
        aria-busy={loading}
        style={{ flex: 1, overflowY: 'auto', padding: '12px 16px' }}
      >
        {loading ? (
          /* Skeletons pendant le fetch */
          Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} dark={dark} />)
        ) : spots.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 24px', color: '#6B7280' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🅿️</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: dark ? '#CCC' : '#1A1A1A', marginBottom: 8 }}>
              Aucune place trouvée
            </div>
            <div style={{ fontSize: 15 }}>Élargissez le rayon de recherche ou déplacez-vous.</div>
          </div>
        ) : (
          spots.map((spot) => (
            <div role="listitem" key={spot.id}>
              <PlaceCard spot={spot} onSelect={setSelected} dark={dark} fontSize={fontSize} />
            </div>
          ))
        )}
        <div style={{ height: 8 }} />
        {!loading && (
          <p style={{ textAlign: 'center', fontSize: 12, color: '#6B7280', padding: '8px 0 16px' }}>
            Source : Métropole de Lyon — Licence Ouverte Etalab
          </p>
        )}
      </div>
    </div>
  );
}
