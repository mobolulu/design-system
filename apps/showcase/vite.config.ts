import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Relative base so the built site works under GitHub Pages subpath
// (https://mobolulu.github.io/design-system/).
export default defineConfig({
  base: './',
  plugins: [react()],
});
