# MOBOLULU Design System

Shared brand tokens and component libraries for the MOBOLULU platform, so the
Next.js admin dashboard and the Expo/React-Native apps look identical and stay in
sync.

This repo publishes **two** npm packages (to the GitHub Packages / GHCR npm
registry, scoped `@mobolulu`):

| Package | For | Stack |
|---|---|---|
| `@mobolulu/design-system-web` | Admin dashboard (Next.js) | React + Tailwind CSS |
| `@mobolulu/design-system-mobile` | Client & collector apps (Expo) | React Native |

The brand palette is derived from the MOBOLULU logo/icon SVGs in `assets/`.

## Packages

- `packages/tokens` — **internal** (not published). Single source of truth for
  colors, spacing, radii, typography, shadows, and status mappings. Both web and
  mobile import from here.
- `packages/web` — Tailwind preset (`moboluluPreset`) + React components.
- `packages/mobile` — RN `theme` object + React Native components.

## Consuming the web package

```ts
// tailwind.config.ts
import { moboluluPreset } from '@mobolulu/design-system-web';

export default {
  presets: [moboluluPreset],
  content: ['./src/**/*.{ts,tsx}'],
};
```

```tsx
import { Button, StatusPill } from '@mobolulu/design-system-web';

<Button variant="primary">Save</Button>
<StatusPill status="VERIFIED" />
```

## Consuming the mobile package

```tsx
import { Button, StatusPill, theme } from '@mobolulu/design-system-mobile';

<Button variant="primary">Save</Button>
<StatusPill status="VERIFIED" />
```

## Money, bags, offline

One implementation of the things all four apps must render identically
(MBLL-38):

- **Money** — `formatRupiah(50000)` → `Rp 50.000` (Indonesian dot grouping,
  no decimals). Input is integer minor units of rupiah exactly as the backend
  sends it (`amountMinor`, `MoneyMinor`); a fractional amount **throws**
  rather than renders a rounded — wrong — number. `formatMinorUnits` gives
  the grouped digits without the `Rp` prefix for sentences that carry the
  currency themselves.
- **Bag counts** — `formatBagCount(1200)` → `1.200`. Integer-only, matching
  `BagCount` in `@mobolulu/shared`.
- **Offline state** — `OfflineBanner` ("everything you do is saved on this
  phone…") and `PendingSyncBadge` ("3 scans waiting to send"), shared by the
  collector and disposal apps so "captured locally, not yet delivered" looks
  and reads the same in both. Both render `null` when there is nothing to
  say, so screens can mount them unconditionally.
- **Glove targets** — `Button size="xl"` is the 56dp target XCUT-NFR-007/008
  require for the collector in the street and the gate operator.

Available from both `@mobolulu/design-system-web` and
`@mobolulu/design-system-mobile` (money and bag counts; the offline
components are mobile-only).

## Tests

```bash
npm ci
npm test --workspaces --if-present
```

Component tests use Jest with React Native Testing Library; the money and
token tests are pure Jest.

## Development

```bash
npm ci
npm run build --workspaces
```

## Renaming from `@airwaste` (v0.3.0)

The packages were previously published as `@airwaste/design-system-web` and
`@airwaste/design-system-mobile`. v0.3.0 renames the scope to `@mobolulu`
and rebrands AirWaste → MOBOLULU throughout. The last `@airwaste/*`
versions remain on the registry, so existing consumers keep working until
they migrate.

## Publishing

Tag a release and push it:

```bash
git tag v0.1.0
git push origin v0.1.0
```

The `publish.yml` workflow builds all workspaces and publishes both packages at
the tag version. Consumers authenticate to `npm.pkg.github.com` with a token that
has `read:packages`.
