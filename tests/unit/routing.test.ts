import { describe, it, expect } from 'vitest';
import { buildNavUrl, NAV_APPS } from '../../src/lib/routing';

const COORDS = { lat: 45.764, lng: 4.835 };

describe('buildNavUrl', () => {
  it('construit une URL Apple Plans', () => {
    const url = buildNavUrl(COORDS, 'apple');
    expect(url).toContain('maps://');
    expect(url).toContain('45.764');
    expect(url).toContain('4.835');
  });

  it('construit une URL Google Maps', () => {
    const url = buildNavUrl(COORDS, 'google');
    expect(url).toContain('google.com/maps');
    expect(url).toContain('45.764');
  });

  it('construit une URL Waze', () => {
    const url = buildNavUrl(COORDS, 'waze');
    expect(url).toContain('waze.com');
    expect(url).toContain('45.764');
  });
});

describe('NAV_APPS', () => {
  it('contient 3 applications', () => {
    expect(NAV_APPS).toHaveLength(3);
  });

  it('chaque app a un id, un label et un emoji', () => {
    for (const app of NAV_APPS) {
      expect(app.id).toBeTruthy();
      expect(app.label).toBeTruthy();
      expect(app.emoji).toBeTruthy();
    }
  });
});
