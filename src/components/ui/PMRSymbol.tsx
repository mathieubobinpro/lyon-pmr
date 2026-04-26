interface Props {
  size?: number;
  color?: string;
}

// Symbole ISA (International Symbol of Access) — fauteuil roulant actif
// a11y: aria-hidden car décoratif — le contexte parent porte l'information
export function PMRSymbol({ size = 24, color = '#0066FF' }: Props) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
    >
      {/* Tête */}
      <circle cx="13.5" cy="3" r="2" fill={color} />

      {/* Torse penché en avant (posture active ISA) */}
      <path
        fill={color}
        d="M14.5 6 L12 6 L10.5 10.5 L12.5 10.5 L13.5 7.5 Z"
      />

      {/* Bras tendu vers l'avant */}
      <path
        fill={color}
        d="M12.5 8 L17.5 6.5 L17.5 7.5 L13 9 Z"
      />

      {/* Dossier + siège + repose-pied */}
      <path
        fill={color}
        d="M10.5 10.5 L10 15.5 L15.5 15.5 L15.5 17 L17 17 L17 14.5 L12 14.5 L12.5 10.5 Z"
      />

      {/* Grande roue arrière — anneau plein (fillRule evenodd) */}
      <path
        fill={color}
        fillRule="evenodd"
        d="
          M9 22.5
          C5.41 22.5 2.5 19.59 2.5 16
          C2.5 12.41 5.41 9.5 9 9.5
          C12.59 9.5 15.5 12.41 15.5 16
          C15.5 19.59 12.59 22.5 9 22.5 Z

          M9 20
          C11.21 20 13 18.21 13 16
          C13 13.79 11.21 12 9 12
          C6.79 12 5 13.79 5 16
          C5 18.21 6.79 20 9 20 Z
        "
      />

      {/* Petite roue avant */}
      <circle cx="16.5" cy="17.5" r="1.5" fill={color} />
    </svg>
  );
}
