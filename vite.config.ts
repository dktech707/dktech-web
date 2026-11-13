import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    port: 5173,
    strictPort: false,
    // The repository root also holds the untouched source archive
    // (00_START_HERE .. 11_SOURCE_DOCS). Nothing there is part of the app,
    // so keep the dev server from walking into it.
    fs: {
      allow: ['.'],
      deny: ['00_START_HERE/**', '02_CURRENT_BASELINE/**', '08_ARCHIVE_REFERENCES/**', '09_VIDEO/**', '10_REFERENCE_ONLY/**', '11_SOURCE_DOCS/**'],
    },
  },
  build: {
    target: 'es2022',
    cssTarget: 'chrome111',
    assetsInlineLimit: 2048,
  },
})
