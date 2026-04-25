import { describe, it, expect } from 'vitest';
import { haversine, formatDistance, formatWalkTime } from '../../src/lib/distance';

describe('haversine', () => {
  it('retourne 0 pour deux points identiques', () => {
    expect(haversine({ lat: 45.764, lng: 4.835 }, { lat: 45.764, lng: 4.835 })).toBe(0);
  });

  it('calcule ~391 km entre Lyon et Paris', () => {
    const dist = haversine({ lat: 45.764, lng: 4.835 }, { lat: 48.856, lng: 2.352 });
    expect(dist).toBeGreaterThan(390_000);
    expect(dist).toBeLessThan(395_000);
  });

  it('est symétrique', () => {
    const a = { lat: 45.764, lng: 4.835 };
    const b = { lat: 45.770, lng: 4.840 };
    expect(haversine(a, b)).toBeCloseTo(haversine(b, a), 0);
  });
});

describe('formatDistance', () => {
  it('affiche en mètres sous 1 km', () => {
    expect(formatDistance(350)).toBe('350 m');
  });

  it('affiche en km au-dessus de 1 km', () => {
    expect(formatDistance(1500)).toBe('1.5 km');
  });
});

describe('formatWalkTime', () => {
  it('affiche en minutes pour moins d\'1h', () => {
    expect(formatWalkTime(400)).toBe('5 min');
  });

  it('affiche en heures et minutes au-delà', () => {
    expect(formatWalkTime(6000)).toBe('1h15');
  });
});
