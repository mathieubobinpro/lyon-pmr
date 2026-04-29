import { Map, List, Star, Settings } from 'lucide-react';
import type { ActiveTab, FontSize } from '../../types';

interface Props {
  active: ActiveTab;
  onChange: (tab: ActiveTab) => void;
  dark?: boolean;
  fontSize?: FontSize;
}

const TABS: { id: ActiveTab; label: string; Icon: typeof Map }[] = [
  { id: 'map',       label: 'Carte',    Icon: Map },
  { id: 'list',      label: 'Liste',    Icon: List },
  { id: 'favorites', label: 'Favoris',  Icon: Star },
  { id: 'settings',  label: 'Réglages', Icon: Settings },
];

export function TabBar({ active, onChange, dark = false, fontSize = 'normal' }: Props) {
  const labelSize = fontSize === 'tres-grand' ? 13 : 11;

  return (
    // a11y: nav + aria-label pour décrire la zone de navigation
    <nav
      aria-label="Navigation principale"
      style={{
        display: 'flex',
        height: `calc(80px + env(safe-area-inset-bottom, 4px))`,
        paddingBottom: 'env(safe-area-inset-bottom, 4px)',
        flexShrink: 0,
        background: dark ? '#1E1E1E' : '#FFFFFF',
        borderTop: `1px solid ${dark ? '#2A2A2A' : '#E5E7EB'}`,
        boxShadow: '0 -2px 12px rgba(0,0,0,0.06)',
      }}
    >
      {TABS.map(({ id, label, Icon }) => {
        const isActive = active === id;
        return (
          <button
            key={id}
            onClick={() => onChange(id)}
            // a11y: aria-current page pour l'onglet actif
            aria-current={isActive ? 'page' : undefined}
            aria-label={label}
            style={{
              flex: 1,
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              gap: 4, border: 'none', background: 'transparent', cursor: 'pointer',
              color: isActive ? '#0066FF' : dark ? '#666' : '#9CA3AF',
              transition: 'color 0.15s',
              // a11y: cible tactile 56px minimum
              minHeight: 56,
              position: 'relative',
              WebkitTapHighlightColor: 'transparent',
            }}
          >
            <Icon
              size={24}
              strokeWidth={isActive ? 2.5 : 1.8}
              aria-hidden
              fill="none"
            />
            <span style={{ fontSize: labelSize, fontWeight: isActive ? 700 : 500, letterSpacing: 0.1 }}>
              {label}
            </span>
            {/* Indicateur point actif */}
            {isActive && (
              <div style={{
                position: 'absolute', bottom: 6,
                width: 4, height: 4, borderRadius: '50%', background: '#0066FF',
              }} aria-hidden />
            )}
          </button>
        );
      })}
    </nav>
  );
}
