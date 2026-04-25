import { type ReactNode } from 'react';
import { Sun, Moon, Type, Info, MapPin, Database } from 'lucide-react';
import type { FontSize } from '../../types';
import { useInstallPrompt } from '../../hooks/useInstallPrompt';

interface Props {
  dark: boolean;
  fontSize: FontSize;
  dataUpdatedAt?: number | null;
  onSetDark: (v: boolean) => void;
  onSetFontSize: (v: FontSize) => void;
}

function SectionTitle({ label }: { label: string }) {
  return (
    <div style={{ padding: '16px 20px 8px', fontSize: 12, fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: 0.8 }}>
      {label}
    </div>
  );
}

function Row({ icon, label, right, dark }: { icon: ReactNode; label: string; right?: ReactNode; dark: boolean }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 14, padding: '16px 20px',
      borderBottom: `1px solid ${dark ? '#2A2A2A' : '#E5E7EB'}`,
    }}>
      <div style={{
        width: 40, height: 40, borderRadius: 12,
        background: '#EEF4FF', display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
      }}>
        {icon}
      </div>
      <div style={{ flex: 1, fontSize: 17, fontWeight: 500, color: dark ? '#F0F0F0' : '#1A1A1A' }}>
        {label}
      </div>
      {right}
    </div>
  );
}

// a11y: switch ARIA pour le toggle
function Toggle({ checked, onChange, label, dark }: { checked: boolean; onChange: (v: boolean) => void; label: string; dark: boolean }) {
  return (
    <label
      aria-label={label}
      style={{ position: 'relative', display: 'inline-block', width: 52, height: 30, cursor: 'pointer', flexShrink: 0 }}
    >
      <input
        type="checkbox"
        role="switch"
        aria-checked={checked}
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        style={{ opacity: 0, width: 0, height: 0, position: 'absolute' }}
      />
      <span style={{
        position: 'absolute', inset: 0, borderRadius: 30,
        background: checked ? '#0066FF' : dark ? '#555' : '#CCC',
        transition: 'background 0.2s',
      }}>
        <span style={{
          position: 'absolute', width: 24, height: 24, borderRadius: '50%',
          background: 'white', top: 3, left: checked ? 25 : 3,
          transition: 'left 0.2s', boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
        }} />
      </span>
    </label>
  );
}

function formatDataDate(ts: number): string {
  return new Date(ts).toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
}

