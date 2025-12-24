import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react({
    jsxRuntime: 'classic'
  })],
  optimizeDeps: {
    esbuildOptions: {
      target: 'es2020'
    },
    include: ['prop-types', 'react/jsx-runtime', 'react', 'react-dom']
  },
  build: {
    target: 'es2020',
    commonjsOptions: {
      include: ['prop-types', 'react', 'react-dom'],
      transformMixedEsModules: true
    }
  }
})
