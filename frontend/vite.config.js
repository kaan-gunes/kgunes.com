import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [react()],
  build: {
    // Terser ile maksimum minification
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: mode === 'production',
        drop_debugger: true,
        pure_funcs: mode === 'production' ? ['console.log', 'console.info'] : [],
      },
      format: {
        comments: false,
      },
    },
    // Code splitting
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunk - React core
          'vendor-react': ['react', 'react-dom'],
          // Animation libraries
          'vendor-animation': ['framer-motion', 'gsap'],
          // i18n
          'vendor-i18n': ['i18next', 'react-i18next'],
        },
      },
    },
    // Chunk size warning
    chunkSizeWarningLimit: 500,
    // CSS code splitting
    cssCodeSplit: true,
    // Source maps only in dev
    sourcemap: mode !== 'production',
    // Asset inlining threshold (4kb)
    assetsInlineLimit: 4096,
  },
  // Optimize deps
  optimizeDeps: {
    include: ['react', 'react-dom', 'framer-motion', 'gsap'],
  },
}))
