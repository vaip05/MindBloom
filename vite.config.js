import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  test: {
    environment: 'jsdom',
    // tests/ holds Firestore rules tests that need the emulator and run under node:test.
    include: ['src/**/*.test.{js,jsx}'],
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
