/**
 * Modale affichée quand la permission de géolocalisation est refusée.
 * Détecte la plateforme et affiche des instructions spécifiques.
 * Ne s'affiche jamais si l'utilisateur a déjà choisi "Continuer sans".
 */

interface Props {
  dark?: boolean;
  onDismiss: () => void;
}

type Platform = 'ios' | 'android' | 'desktop';

function detectPlatform(): Platform {
  const ua = navigator.userAgent;
  if (/iPad|iPhone|iPod/.test(ua) && !/Chrome/.test(ua)) return 'ios';
  if (/Android/.test(ua)) return 'android';
  return 'desktop';
}

const INSTRUCTIONS: Record<Platform, string[]> = {
  ios: [
    'Ouvrez l\'app Réglages',
    'Confidentialité et sécurité → Service de localisation',
    'Sélectionnez Safari (ou Chrome)',
    'Choisissez "Lors de l\'utilisation de l\'app"',
    'Revenez ici et rechargez la page',
  ],
  android: [
    'Appuyez sur l\'icône 🔒 dans la barre d\'adresse',
    'Autorisations → Localisation → Autoriser',
    'Rechargez la page',
  ],
  desktop: [
    'Cliquez sur l\'icône 🔒 dans la barre d\'adresse',
    'Autorisations du site → Localisation → Autoriser',
    'Rechargez la page',
  ],
};

export function GeolocationPrompt({ dark = false, onDismiss }: Props) {
  const platform = detectPlatform();
  const steps    = INSTRUCTIONS[platform];

  return (
    /* Backdrop semi-transparent avec blur */
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
      {/* Carte modale */}
      <div style={{
        width: '100%', maxWidth: 360,
        background: dark ? '#1E1E1E' : '#FFFFFF',
        borderRadius: 20,
        padding: '20px 20px 24px',
        boxShadow: '0 8px 40px rgba(0,0,0,0.25)',
        display: 'flex', flexDirection: 'column', alignItems: 'center',
      }}>

        {/* Icône */}
        <div style={{
          width: 52, height: 52, borderRadius: '50%',
          background: '#EEF4FF',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 24, marginBottom: 12,
        }} aria-hidden>
          📍
        </div>

        {/* Titre */}
        <h2
          id="geoloc-title"
          style={{
            fontSize: 18, fontWeight: 800, textAlign: 'center',
            color: dark ? '#F0F0F0' : '#1A1A1A',
            margin: '0 0 6px',
          }}
        >
          Activez votre localisation
        </h2>

        {/* Description */}
        <p
          id="geoloc-desc"
          style={{
            fontSize: 13, color: '#6B7280', textAlign: 'center',
            margin: '0 0 16px', lineHeight: 1.5,
          }}
        >
          Pour trouver les places PMR les plus proches de vous, l'app a besoin de votre position.
        </p>

        {/* Instructions plateforme */}
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
          </p>
          <ol style={{ margin: 0, paddingLeft: 18, display: 'flex', flexDirection: 'column', gap: 5 }}>
            {steps.map((step, i) => (
              <li key={i} style={{
                fontSize: 13, lineHeight: 1.4,
                color: dark ? '#D0D0D0' : '#374151',
              }}>
                {step}
              </li>
            ))}
          </ol>
        </div>

        {/* CTA primaire */}
        <button
          onClick={() => window.location.reload()}
          aria-label="Recharger la page après avoir activé la localisation"
          style={{
            width: '100%', height: 48, borderRadius: 14,
            border: 'none', cursor: 'pointer',
            background: '#0066FF', color: '#FFFFFF',
            fontSize: 15, fontWeight: 700,
            marginBottom: 8,
            WebkitTapHighlightColor: 'transparent',
          }}
          onTouchStart={(e) => { (e.currentTarget as HTMLElement).style.opacity = '0.9'; }}
          onTouchEnd={(e)   => { (e.currentTarget as HTMLElement).style.opacity = '1'; }}
        >
          J'ai activé la localisation → Recharger
        </button>

        {/* CTA secondaire */}
        <button
          onClick={onDismiss}
          aria-label="Continuer sans localisation"
          style={{
            width: '100%', height: 42, borderRadius: 12,
            cursor: 'pointer', background: 'transparent',
            border: `1.5px solid ${dark ? '#333' : '#E5E7EB'}`,
            color: dark ? '#AAA' : '#6B7280',
            fontSize: 14, fontWeight: 500,
            WebkitTapHighlightColor: 'transparent',
          }}
        >
          Continuer sans localisation
        </button>
      </div>
    </div>
  );
}
