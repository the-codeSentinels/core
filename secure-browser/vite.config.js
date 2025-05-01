// secure-browser/vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig(({ mode }) => ({
  // in prod we load assets relative to the HTML file
  base: mode === 'production' ? './' : '/',
  plugins: [
    react()
  ],
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        interviewer: resolve(__dirname, 'interviewer.html')
      }
    }
  },
  server: {
    port: 5173
  }
}));
