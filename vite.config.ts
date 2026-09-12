import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Firebase SDK is large (~600KB); isolate it so it can be cached independently
          'firebase-core': ['firebase/app', 'firebase/auth', 'firebase/firestore', 'firebase/storage'],
          // React/React-DOM are stable and benefit from long cache lives
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
        },
      },
    },
  },
});
