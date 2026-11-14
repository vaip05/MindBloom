import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  test: {
    environment: 'jsdom',
    include: ['src/**/*.test.{js,jsx}', 'tests/**/*.test.{js,jsx}'],
    // Needs the Firestore emulator and runs under node:test through test:security.
    exclude: ['tests/firestore.rules.test.js', 'node_modules/**'],
    setupFiles: ['src/testSetup.js'],
  },
  server: {
    host: '127.0.0.1',
    port: 5173,
    strictPort: false,
  },
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      'firebase/app',
      'firebase/auth',
      'firebase/firestore',
    ],
  },
})
