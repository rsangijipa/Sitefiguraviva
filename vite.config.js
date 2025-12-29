import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import galleryMiddleware from './scripts/galleryMiddleware'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), galleryMiddleware()],
  server: {
    host: '0.0.0.0',
    port: 5000,
    allowedHosts: true,
  },
})
