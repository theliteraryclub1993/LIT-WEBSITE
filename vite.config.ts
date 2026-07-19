import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'node:path'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    host: true,
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router-dom')) {
              return 'vendor'
            }
            if (id.includes('@tanstack/react-query')) {
              return 'query'
            }
            if (id.includes('framer-motion')) {
              return 'motion'
            }
            if (id.includes('recharts')) {
              return 'charts'
            }
            if (id.includes('jspdf')) {
              return 'pdf'
            }
          }
        },
      },
    },
  },
})