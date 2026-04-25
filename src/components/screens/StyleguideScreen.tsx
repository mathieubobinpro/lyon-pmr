import { useState } from 'react';
import { MapPin, Star, Navigation, Info, Trash2 } from 'lucide-react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Card } from '../ui/Card';
import { IconBadge } from '../ui/IconBadge';
import { PMRSymbol } from '../ui/PMRSymbol';
import { PlaceCard } from '../ui/PlaceCard';
import type { ParkingSpot } from '../../types';

const DEMO_SPOT: ParkingSpot = {
  id: 'demo-1',
  name: 'Bellecour_1',
  coordinates: { lat: 45.757, lng: 4.832 },
  address: 'Place Bellecour',
  postalCode: '69002',
  city: 'Lyon 2e',
  inseeCode: 69382,
  nbPlaces: 3,
  configuration: 'bataille',
  updatedAt: '2025-09-01T00:00:00Z',
  distance: 120,
};

const COLORS = [
  { name: 'Primaire',    hex: '#0066FF', text: '#FFFFFF' },
  { name: 'Succès',      hex: '#00C853', text: '#FFFFFF' },
  { name: 'Alerte',      hex: '#FF8800', text: '#FFFFFF' },
  { name: 'Texte',       hex: '#1A1A1A', text: '#FFFFFF' },
  { name: 'Mid',         hex: '#6B7280', text: '#FFFFFF' },
  { name: 'Fond app',    hex: '#F5F5F7', text: '#1A1A1A' },
  { name: 'Fond sombre', hex: '#0F0F12', text: '#FFFFFF' },
  { name: 'Carte',       hex: '#FFFFFF',  text: '#1A1A1A', border: '#E5E7EB' },
];

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section style={{ marginBottom: 40 }}>
      <h2 style={{ fontSize: 13, fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 16 }}>
        {title}
      </h2>
      {children}
    </section>
  );
}

