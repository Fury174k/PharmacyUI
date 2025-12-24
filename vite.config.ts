import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    esbuildOptions: {
      target: 'es2020'
    },
    include: ['prop-types']
  },
  build: {
    target: 'es2020',
    commonjsOptions: {
      include: ['prop-types'],
      transformMixedEsModules: true
    }
  }
})
