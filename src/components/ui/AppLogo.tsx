/**
 * Logo Lyon PMR — pin de localisation bleu, symbole ISA blanc dans cercle intérieur,
 * route en perspective blanche dans la pointe du pin.
 *
 * Variantes :
 *  - "onLight"  : pin bleu + cercle blanc + fauteuil bleu  (fond clair)
 *  - "onBlue"   : pin blanc + cercle bleu + fauteuil blanc (fond #0066FF, splash)
 *  - "onDark"   : pin bleu + cercle #1E1E1E + fauteuil bleu (fond sombre)
 */

interface Props {
  size?: number;
  variant?: 'onLight' | 'onBlue' | 'onDark';
}

export function AppLogo({ size = 80, variant = 'onLight' }: Props) {
  const pinFill  = variant === 'onBlue' ? '#FFFFFF' : '#0066FF';
  const circleFill =
    variant === 'onLight' ? '#FFFFFF' :
    variant === 'onDark'  ? '#1E1E1E' :
    '#0066FF';                          // onBlue : cercle = fond bleu → invisible
  const isaFill  = variant === 'onBlue' ? '#FFFFFF' : '#0066FF';
  const roadStroke = variant === 'onBlue' ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.8)';

  const w = Math.round(size * 100 / 120);

  return (
    <svg
      width={w}
      height={size}
      viewBox="0 0 100 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      focusable="false"
    >
      {/* ── Pin (forme goutte) ──────────────────────────────────────── */}
      <path
        d="M50 5 C27 5,8 24,8 46 C8 68,50 118,50 118 C50 118,92 68,92 46 C92 24,73 5,50 5Z"
        fill={pinFill}
      />

      {/* ── Cercle intérieur ────────────────────────────────────────── */}
      <circle cx="50" cy="44" r="31" fill={circleFill} />

      {/* ── Route en perspective (pointe du pin) ────────────────────── */}
      <path d="M39 77 Q37 95 46 114" stroke={roadStroke} strokeWidth="3.5" strokeLinecap="round" fill="none"/>
      <path d="M61 77 Q63 95 54 114" stroke={roadStroke} strokeWidth="3.5" strokeLinecap="round" fill="none"/>
      <line x1="50" y1="83" x2="50" y2="90"  stroke={roadStroke} strokeWidth="2" strokeLinecap="round"/>
      <line x1="50" y1="97" x2="50" y2="104" stroke={roadStroke} strokeWidth="2" strokeLinecap="round"/>

      {/* ── Symbole ISA (fauteuil roulant dynamique) ────────────────── */}
      {/* Tête */}
      <circle cx="57" cy="26" r="4.5" fill={isaFill} />
      {/* Torse penché en avant */}
      <path d="M59 33 L54 33 L51 42 L55 42 L57 36Z" fill={isaFill} />
      {/* Bras tendu */}
      <path d="M55 37 L65 34 L65 36 L56 39Z" fill={isaFill} />
      {/* Siège + repose-pied */}
      <path d="M51 42 L50 52 L61 52 L61 55 L64 55 L64 50 L54 50 L55 42Z" fill={isaFill} />
      {/* Grande roue arrière (anneau evenodd) */}
      <path
        d="M36 52 A12 12 0 1 0 60 52 A12 12 0 1 0 36 52Z
           M40 52 A8 8 0 1 0 56 52 A8 8 0 1 0 40 52Z"
        fill={isaFill}
        fillRule="evenodd"
      />
      {/* Petite roue avant */}
      <circle cx="63" cy="55" r="3" fill={isaFill} />
    </svg>
  );
}

/** SVG inline pour les marqueurs MapLibre (anchor=bottom). Pas de route (taille trop petite). */
export function pinMarkerSVG(selected: boolean): string {
  const pinFill = selected ? '#0044CC' : '#0066FF';
  return `
    <div style="
      width:32px; height:40px;
      filter: drop-shadow(0 2px 4px rgba(0,0,0,0.28));
      transform: ${selected ? 'scale(1.2)' : 'scale(1)'};
      transform-origin: bottom center;
      transition: transform 0.15s;
      cursor: pointer;
    ">
      <svg width="32" height="40" viewBox="0 0 100 120" xmlns="http://www.w3.org/2000/svg">
        <path d="M50 5 C27 5,8 24,8 46 C8 68,50 118,50 118 C50 118,92 68,92 46 C92 24,73 5,50 5Z" fill="${pinFill}"/>
        <circle cx="50" cy="44" r="31" fill="white"/>
        <circle cx="57" cy="26" r="4.5" fill="${pinFill}"/>
        <path d="M59 33 L54 33 L51 42 L55 42 L57 36Z" fill="${pinFill}"/>
        <path d="M55 37 L65 34 L65 36 L56 39Z" fill="${pinFill}"/>
        <path d="M51 42 L50 52 L61 52 L61 55 L64 55 L64 50 L54 50 L55 42Z" fill="${pinFill}"/>
        <path d="M36 52 A12 12 0 1 0 60 52 A12 12 0 1 0 36 52Z M40 52 A8 8 0 1 0 56 52 A8 8 0 1 0 40 52Z" fill="${pinFill}" fill-rule="evenodd"/>
        <circle cx="63" cy="55" r="3" fill="${pinFill}"/>
      </svg>
    </div>`;
}