export function SettingsScreen({ dark, fontSize, dataUpdatedAt, onSetDark, onSetFontSize }: Props) {
  const { canInstall, installed, triggerInstall } = useInstallPrompt();

  const FONT_OPTIONS: { value: FontSize; label: string; size: number }[] = [
    { value: 'normal',     label: 'Normal',    size: 15 },
    { value: 'grand',      label: 'Grand',     size: 17 },
    { value: 'tres-grand', label: 'Très grand', size: 19 },
  ];

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
        <h1 style={{ fontSize: 22, fontWeight: 800, color: dark ? '#F0F0F0' : '#1A1A1A' }}>Réglages</h1>
      </div>

      <div style={{ flex: 1, overflowY: 'auto' }}>
        {/* Accessibilité */}
        <SectionTitle label="Accessibilité" />
        <div style={{ background: dark ? '#1E1E1E' : '#FFFFFF' }}>
          <Row
            dark={dark}
            icon={dark ? <Moon size={20} color="#0066FF" aria-hidden /> : <Sun size={20} color="#0066FF" aria-hidden />}
            label="Mode sombre"
            right={<Toggle checked={dark} onChange={onSetDark} label="Activer le mode sombre" dark={dark} />}
          />

          {/* Taille du texte */}
          <Row dark={dark} icon={<Type size={20} color="#0066FF" aria-hidden />} label="Taille du texte" />
          <div style={{
            padding: '4px 20px 14px',
            background: dark ? '#1E1E1E' : '#FFFFFF',
            borderBottom: `1px solid ${dark ? '#2A2A2A' : '#E5E7EB'}`,
          }}>
            {/* a11y: group de boutons radio */}
            <div role="group" aria-label="Taille du texte" style={{ display: 'flex', gap: 10 }}>
              {FONT_OPTIONS.map(({ value, label, size }) => {
                const active = fontSize === value;
                return (
                  <button
                    key={value}
                    onClick={() => onSetFontSize(value)}
                    aria-pressed={active}
                    aria-label={`Taille de texte ${label}`}
                    style={{
                      flex: 1, height: 56, borderRadius: 12,
                      border: `2px solid ${active ? '#0066FF' : dark ? '#333' : '#E5E7EB'}`,
                      background: active ? '#EEF4FF' : 'transparent',
                      color: active ? '#0066FF' : dark ? '#CCC' : '#1A1A1A',
                      fontSize: size, fontWeight: active ? 700 : 500, cursor: 'pointer',
                      fontFamily: 'inherit',
                    }}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Installer l'app */}
        {(canInstall || installed) && (
          <>
            <SectionTitle label="Application" />
            <div style={{ background: dark ? '#1E1E1E' : '#FFFFFF', padding: '14px 20px', borderBottom: `1px solid ${dark ? '#2A2A2A' : '#E5E7EB'}` }}>
              {installed ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ fontSize: 28 }} aria-hidden>✅</span>
                  <div>
                    <div style={{ fontSize: 16, fontWeight: 600, color: dark ? '#F0F0F0' : '#1A1A1A' }}>Application installée</div>
                    <div style={{ fontSize: 13, color: '#6B7280', marginTop: 2 }}>Lyon PMR est disponible sur votre écran d'accueil</div>
                  </div>
                </div>
              ) : (
                <button
                  onClick={triggerInstall}
                  style={{
                    width: '100%', height: 56, borderRadius: 16, border: 'none', cursor: 'pointer',
                    background: '#0066FF', color: '#FFFFFF', fontSize: 16, fontWeight: 700,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                    boxShadow: '0 4px 16px rgba(0,102,255,0.3)',
                  }}
                  aria-label="Installer Lyon PMR sur l'écran d'accueil"
                >
                  <span style={{ fontSize: 22 }} aria-hidden>📲</span>
                  <span>Installer Lyon PMR</span>
                </button>
              )}
            </div>
          </>
        )}

        {/* À propos */}
        <SectionTitle label="À propos" />
        <div style={{ background: dark ? '#1E1E1E' : '#FFFFFF' }}>
          <Row
            dark={dark}
            icon={<Database size={20} color="#0066FF" aria-hidden />}
            label="Données PMR"
            right={
              <span style={{ fontSize: 13, color: dataUpdatedAt ? '#22C55E' : '#6B7280', fontWeight: 600 }}>
                {dataUpdatedAt ? formatDataDate(dataUpdatedAt) : 'Chargement…'}
              </span>
            }
          />
          <Row dark={dark} icon={<Info size={20} color="#0066FF" aria-hidden />} label="Source des données" />
          <div style={{
            padding: '0 20px 16px',
            background: dark ? '#1E1E1E' : '#FFFFFF',
            borderBottom: `1px solid ${dark ? '#2A2A2A' : '#E5E7EB'}`,
          }}>
            <p style={{ fontSize: 13, color: '#6B7280', lineHeight: 1.6, margin: 0 }}>
              Données de stationnement PMR issues de la Métropole de Lyon.<br />
              <strong style={{ color: '#0066FF' }}>Licence Ouverte Etalab v2.0</strong>
            </p>
          </div>
          <Row dark={dark} icon={<MapPin size={20} color="#0066FF" aria-hidden />} label="Version 1.0" />
        </div>

        {/* Footer */}
        <div style={{ padding: '24px 20px', textAlign: 'center' }}>
          <div style={{ fontSize: 32, marginBottom: 8 }} aria-hidden>♿</div>
          <p style={{ fontSize: 13, color: '#6B7280', lineHeight: 1.6, margin: 0 }}>
            Lyon PMR — Pour tous, partout dans la Métropole.
          </p>
        </div>
      </div>
    </div>
  );
}
