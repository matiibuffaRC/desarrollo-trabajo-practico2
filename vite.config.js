import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    target: 'es2022',
    rolldownOptions: {
      output: {
        // Librerías en chunks propios: cambian poco, así el navegador las mantiene en caché entre deploys
        codeSplitting: {
          groups: [
            { name: 'react', test: /[\/]node_modules[\/](react|react-dom|react-router|react-router-dom|scheduler|cookie|set-cookie-parser)[\/]/, priority: 20 },
            { name: 'charts', test: /[\/]node_modules[\/](recharts|victory-vendor|d3-[^\/]+|internmap|@reduxjs|react-redux|redux|redux-thunk|immer|reselect|es-toolkit|decimal\.js-light|eventemitter3|tiny-invariant|clsx|use-sync-external-store)[\/]/, priority: 10 },
          ],
        },
      },
    },
  },
})
