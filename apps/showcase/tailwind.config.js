import { moboluluPreset } from '@mobolulu/design-system-web/tailwind-preset';

/** @type {import('tailwindcss').Config} */
export default {
  presets: [moboluluPreset],
  content: [
    './index.html',
    './src/**/*.{ts,tsx}',
    // include the published package so its class names are not purged
    './node_modules/@mobolulu/design-system-web/dist/**/*.js',
  ],
};
