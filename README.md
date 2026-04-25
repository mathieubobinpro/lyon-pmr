# Lyon PMR — Stationnement accessible ♿

Application mobile-first PWA pour trouver rapidement une **place de stationnement handicapée (PMR)** dans la Métropole de Lyon.

[![Tests unitaires](https://img.shields.io/badge/tests%20unitaires-63%2F63-brightgreen)](tests/unit)
[![Tests E2E](https://img.shields.io/badge/tests%20E2E-9%2F9-brightgreen)](tests/e2e)
[![Lighthouse Perf](https://img.shields.io/badge/Lighthouse%20Perf-94-green)](#performance)
[![Lighthouse A11y](https://img.shields.io/badge/Lighthouse%20A11y-100-brightgreen)](#accessibilité-wcag-aa)
[![Licence données](https://img.shields.io/badge/données-Licence%20Ouverte%20Etalab%20v2-blue)](https://www.etalab.gouv.fr/licence-ouverte-open-licence/)

---

## Fonctionnalités

- **Carte interactive** (MapLibre GL JS + tuiles CARTO light/dark) avec marqueurs PMR
- **2 700+ places PMR** de la Métropole de Lyon — source ouverte Grand Lyon WFS
- **Géolocalisation** — places triées par distance, rayon progressif selon le zoom
- **Navigation** — ouverture dans Plans Apple, Google Maps ou Waze
- **Favoris** — accès rapide depuis l'écran d'accueil
- **Mode hors-ligne complet** — cache IndexedDB 24 h + bannière de fraîcheur des données
- **Dark mode** et **3 tailles de texte** pour l'accessibilité visuelle
- **PWA installable** sur iOS et Android (icônes, splash screens, manifest complet)

---

## Stack technique

| Couche | Technologie |
|---|---|
| Framework | React 19 + TypeScript 6 |
| Build | Vite 8 + Rolldown |
| Carte | MapLibre GL JS (lazy-loaded, chunk séparé) |
| PWA | vite-plugin-pwa (Workbox generateSW) |
| Cache offline | idb-keyval (IndexedDB) |
| Styles | Inline styles + @fontsource/inter (RGPD) |
| Tests unitaires | Vitest + @testing-library/react |
| Tests E2E | Playwright + @axe-core/playwright |
| Données | Grand Lyon WFS (Licence Ouverte Etalab v2) |
| Géocodage | API Adresse BAN — data.gouv.fr |
| Tuiles | CARTO Basemaps (light_all / dark_all) |
| Déploiement | Vercel (région cdg1 — Paris) |

---

## Architecture

```
src/
├── api/
│   ├── grandlyon.ts    # WFS GetFeature → ParkingSpot[], 20 spots mock
│   └── ban.ts          # Géocodage BAN avec abort signal
├── components/
│   ├── map/MapView.tsx         # MapLibre GL JS, marqueurs SVG, masquage par zoom
│   ├── pwa/
│   │   ├── OfflineBanner.tsx   # Bannière hors-ligne + date du cache
│   │   └── UpdateToast.tsx     # Toast mise à jour SW
│   ├── screens/
│   │   ├── MapScreen.tsx       # Carte + bottom sheet accueil + détail
│   │   ├── ListScreen.tsx      # Liste triée par distance
│   │   ├── FavoritesScreen.tsx
│   │   └── SettingsScreen.tsx  # Dark mode, taille texte, fraîcheur données
│   └── ui/
│       ├── BottomSheet.tsx     # Dialog accessible (focus trap, Escape)
│       ├── DetailSheet.tsx     # Fiche place + CTA "J'y vais !" + nav apps
│       ├── PMRSymbol.tsx       # Icône ISA SVG
│       ├── PlaceCard.tsx       # Carte liste avec distance + temps de marche
│       ├── SplashScreen.tsx
│       └── TabBar.tsx          # 4 onglets, aria-current="page"
├── hooks/
│   ├── useGeolocation.ts      # Géoloc avec fallback centre de Lyon
│   ├── useNearestSpots.ts     # Haversine + filtre rayon + MAX_VISIBLE=200
│   ├── useFavorites.ts        # Favoris en localStorage
│   ├── useOnlineStatus.ts     # Écoute online/offline
│   └── useInstallPrompt.ts    # beforeinstallprompt (Android)
├── lib/
│   ├── distance.ts     # Haversine, formatDistance, formatWalkTime
│   ├── offlineCache.ts # idb-keyval, fraîcheur 24 h, isStale
│   ├── routing.ts      # buildNavUrl (Apple / Google / Waze)
│   └── storage.ts      # localStorage typé (dark, fontSize, favoris)
└── types/index.ts      # ParkingSpot, Coordinates, Favorite, FontSize…
```

---

## Performance (Lighthouse — mobile simulé, build production)

| Métrique | Valeur |
|---|---|
| 🟢 Performance | **94 / 100** |
| 🟢 Accessibility | **100 / 100** |
| 🟢 Best Practices | **92 / 100** |
| First Contentful Paint | 2,1 s |
| Largest Contentful Paint | 2,2 s |
| Total Blocking Time | 190 ms |
| Cumulative Layout Shift | **0** |
| **Bundle initial** | **134 KB gzip** |
| Chunk MapLibre (lazy) | 273 KB gzip |

---

## Stratégies de cache Workbox

| Ressource | Stratégie | TTL |
|---|---|---|
| Tuiles CARTO | CacheFirst | 30 jours / 100 entrées max |
| API Grand Lyon WFS | StaleWhileRevalidate | 24 h |
| API BAN (géocodage) | NetworkFirst (3 s) | — |
| Assets JS/CSS/fonts | Precache (hash immutable) | ∞ |
| `sw.js` | no-cache | — |

---

## Accessibilité (WCAG AA)

- Cibles tactiles **≥ 56 px** (tab bar) et **≥ 72 px** (CTA principal)
- `aria-current="page"` sur l'onglet actif de la tab bar
- Focus trap dans toutes les BottomSheets (`aria-modal`, fermeture Escape)
- `aria-live="polite"` sur le compteur de places
- `aria-label` explicite sur chaque bouton iconique
- Score Lighthouse Accessibility : **100 / 100**
- Audit axe-core (WCAG 2A + 2AA) : **0 violation critique** sur tous les écrans

---

## Données sources

| Donnée | Source | Licence |
|---|---|---|
| Places PMR | [Métropole de Lyon — Open Data](https://data.grandlyon.com) | Licence Ouverte Etalab v2.0 |
| Géocodage adresse | [API Adresse BAN](https://api-adresse.data.gouv.fr) | Licence Ouverte v2.0 |
| Tuiles cartographiques | [CARTO Basemaps](https://carto.com/basemaps) | Voir CARTO ToS |

---

## Démarrage rapide

```bash
# Prérequis : Node 20+, pnpm 10+
pnpm install

# Développement (hot reload)
pnpm dev

# Tests unitaires avec couverture
pnpm test

# Tests E2E Playwright (iPhone 12 + axe-core)
pnpm test:e2e

# Build production
pnpm build

# Regénérer toutes les icônes PWA + splash screens
node scripts/generate-icons.mjs
```

---

## Déploiement

Le projet est configuré pour [Vercel](https://vercel.com) :

```bash
vercel --prod
```

Configuration `vercel.json` :
- Région **cdg1** (Paris) pour minimiser la latence
- Headers `Cache-Control` optimisés (assets immutables 1 an, `sw.js` no-cache)
- CSP stricte (`connect-src` limité aux APIs nécessaires)
- Rewrite SPA (`/* → /index.html`)

---

## Licence

**Code source** : MIT  
**Données PMR** : [Licence Ouverte Etalab v2.0](https://www.etalab.gouv.fr/licence-ouverte-open-licence/) — Métropole de Lyon
