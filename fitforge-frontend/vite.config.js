import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    // This forces Vite to only use ONE copy of React, ignoring any others it finds
    dedupe: ['react', 'react-dom']
  }
})