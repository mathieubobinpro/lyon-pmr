/**
 * Popin affichée quand la géolocalisation est refusée (permission = "denied").
 * Détecte la plateforme et fournit des instructions spécifiques.
 */

interface Props {
  dark?: boolean;
  onDismiss: () => void;
}

function detectPlatform(): 'ios' | 'android' | 'desktop' {
  const ua = navigator.userAgent;
  if (/iPad|iPhone|iPod/.test(ua)) return 'ios';
  if (/Android/.test(ua))          return 'android';
  return 'desktop';
}

const INSTRUCTIONS: Record<'ios' | 'android' | 'desktop', { steps: string[]; canDeepLink: boolean }> = {
  ios: {
    steps: [
      'Ouvrez Réglages sur votre iPhone',
      'Confidentialité et sécurité → Service de localisation',
      'Activez Safari / Chrome → "Lors de l\'utilisation"',
      'Revenez sur cette page et rechargez',
    ],
    canDeepLink: false, // iOS ne permet pas d'ouvrir les Réglages depuis le web
  },
  android: {
    steps: [
      'Appuyez sur l\'icône 🔒 dans la barre d\'adresse',
      'Autorisations → Localisation → Autoriser',
      'Rechargez la page',
    ],
    canDeepLink: false,
  },
  desktop: {
    steps: [
      'Cliquez sur l\'icône 🔒 dans la barre d\'adresse',
      'Autorisations du site → Localisation → Autoriser',
      'Rechargez la page',
    ],
    canDeepLink: false,
  },
};

export function GeolocationPrompt({ dark = false, onDismiss }: Props) {
  const platform  = detectPlatform();
  const { steps } = INSTRUCTIONS[platform];

  const handleActivate = () => {
    // Tentative deep-link sur Android (Chrome uniquement, pas garanti)
    if (platform === 'android') {
      window.location.href = 'intent://settings#Intent;scheme=android-app;package=com.android.settings;end';
    }
    // Sur iOS et desktop, les instructions textuelles sont la seule option fiable
  };

  return (
    /* Backdrop */
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="geoloc-title"
      aria-describedby="geoloc-desc"
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(0,0,0,0.55)',
        backdropFilter: 'blur(6px)',
        display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
        padding: '0 0 env(safe-area-inset-bottom, 0px)',
      }}
    >
      {/* Carte modale */}
      <div style={{
        width: '100%', maxWidth: 480,
        background: dark ? '#1E1E1E' : '#FFFFFF',
        borderRadius: '24px 24px 0 0',
        padding: '28px 24px 32px',
        boxShadow: '0 -8px 40px rgba(0,0,0,0.25)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0,
      }}>

        {/* Handle */}
        <div style={{ width: 40, height: 4, borderRadius: 2, background: dark ? '#444' : '#DDD', marginBottom: 24 }} />

        {/* Icône */}
        <div style={{
          width: 72, height: 72, borderRadius: '50%',
          background: '#EEF4FF',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 36, marginBottom: 20,
        }} aria-hidden>
          📍
        </div>

        {/* Titre */}
        <h2
          id="geoloc-title"
          style={{
            fontSize: 22, fontWeight: 800, textAlign: 'center',
            color: dark ? '#F0F0F0' : '#1A1A1A',
            margin: '0 0 10px',
          }}
        >
          Activez votre localisation
        </h2>

        {/* Sous-titre */}
        <p
          id="geoloc-desc"
          style={{
            fontSize: 15, color: '#6B7280', textAlign: 'center',
            margin: '0 0 24px', lineHeight: 1.5, maxWidth: 320,
          }}
        >
          Pour trouver les places PMR les plus proches de vous, l'app a besoin de votre position.
        </p>

        {/* Instructions selon plateforme */}
        <div style={{
          width: '100%',
          background: dark ? '#2A2A2A' : '#F5F5F7',
          borderRadius: 16, padding: '16px 18px', marginBottom: 24,
        }}>
          <p style={{ fontSize: 13, fontWeight: 700, color: '#6B7280', margin: '0 0 10px', textTransform: 'uppercase', letterSpacing: 0.5 }}>
            Comment activer
          </p>
          <ol style={{ margin: 0, paddingLeft: 18, display: 'flex', flexDirection: 'column', gap: 8 }}>
            {steps.map((step, i) => (
              <li key={i} style={{ fontSize: 14, color: dark ? '#D0D0D0' : '#374151', lineHeight: 1.4 }}>
                {step}
              </li>
            ))}
          </ol>
        </div>

        {/* Bouton primaire */}
        <button
          onClick={handleActivate}
          aria-label="Activer la localisation"
          style={{
            width: '100%', height: 56, borderRadius: 16, border: 'none', cursor: 'pointer',
            background: '#0066FF', color: '#FFFFFF',
            fontSize: 17, fontWeight: 700,
            marginBottom: 12,
            WebkitTapHighlightColor: 'transparent',
          }}
          onTouchStart={(e) => { (e.currentTarget as HTMLElement).style.opacity = '0.9'; }}
          onTouchEnd={(e)   => { (e.currentTarget as HTMLElement).style.opacity = '1'; }}
        >
          Activer la localisation
        </button>

        {/* Bouton secondaire */}
        <button
          onClick={onDismiss}
          aria-label="Continuer sans localisation"
          style={{
            width: '100%', height: 52, borderRadius: 14, cursor: 'pointer',
            background: 'transparent',
            border: `1.5px solid ${dark ? '#333' : '#E5E7EB'}`,
            color: dark ? '#AAA' : '#6B7280',
            fontSize: 16, fontWeight: 500,
            WebkitTapHighlightColor: 'transparent',
          }}
        >
          Continuer sans localisation
        </button>
      </div>
    </div>
  );
}