export function StyleguideScreen() {
  const [dark, setDark] = useState(false);

  const bg   = dark ? '#0F0F12' : '#F5F5F7';
  const text = dark ? '#F0F0F0' : '#1A1A1A';

  return (
    <div style={{ minHeight: '100%', background: bg, color: text, fontFamily: 'Inter, system-ui, sans-serif', padding: '24px 16px 80px' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: '#0066FF', letterSpacing: -0.5 }}>Lyon PMR</h1>
          <p style={{ fontSize: 14, color: '#6B7280', marginTop: 4 }}>Design System · Styleguide</p>
        </div>
        <button
          onClick={() => setDark((d) => !d)}
          style={{
            height: 44, padding: '0 16px', borderRadius: 14, border: `1.5px solid ${dark ? '#444' : '#E5E7EB'}`,
            background: dark ? '#2A2A2A' : '#FFFFFF', color: text, cursor: 'pointer',
            fontSize: 13, fontWeight: 600, fontFamily: 'inherit',
          }}
          aria-pressed={dark}
        >
          {dark ? '☀️ Clair' : '🌙 Sombre'}
        </button>
      </div>

      {/* Couleurs */}
      <Section title="Palette">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
          {COLORS.map((c) => (
            <div key={c.name} style={{ borderRadius: 12, overflow: 'hidden', border: c.border ? `1px solid ${c.border}` : undefined }}>
              <div style={{ height: 56, background: c.hex }} />
              <div style={{ padding: '6px 8px', background: dark ? '#1C1C20' : '#FFFFFF' }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: text }}>{c.name}</div>
                <div style={{ fontSize: 10, color: '#6B7280', fontVariantNumeric: 'tabular-nums' }}>{c.hex}</div>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* Typographie */}
      <Section title="Typographie · Inter">
        {[
          { label: 'Display 34px 800', size: 34, weight: 800 },
          { label: 'Heading 22px 800', size: 22, weight: 800 },
          { label: 'Title 18px 600',   size: 18, weight: 600 },
          { label: 'Body 17px 400',    size: 17, weight: 400 },
          { label: 'Caption 13px 400', size: 13, weight: 400 },
          { label: 'Label 11px 600',   size: 11, weight: 600 },
        ].map(({ label, size, weight }) => (
          <div key={label} style={{ fontSize: size, fontWeight: weight, color: text, marginBottom: 10, lineHeight: 1.3 }}>
            {label} — Lyon PMR
          </div>
        ))}
      </Section>

      {/* Boutons */}
      <Section title="Boutons (min 56px touch)">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <Button variant="primary"   size="lg" fullWidth>CTA Principal (72px)</Button>
          <Button variant="primary"   size="md" fullWidth>Primaire (56px)</Button>
          <Button variant="secondary" size="md" fullWidth>Secondaire</Button>
          <Button variant="ghost"     size="md" fullWidth>Ghost</Button>
          <Button variant="primary"   size="sm">Petit (44px)</Button>
          <Button variant="primary"   size="md" disabled>Désactivé</Button>
        </div>
      </Section>

      {/* Badges */}
      <Section title="Badges">
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <Badge label="3 places"     variant="primary" />
          <Badge label="Voirie"       variant="primary" />
          <Badge label="✓ Accessible" variant="success" />
          <Badge label="⚠ Signalée"  variant="warning" />
          <Badge label="Sombre"       variant="primary" dark />
        </div>
      </Section>

      {/* IconBadge */}
      <Section title="Icon Badge">
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          <IconBadge variant="primary"><PMRSymbol size={26} color="#0066FF" /></IconBadge>
          <IconBadge variant="success"><Navigation size={24} color="#00C853" /></IconBadge>
          <IconBadge variant="warning"><Info size={24} color="#FF8800" /></IconBadge>
          <IconBadge variant="neutral"><Star size={24} color="#6B7280" /></IconBadge>
          <IconBadge size={40}><MapPin size={20} color="#0066FF" /></IconBadge>
        </div>
      </Section>

      {/* Cards */}
      <Section title="Cards">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <Card dark={dark}>
            <div style={{ fontSize: 17, fontWeight: 600, color: text }}>Carte basique</div>
            <div style={{ fontSize: 14, color: '#6B7280', marginTop: 4 }}>Fond blanc, ombre douce, coins 16px</div>
          </Card>
          <Card dark={dark} onClick={() => alert('tap!')}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <IconBadge><PMRSymbol size={24} color="#0066FF" /></IconBadge>
              <div>
                <div style={{ fontSize: 16, fontWeight: 600, color: text }}>Carte interactive</div>
                <div style={{ fontSize: 13, color: '#6B7280' }}>Tap pour interaction</div>
              </div>
            </div>
          </Card>
        </div>
      </Section>

      {/* PlaceCard */}
      <Section title="Place Card (composant liste)">
        <PlaceCard spot={DEMO_SPOT} onSelect={() => {}} dark={dark} />
        <PlaceCard spot={{ ...DEMO_SPOT, id: 'demo-2', address: 'Rue de la République', distance: 280, nbPlaces: 2 }} onSelect={() => {}} dark={dark} />
      </Section>

      {/* FAB */}
      <Section title="FAB (56px, zone pouce)">
        <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
          <button aria-label="Me localiser" style={{
            width: 56, height: 56, borderRadius: '50%', border: 'none', cursor: 'pointer',
            background: dark ? '#2A2A2A' : '#FFFFFF', boxShadow: '0 4px 14px rgba(0,0,0,0.18)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Navigation size={24} color="#0066FF" aria-hidden />
          </button>
          <button aria-label="Supprimer" style={{
            width: 44, height: 44, borderRadius: '50%', border: 'none', cursor: 'pointer',
            background: dark ? '#2A2A2A' : '#FFFFFF', boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Trash2 size={20} color="#FF8800" aria-hidden />
          </button>
        </div>
      </Section>

      {/* Source */}
      <p style={{ fontSize: 12, color: '#6B7280', textAlign: 'center', marginTop: 24 }}>
        Lyon PMR · Métropole de Lyon · Licence Ouverte Etalab v2.0
      </p>
    </div>
  );
}
