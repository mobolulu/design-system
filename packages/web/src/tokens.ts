// Typography-role contract (v0.5, MBLL-134), local copy.
// `packages/tokens` carries the base type scale (fontSize/fontWeight/lineHeight)
// but the *roles* below — the complete, semantic text styles consumed by
// `Text`/`Money` — were only ever added to packages/mobile/src/tokens.ts
// (never ported back into the shared, unpublished packages/tokens package).
// Inlined here, matching values, so web and mobile render the same type scale
// (MBLL-159) and this package stays self-contained the way money.ts/tone.ts
// already do. Keep in sync with packages/mobile/src/tokens.ts `textRoles`.

export interface TextRole {
  fontSize: number;
  fontWeight: '400' | '500' | '600' | '700' | '800';
  lineHeight: number;
  letterSpacing: number;
  tabularNums?: boolean;
}

export const textRoles: Record<
  'display' | 'title' | 'heading' | 'body' | 'label' | 'caption' | 'mono' | 'numeric',
  TextRole
> = {
  display: { fontSize: 34, fontWeight: '800', lineHeight: 40, letterSpacing: -0.5 },
  title: { fontSize: 28, fontWeight: '800', lineHeight: 34, letterSpacing: -0.3 },
  heading: { fontSize: 20, fontWeight: '700', lineHeight: 26, letterSpacing: -0.2 },
  body: { fontSize: 16, fontWeight: '400', lineHeight: 24, letterSpacing: 0 },
  label: { fontSize: 14, fontWeight: '600', lineHeight: 18, letterSpacing: 0.1 },
  caption: { fontSize: 12, fontWeight: '500', lineHeight: 16, letterSpacing: 0.2 },
  mono: { fontSize: 14, fontWeight: '500', lineHeight: 20, letterSpacing: 0 },
  numeric: {
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 24,
    letterSpacing: 0,
    tabularNums: true,
  },
};

export type TextRoleName = keyof typeof textRoles;
