import React from 'react';
import Svg, { Defs, LinearGradient, Stop, Ellipse, Rect, Path, G, Text as SvgText, TSpan } from 'react-native-svg';
import { theme } from '../theme';

export interface LogoProps {
  variant?: 'full' | 'icon';
  size?: number;
  title?: string;
}

// Inlined MOBOLULU brand SVG (canonical copy in assets/mobolulu-logo.svg).
export const Logo: React.FC<LogoProps> = ({ variant = 'full', size = 40, title = 'MOBOLULU' }) => {
  if (variant === 'icon') {
    return (
      <Svg height={size} width={size} viewBox="0 0 512 512" role="img" aria-label={title}>
        <Defs>
          <LinearGradient id="awIconBody" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor={theme.colors.brand.light} />
            <Stop offset="45%" stopColor={theme.colors.brand.green} />
            <Stop offset="100%" stopColor={theme.colors.brand.primary} />
          </LinearGradient>
        </Defs>
        <Ellipse cx="256" cy="436" rx="112" ry="12" fill={theme.colors.brand.primary} opacity={0.18} />
        <Rect x="232" y="84" width="48" height="16" rx="8" fill={theme.colors.brand.light} />
        <Rect x="146" y="100" width="220" height="34" rx="16" fill={theme.colors.brand.primary} />
        <Path
          fill="url(#awIconBody)"
          d="M 160 158 L 178 400 Q 181 418 199 418 L 313 418 Q 331 418 334 400 L 352 158 Q 352 146 340 146 L 172 146 Q 160 146 160 158 Z"
        />
        <Rect x="174" y="168" width="16" height="226" rx="8" fill={theme.colors.brand.white} opacity={0.22} />
        <G fill={theme.colors.brand.white} stroke={theme.colors.brand.white} strokeWidth={14} strokeLinecap="round" strokeLinejoin="round">
          <Path d="M 275 262.9 L 305 314.9" fill="none" />
          <Path d="M 280.4 338 L 220.4 338" fill="none" />
          <Path d="M 212.6 305.1 L 242.6 253.1" fill="none" />
          <Path d="M 304 338 L 320 328 L 320 348 Z" fill={theme.colors.brand.white} stroke="none" />
          <Path d="M 199.6 327.6 L 201.9 341.6 L 186.3 332.6 Z" fill={theme.colors.brand.white} stroke="none" />
          <Path d="M 262 240.4 L 264.3 226.4 L 248.7 235.4 Z" fill={theme.colors.brand.white} stroke="none" />
        </G>
      </Svg>
    );
  }

  // full wordmark — icon scaled on the left + "MOBOLULU" text + "GO GREEN" tagline
  return (
    <Svg height={size * 2} width={size * 8} viewBox="0 0 640 200" role="img" aria-label={title}>
      <Defs>
        <LinearGradient id="awLogoBody" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0%" stopColor={theme.colors.brand.light} />
          <Stop offset="45%" stopColor={theme.colors.brand.green} />
          <Stop offset="100%" stopColor={theme.colors.brand.primary} />
        </LinearGradient>
      </Defs>
      <G transform="translate(36 34) scale(0.24)">
        <Ellipse cx="256" cy="436" rx="112" ry="12" fill={theme.colors.brand.primary} opacity={0.18} />
        <Rect x="232" y="84" width="48" height="16" rx="8" fill={theme.colors.brand.light} />
        <Rect x="146" y="100" width="220" height="34" rx="16" fill={theme.colors.brand.primary} />
        <Path
          fill="url(#awLogoBody)"
          d="M 160 158 L 178 400 Q 181 418 199 418 L 313 418 Q 331 418 334 400 L 352 158 Q 352 146 340 146 L 172 146 Q 160 146 160 158 Z"
        />
        <Rect x="174" y="168" width="16" height="226" rx="8" fill={theme.colors.brand.white} opacity={0.22} />
        <G fill={theme.colors.brand.white} stroke={theme.colors.brand.white} strokeWidth={14} strokeLinecap="round" strokeLinejoin="round">
          <Path d="M 275 262.9 L 305 314.9" fill="none" />
          <Path d="M 280.4 338 L 220.4 338" fill="none" />
          <Path d="M 212.6 305.1 L 242.6 253.1" fill="none" />
          <Path d="M 304 338 L 320 328 L 320 348 Z" fill={theme.colors.brand.white} stroke="none" />
          <Path d="M 199.6 327.6 L 201.9 341.6 L 186.3 332.6 Z" fill={theme.colors.brand.white} stroke="none" />
          <Path d="M 262 240.4 L 264.3 226.4 L 248.7 235.4 Z" fill={theme.colors.brand.white} stroke="none" />
        </G>
      </G>
      <SvgText x="184" y="132" fontSize="66" fontWeight="800" letterSpacing="0">
        <TSpan fill={theme.colors.brand.primary}>MOBOLULU</TSpan>
      </SvgText>
      <SvgText x="186" y="160" fontSize="19" fontWeight="700" letterSpacing="7" fill={theme.colors.brand.dark}>
        GO GREEN
      </SvgText>
    </Svg>
  );
};
