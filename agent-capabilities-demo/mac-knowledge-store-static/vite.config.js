import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './', // Use relative paths for assets - enables opening index.html directly
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    // Generate a single index.html with inlined assets for maximum portability
    rollupOptions: {
      output: {
        manualChunks: undefined,
      },
    },
  },
  server: {
    port: 3001,
    open: true,
  },
})

