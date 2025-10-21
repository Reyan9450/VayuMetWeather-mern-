import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Any request starting with /api will be forwarded to the backend
      '/api': {
        target: 'https://vayumet-weather-server.onrender.com/', // Your backend server URL
        changeOrigin: true,
      }
    }
  }
})