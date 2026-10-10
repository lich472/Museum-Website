import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Intercept any request starting with "/api"
      '/api': {
        target: 'http://localhost:5001', // 👈 Change this port to match your backend port!
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
