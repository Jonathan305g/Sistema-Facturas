import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      // Todas las llamadas a /clientes-api/* se redirigen a ClientesService (5001)
      '/clientes-api': {
        target: 'http://localhost:5001',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/clientes-api/, ''),
      },
      // Todas las llamadas a /ventas-api/* se redirigen a VentasService (5002)
      '/ventas-api': {
        target: 'http://localhost:5002',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/ventas-api/, ''),
      },
    },
  },
})