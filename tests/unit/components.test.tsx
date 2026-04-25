import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Badge } from '../../src/components/ui/Badge';
import { Button } from '../../src/components/ui/Button';
import { Card } from '../../src/components/ui/Card';
import { IconBadge } from '../../src/components/ui/IconBadge';
import { PMRSymbol } from '../../src/components/ui/PMRSymbol';

describe('Badge', () => {
  it('affiche le label', () => {
    render(<Badge label="3 places" />);
    expect(screen.getByText('3 places')).toBeTruthy();
  });

  it('applique la variante success', () => {
    render(<Badge label="Accessible" variant="success" />);
    const el = screen.getByText('Accessible');
    expect((el as HTMLElement).style.color).toBe('rgb(0, 200, 83)');
  });
});

describe('Button', () => {
  it('affiche le texte enfant', () => {
    render(<Button>J'y vais</Button>);
    expect(screen.getByText("J'y vais")).toBeTruthy();
  });

  it('déclenche onClick au clic', () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Clic</Button>);
    fireEvent.click(screen.getByText('Clic'));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it('est désactivé si disabled=true', () => {
    render(<Button disabled>Désactivé</Button>);
    expect((screen.getByText('Désactivé') as HTMLButtonElement).disabled).toBe(true);
  });

  it('prend toute la largeur avec fullWidth', () => {
    render(<Button fullWidth>Pleine largeur</Button>);
    const btn = screen.getByText('Pleine largeur') as HTMLElement;
    expect(btn.style.width).toBe('100%');
  });
});

describe('Card', () => {
  it('rend son contenu', () => {
    render(<Card><span>Contenu carte</span></Card>);
    expect(screen.getByText('Contenu carte')).toBeTruthy();
  });

  it('est interactif avec onClick', () => {
    const onClick = vi.fn();
    render(<Card onClick={onClick}><span>Clic</span></Card>);
    fireEvent.click(screen.getByText('Clic'));
    expect(onClick).toHaveBeenCalledOnce();
  });
});

describe('IconBadge', () => {
  it('rend le contenu dans un cercle', () => {
    render(<IconBadge><span>X</span></IconBadge>);
    expect(screen.getByText('X')).toBeTruthy();
  });
});

describe('PMRSymbol', () => {
  it('rend un SVG aria-hidden', () => {
    const { container } = render(<PMRSymbol />);
    const svg = container.querySelector('svg');
    expect(svg).toBeTruthy();
    expect(svg!.getAttribute('aria-hidden')).toBe('true');
  });

  it('applique la couleur et la taille', () => {
    const { container } = render(<PMRSymbol size={32} color="#FF0000" />);
    const svg = container.querySelector('svg')!;
    expect(svg.getAttribute('width')).toBe('32');
    expect(svg.getAttribute('fill')).toBe('#FF0000');
  });
});
