/**
 * Modale de géolocalisation en deux temps :
 *
 * 1. Vérifie l'état de la permission via l'API Permissions (si disponible).
 * 2. Si "prompt" (jamais demandé) ou API indisponible → propose "Activer ma position"
 *    qui déclenche la dialog native du navigateur.
 *    → Succès : window.location.reload()
 *    → Refus   : bascule sur la vue instructions manuelles
 * 3. Si "denied" (déjà refusé) → affiche directement les instructions manuelles
 *    (la dialog native ne peut plus réapparaître sans action dans les Réglages).
 */

import { useState, useEffect } from 'react';

interface Props {
  dark?: boolean;
  onDismiss: () => void;
}

type View = 'checking' | 'activate' | 'activating' | 'denied';
type OS      = 'ios' | 'android' | 'desktop';
type Browser = 'safari' | 'chrome' | 'firefox' | 'other';

interface DeviceEnv { os: OS; browser: Browser }
interface InstructionSet { label: string; steps: string[] }

function detectEnv(): DeviceEnv {
  const ua = navigator.userAgent;
  // iPadOS 13+ se présente comme macOS mais a des touch points
  const isIOS = /iPad|iPhone|iPod/.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1);

  if (isIOS) {
    const browser: Browser = /CriOS/.test(ua) ? 'chrome'
      : /FxiOS/.test(ua)  ? 'firefox'
      : /Safari/.test(ua) ? 'safari'
      : 'other';
    return { os: 'ios', browser };
  }
  if (/Android/.test(ua)) {
    const browser: Browser = /Firefox/.test(ua) ? 'firefox'
      : /Chrome/.test(ua) ? 'chrome'
      : 'other';
    return { os: 'android', browser };
  }
  const browser: Browser = /Firefox/.test(ua) ? 'firefox'
    : /Chrome/.test(ua) && !/Edg/.test(ua) ? 'chrome'
    : /Safari/.test(ua) ? 'safari'
    : 'other';
  return { os: 'desktop', browser };
}

function getInstructions({ os, browser }: DeviceEnv): InstructionSet {
  if (os === 'ios') {
    if (browser === 'safari') return {
      label: 'iPhone / iPad · Safari',
      steps: [
        "Ouvrez l'app Réglages",
        'Confidentialité et sécurité → Service de localisation',
        "Faites défiler jusqu'à Safari",
        "Choisissez « Lors de l'utilisation »",
        'Revenez ici et rechargez la page',
      ],
    };
    if (browser === 'chrome') return {
      label: 'iPhone / iPad · Chrome',
      steps: [
        "Ouvrez l'app Réglages",
        "Faites défiler jusqu'à Chrome",
        "Localisation → Lors de l'utilisation",
        'Revenez ici et rechargez la page',
      ],
    };
    if (browser === 'firefox') return {
      label: 'iPhone / iPad · Firefox',
      steps: [
        "Ouvrez l'app Réglages",
        "Faites défiler jusqu'à Firefox",
        "Localisation → Lors de l'utilisation",
        'Revenez ici et rechargez la page',
      ],
    };
    return {
      label: 'iPhone / iPad',
      steps: [
        "Ouvrez l'app Réglages",
        "Faites défiler jusqu'à votre navigateur dans la liste des apps",
        "Localisation → Lors de l'utilisation",
        'Revenez ici et rechargez la page',
      ],
    };
  }

  if (os === 'android') {
    if (browser === 'chrome') return {
      label: 'Android · Chrome',
      steps: [
        "Appuyez sur l'icône 🔒 dans la barre d'adresse",
        'Autorisations → Position → Autoriser',
        'Rechargez la page',
      ],
    };
    if (browser === 'firefox') return {
      label: 'Android · Firefox',
      steps: [
        "Appuyez sur l'icône 🔒 dans la barre d'adresse",
        'Autorisations → Position → Autoriser',
        'Rechargez la page',
      ],
    };
    return {
      label: 'Android',
      steps: [
        'Ouvrez les Réglages Android',
        "Applications → votre navigateur → Autorisations → Position → Autoriser",
        'Rechargez la page',
      ],
    };
  }

  // desktop
  if (browser === 'chrome') return {
    label: 'Chrome',
    steps: [
      "Cliquez sur l'icône 🔒 dans la barre d'adresse",
      'Autorisations du site → Localisation → Autoriser',
      'Rechargez la page',
    ],
  };
  if (browser === 'firefox') return {
    label: 'Firefox',
    steps: [
      "Cliquez sur l'icône 🔒 dans la barre d'adresse",
      "Autoriser à utiliser votre position",
      'Rechargez la page',
    ],
  };
  if (browser === 'safari') return {
    label: 'Safari',
    steps: [
      "Safari → Réglages pour ce site web…",
      'Localisation → Autoriser',
      'Rechargez la page',
    ],
  };
  return {
    label: 'Navigateur',
    steps: [
      "Cliquez sur l'icône 🔒 dans la barre d'adresse",
      "Autorisations / Réglages du site → Localisation → Autoriser",
      'Rechargez la page',
    ],
  };
}

