import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/admin/',
  server: {
    port: 5173,
    strictPort: true,
    proxy: {
      '/api': {
        target: 'http://forsaj-backend:3001',
        changeOrigin: true,
      },
      '/uploads': {
        target: 'http://forsaj-backend:3001',
        changeOrigin: true,
      },
    },
  },
})
