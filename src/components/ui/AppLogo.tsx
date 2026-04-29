/**
 * Logo principal Lyon PMR — pin de localisation avec symbole ISA et route.
 * Utilisé dans SplashScreen, future page À propos, etc.
 */

interface Props {
  /** Hauteur du pin SVG (largeur calculée proportionnellement) */
  size?: number;
  /** Variante couleur du logo */
  variant?: 'light' | 'dark';
}

export function AppLogo({ size = 80, variant = 'light' }: Props) {
  const pinBlue   = '#0066FF';
  const iconColor = variant === 'light' ? '#FFFFFF' : '#111111';
  const w = size * 0.78; // ratio largeur/hauteur du pin

  return (
    <svg
      width={w}
      height={size}
      viewBox="0 0 78 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      focusable="false"
    >
      {/* ── Pin shape ──────────────────────────────────────────────── */}
      <path
        d="M39 2C21.33 2 7 16.33 7 34
           C7 55 39 98 39 98
           S71 55 71 34
           C71 16.33 56.67 2 39 2Z"
        fill={pinBlue}
      />

      {/* ── Route au bas du pin ─────────────────────────────────────── */}
      <path
        d="M26 74 Q31 66 39 63 Q47 60 52 52"
        stroke={iconColor}
        strokeWidth="3.5"
        strokeLinecap="round"
        opacity="0.65"
        fill="none"
      />

      {/* ── Tête ────────────────────────────────────────────────────── */}
      <circle cx="43" cy="16" r="5.5" fill={iconColor} />

      {/* ── Torse penché en avant (ISA dynamique) ───────────────────── */}
      <path
        d="M44 23 L40 23 L38 30 L40.5 30 L42 25.5Z"
        fill={iconColor}
      />

      {/* ── Bras tendu ──────────────────────────────────────────────── */}
      <path
        d="M41 26 L50 23.5 L50 25 L41.5 27.5Z"
        fill={iconColor}
      />

      {/* ── Siège + repose-pied ─────────────────────────────────────── */}
      <path
        d="M38 30 L37.5 37 L45 37 L45 39 L47.5 39 L47.5 35.5 L40 35.5 L40.5 30Z"
        fill={iconColor}
      />

      {/* ── Grande roue arrière (anneau via evenodd) ─────────────────── */}
      <path
        d="M29 48 C22.93 48 18 43.07 18 37 C18 30.93 22.93 26 29 26
           C35.07 26 40 30.93 40 37 C40 43.07 35.07 48 29 48Z
           M29 45 C33.42 45 37 41.42 37 37 C37 32.58 33.42 29 29 29
           C24.58 29 21 32.58 21 37 C21 41.42 24.58 45 29 45Z"
        fill={iconColor}
        fillRule="evenodd"
      />

      {/* ── Petite roue avant ───────────────────────────────────────── */}
      <circle cx="46.5" cy="39.5" r="2.5" fill={iconColor} />
    </svg>
  );
}
