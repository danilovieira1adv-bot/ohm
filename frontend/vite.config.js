import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
export default defineConfig({
  plugins: [react()],
  preview: { port: 4000, host: true },
  server: { port: 4000, host: true }
})
