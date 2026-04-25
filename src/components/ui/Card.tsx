import { type ReactNode } from 'react';

interface Props {
  children: ReactNode;
  dark?: boolean;
  onClick?: () => void;
  padding?: string;
  className?: string;
}

export function Card({ children, dark = false, onClick, padding = '16px 18px' }: Props) {
  const isInteractive = Boolean(onClick);
  return (
    <div
      role={isInteractive ? 'button' : undefined}
      tabIndex={isInteractive ? 0 : undefined}
      onClick={onClick}
      onKeyDown={isInteractive ? (e) => { if (e.key === 'Enter' || e.key === ' ') onClick?.(); } : undefined}
      style={{
        background: dark ? '#2A2A2A' : '#FFFFFF',
        borderRadius: 16,
        boxShadow: '0 2px 8px rgba(0,0,0,0.07)',
        padding,
        cursor: isInteractive ? 'pointer' : 'default',
        transition: isInteractive ? 'transform 0.12s' : undefined,
        WebkitTapHighlightColor: 'transparent',
      }}
      onTouchStart={isInteractive ? (e) => { (e.currentTarget as HTMLElement).style.transform = 'scale(0.985)'; } : undefined}
      onTouchEnd={isInteractive ? (e) => { (e.currentTarget as HTMLElement).style.transform = ''; } : undefined}
    >
      {children}
    </div>
  );
}
