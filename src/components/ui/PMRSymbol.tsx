interface Props {
  size?: number;
  color?: string;
}

// a11y: aria-hidden car décoratif — le contexte parent porte l'info
export function PMRSymbol({ size = 24, color = '#0066FF' }: Props) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={color}
      aria-hidden="true"
      focusable="false"
    >
      <circle cx="12" cy="4.5" r="2" />
      <path d="M14 10H10L8.5 16H10l.5-2h3l1.5 6H17l-1.5-6h1L18 9h-4z" />
      <path d="M8.5 11.5C7 12.5 6 14.1 6 16a5 5 0 0 0 5 5c2 0 3.8-1.2 4.6-2.9" />
    </svg>
  );
}