export function GeolocationPrompt({ dark = false, onDismiss }: Props) {
  // Si l'API Permissions est indisponible (vieux Safari), on démarre directement sur 'activate'
  // pour éviter un setState synchrone dans l'effet ci-dessous.
  const [view, setView] = useState<View>(() =>
    typeof navigator !== 'undefined' && !navigator.permissions ? 'activate' : 'checking'
  );
  const env          = detectEnv();
  const instructions = getInstructions(env);

  // Détermine la vue initiale selon l'état réel de la permission (API disponible uniquement)
  useEffect(() => {
    if (!navigator.permissions) return; // Déjà initialisé à 'activate' via le lazy initializer
    navigator.permissions
      .query({ name: 'geolocation' })
      .then((result) => setView(result.state === 'denied' ? 'denied' : 'activate'))
      .catch(() => setView('activate'));
  }, []);

  const handleActivate = () => {
    if (!navigator.geolocation) { setView('denied'); return; }
    setView('activating');
    navigator.geolocation.getCurrentPosition(
      () => window.location.reload(),
      (err) => {
        setView(
          err.code === GeolocationPositionError.PERMISSION_DENIED ? 'denied' : 'activate',
        );
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 },
    );
  };

  // ── Conteneur commun (carte modale) ──────────────────────────────────────────
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="geoloc-title"
      aria-describedby="geoloc-desc"
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(0,0,0,0.5)',
        backdropFilter: 'blur(6px)',
        WebkitBackdropFilter: 'blur(6px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '24px 16px',
      }}
    >
      <div style={{
        width: '100%', maxWidth: 360,
        background: dark ? '#1E1E1E' : '#FFFFFF',
        borderRadius: 20,
        padding: '20px 20px 24px',
        boxShadow: '0 8px 40px rgba(0,0,0,0.25)',
        display: 'flex', flexDirection: 'column', alignItems: 'center',
      }}>

        {/* ── Icône pin commune ── */}
        <div style={{
          width: 52, height: 52, borderRadius: '50%',
          background: '#EEF4FF',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 24, marginBottom: 12,
        }} aria-hidden>
          📍
        </div>

        {/* ── checking : détection en cours ── */}
        {view === 'checking' && (
          <>
            <h2 id="geoloc-title" style={titleStyle(dark)}>Localisation…</h2>
            <div style={{
              width: 28, height: 28, borderRadius: '50%', marginTop: 8,
              border: `3px solid ${dark ? '#334' : '#E0E7FF'}`,
              borderTopColor: '#2563EB',
              animation: 'spin 0.8s linear infinite',
            }} />
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </>
        )}

        {/* ── activate : permission "prompt" ou API indisponible ── */}
        {view === 'activate' && (
          <>
            <h2 id="geoloc-title" style={titleStyle(dark)}>
              Autoriser la localisation
            </h2>
            <p id="geoloc-desc" style={descStyle}>
              Pour trouver les places PMR les plus proches, l'app a besoin de votre position.
              Aucune donnée n'est conservée.
            </p>

            <button
              onClick={handleActivate}
              aria-label="Autoriser la localisation"
              style={primaryBtnStyle}
              onTouchStart={(e) => { (e.currentTarget as HTMLElement).style.opacity = '0.9'; }}
              onTouchEnd={(e)   => { (e.currentTarget as HTMLElement).style.opacity = '1'; }}
            >
              Activer ma position
            </button>

            <button
              onClick={onDismiss}
              aria-label="Continuer sans localisation"
              style={secondaryBtnStyle(dark)}
            >
              Continuer sans localisation
            </button>
          </>
        )}

        {/* ── activating : dialog native ouverte, en attente de réponse ── */}
        {view === 'activating' && (
          <>
            <h2 id="geoloc-title" style={titleStyle(dark)}>Activation en cours…</h2>
            <p id="geoloc-desc" style={descStyle}>
              Autorisez la localisation dans la fenêtre qui vient de s'afficher.
            </p>
            <div style={{
              width: 36, height: 36, borderRadius: '50%', marginTop: 4,
              border: `3px solid ${dark ? '#334' : '#E0E7FF'}`,
              borderTopColor: '#2563EB',
              animation: 'spin 0.8s linear infinite',
            }} />
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </>
        )}

        {/* ── denied : permission déjà refusée → instructions manuelles ── */}
        {view === 'denied' && (
          <>
            <h2 id="geoloc-title" style={titleStyle(dark)}>
              Activez votre localisation
            </h2>
            <p id="geoloc-desc" style={descStyle}>
              La permission a été refusée. Suivez ces étapes pour la réactiver dans vos Réglages.
            </p>

            <div style={{
              width: '100%',
              background: dark ? '#2A2A2A' : '#F5F5F7',
              borderRadius: 12, padding: '12px 14px',
              marginBottom: 16,
            }}>
              <p style={{
                fontSize: 10, fontWeight: 700, color: '#6B7280',
                margin: '0 0 8px', textTransform: 'uppercase', letterSpacing: 0.8,
              }}>
                Comment activer
                <span style={{ fontWeight: 500, textTransform: 'none', opacity: 0.8 }}>
                  {' · '}{instructions.label}
                </span>
              </p>
              <ol style={{ margin: 0, paddingLeft: 18, display: 'flex', flexDirection: 'column', gap: 5 }}>
                {instructions.steps.map((step, i) => (
                  <li key={i} style={{ fontSize: 13, lineHeight: 1.4, color: dark ? '#D0D0D0' : '#374151' }}>
                    {step}
                  </li>
                ))}
              </ol>
            </div>

            <button
              onClick={() => window.location.reload()}
              aria-label="Recharger la page après avoir activé la localisation"
              style={primaryBtnStyle}
              onTouchStart={(e) => { (e.currentTarget as HTMLElement).style.opacity = '0.9'; }}
              onTouchEnd={(e)   => { (e.currentTarget as HTMLElement).style.opacity = '1'; }}
            >
              J'ai activé la localisation → Recharger
            </button>

            <button
              onClick={onDismiss}
              aria-label="Continuer sans localisation"
              style={secondaryBtnStyle(dark)}
            >
              Continuer sans localisation
            </button>
          </>
        )}

      </div>
    </div>
  );
}

// ── Styles partagés ────────────────────────────────────────────────────────────

const titleStyle = (dark: boolean): React.CSSProperties => ({
  fontSize: 18, fontWeight: 800, textAlign: 'center',
  color: dark ? '#F0F0F0' : '#1A1A1A',
  margin: '0 0 6px',
});

const descStyle: React.CSSProperties = {
  fontSize: 13, color: '#6B7280', textAlign: 'center',
  margin: '0 0 16px', lineHeight: 1.5,
};

const primaryBtnStyle: React.CSSProperties = {
  width: '100%', height: 48, borderRadius: 14,
  border: 'none', cursor: 'pointer',
  background: '#0066FF', color: '#FFFFFF',
  fontSize: 15, fontWeight: 700,
  marginBottom: 8,
  WebkitTapHighlightColor: 'transparent',
};

const secondaryBtnStyle = (dark: boolean): React.CSSProperties => ({
  width: '100%', height: 42, borderRadius: 12,
  cursor: 'pointer', background: 'transparent',
  border: `1.5px solid ${dark ? '#333' : '#E5E7EB'}`,
  color: dark ? '#AAA' : '#6B7280',
  fontSize: 14, fontWeight: 500,
  WebkitTapHighlightColor: 'transparent',
});
