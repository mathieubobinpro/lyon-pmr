import { describe, it, expect, beforeEach } from 'vitest';
import { storage } from '../../src/lib/storage';

describe('storage', () => {
  beforeEach(() => localStorage.clear());

  it('getDarkMode retourne false par défaut', () => {
    expect(storage.getDarkMode()).toBe(false);
  });

  it('setDarkMode puis getDarkMode retourne la valeur persistée', () => {
    storage.setDarkMode(true);
    expect(storage.getDarkMode()).toBe(true);
  });

  it('getFontSize retourne normal par défaut', () => {
    expect(storage.getFontSize()).toBe('normal');
  });

  it('setFontSize persiste la valeur', () => {
    storage.setFontSize('grand');
    expect(storage.getFontSize()).toBe('grand');
  });

  it('getFavorites retourne [] par défaut', () => {
    expect(storage.getFavorites()).toEqual([]);
  });

  it('setFavorites puis getFavorites retourne les données', () => {
    const favs = [{ id: 'fav-1', spotId: 'spot-1', label: 'Maison', emoji: '🏠', createdAt: 0 }];
    storage.setFavorites(favs);
    expect(storage.getFavorites()).toEqual(favs);
  });

  it('bumpVisitCount incrémente le compteur', () => {
    expect(storage.getVisitCount()).toBe(0);
    storage.bumpVisitCount();
    storage.bumpVisitCount();
    expect(storage.getVisitCount()).toBe(2);
  });
});
