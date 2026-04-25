interface Props {
  label: string;
  variant?: 'primary' | 'success' | 'warning';
  dark?: boolean;
}

const VARIANTS = {
  primary: { bg: '#EEF4FF', color: '#0066FF' },
  success: { bg: '#E6FAF0', color: '#00C853' },
  warning: { bg: '#FFF4E6', color: '#FF8800' },
} as const;

export function Badge({ label, variant = 'primary', dark = false }: Props) {
  const { bg, color } = VARIANTS[variant];
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '4px 10px',
        borderRadius: 20,
        background: dark ? 'rgba(255,255,255,0.12)' : bg,
        color: dark ? 'rgba(255,255,255,0.9)' : color,
        fontSize: 13,
        fontWeight: 600,
        lineHeight: 1,
        whiteSpace: 'nowrap',
      }}
    >
      {label}
    </span>
  );
}
