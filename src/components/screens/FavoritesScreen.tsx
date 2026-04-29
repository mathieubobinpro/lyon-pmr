import { useState } from 'react';
import { Trash2 } from 'lucide-react';
import type { ParkingSpot, Favorite, FontSize, Coordinates } from '../../types';
import { DetailSheet } from '../ui/DetailSheet';
import { haversine, formatDistance } from '../../lib/distance';

interface Props {
  spots: ParkingSpot[];
  favorites: Favorite[];
  dark?: boolean;
  fontSize?: FontSize;
  userCoords?: Coordinates | null;
  onRemoveFavorite: (favId: string) => void;
}

export function FavoritesScreen({ spots, favorites, dark = false, fontSize = 'normal', userCoords, onRemoveFavorite }: Props) {
  const [selected, setSelected] = useState<ParkingSpot | null>(null);

  if (selected) {
    return (
      <div style={{ position: 'relative', height: '100%', background: dark ? '#141414' : '#F5F5F7' }}>
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
          <div style={{ flex: 1 }} />
          <DetailSheet
            spot={selected}
            dark={dark}
            fontSize={fontSize}
            userCoords={userCoords}
            onClose={() => setSelected(null)}
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
        <h1 style={{ fontSize: 22, fontWeight: 800, color: dark ? '#F0F0F0' : '#1A1A1A' }}>Mes favoris</h1>
        <p style={{ fontSize: 14, color: '#6B7280' }}>
          {favorites.length} adresse{favorites.length !== 1 ? 's' : ''} enregistrée{favorites.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Contenu */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '12px 16px' }}>
        {favorites.length === 0 ? (
          // Empty state
          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            justifyContent: 'center', height: '60%', gap: 16, textAlign: 'center', padding: '0 24px',
          }}>
            <div style={{ fontSize: 64 }} aria-hidden>⭐</div>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: dark ? '#CCC' : '#1A1A1A' }}>Aucun favori</h2>
            <p style={{ fontSize: 15, color: '#6B7280', maxWidth: 260 }}>
              Ajoutez des places fréquentes pour y accéder en un tap depuis la carte
            </p>
          </div>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }} aria-label="Mes favoris">
            {favorites.map((fav) => {
              const spot = spots.find((s) => s.id === fav.spotId) ?? spots[0];
              const distMeters = (userCoords && spot) ? haversine(userCoords, spot.coordinates) : null;
              return (
                <li
                  key={fav.id}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 14,
                    padding: '14px 16px', borderRadius: 16, marginBottom: 10,
                    background: dark ? '#2A2A2A' : '#FFFFFF',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.07)',
                  }}
                >
                  {/* Emoji */}
                  <div style={{
                    width: 52, height: 52, borderRadius: '50%',
                    background: '#EEF4FF', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 26, flexShrink: 0,
                  }} aria-hidden>{fav.emoji}</div>

                  {/* Infos */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 17, fontWeight: 600, color: dark ? '#F0F0F0' : '#1A1A1A', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {fav.label}
                    </div>
                    <div style={{ fontSize: 13, color: '#6B7280', marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {spot?.address ?? '—'}
                    </div>
                    {spot && distMeters !== null && (
                      <div style={{ fontSize: 13, color: '#0066FF', fontWeight: 600, marginTop: 2 }}>
                        {formatDistance(distMeters)}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flexShrink: 0 }}>
                    <button
                      onClick={() => spot && setSelected(spot)}
                      disabled={!spot}
                      aria-label={`J'y vais — ${fav.label}`}
                      style={{
                        height: 44, padding: '0 16px', borderRadius: 12, border: 'none', cursor: 'pointer',
                        background: '#0066FF', color: '#FFFFFF', fontSize: 13, fontWeight: 700,
                        minWidth: 80,
                      }}
                    >
                      J'y vais
                    </button>
                    <button
                      onClick={() => onRemoveFavorite(fav.id)}
                      aria-label={`Supprimer ${fav.label} des favoris`}
                      style={{
                        height: 36, padding: '0 10px', borderRadius: 10,
                        border: `1px solid ${dark ? '#444' : '#E5E7EB'}`,
                        background: 'transparent', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}
                    >
                      <Trash2 size={15} color="#6B7280" aria-hidden />
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
