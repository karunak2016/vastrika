import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'https://vastrikaa-api-dzh9fucdb3gtemak.centralindia-01.azurewebsites.net',
        changeOrigin: true,
      },
    },
  },
})
