import type { Favorite, FontSize } from '../types';

const KEYS = {
  favorites:  'lyon-pmr:favorites',
  darkMode:   'lyon-pmr:dark-mode',
  fontSize:   'lyon-pmr:font-size',
  visitCount: 'lyon-pmr:visit-count',
} as const;

function get<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw !== null ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function set<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // espace insuffisant, silencieux
  }
}

export const storage = {
  getFavorites:    ()            => get<Favorite[]>(KEYS.favorites, []),
  setFavorites:    (v: Favorite[]) => set(KEYS.favorites, v),
  getDarkMode:     ()            => get<boolean>(KEYS.darkMode, false),
  setDarkMode:     (v: boolean)  => set(KEYS.darkMode, v),
  getFontSize:     ()            => get<FontSize>(KEYS.fontSize, 'normal'),
  setFontSize:     (v: FontSize) => set(KEYS.fontSize, v),
  getVisitCount:   ()            => get<number>(KEYS.visitCount, 0),
  bumpVisitCount:  ()            => set(KEYS.visitCount, get<number>(KEYS.visitCount, 0) + 1),
};
